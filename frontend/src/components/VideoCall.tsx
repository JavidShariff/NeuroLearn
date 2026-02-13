import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, Mic, MicOff, VideoOff, Users } from "lucide-react";
import { getSocket } from "@/lib/socket";
import { toast } from "sonner";

const VideoCall = ({ roomId, user }: { roomId: string, user: any }) => {
    const [inCall, setInCall] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [remoteSpeaking, setRemoteSpeaking] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const remoteSocketIdRef = useRef<string | null>(null);

    const socket = getSocket();

    useEffect(() => {
        if (!socket) return;

        socket.on("user-joined-video", async (data) => {
            console.log("User joined video:", data);
            remoteSocketIdRef.current = data.socketId;
            createOffer(data.socketId);
        });

        socket.on("offer", async (payload) => {
            console.log("Received offer from:", payload.senderSocketId);
            remoteSocketIdRef.current = payload.senderSocketId;
            handleOffer(payload);
        });

        socket.on("answer", async (payload) => {
            console.log("Received answer from:", payload.senderSocketId);
            handleAnswer(payload);
        });

        socket.on("ice-candidate", async (data) => {
            if (peerRef.current && data.candidate) {
                try {
                    await peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (e) {
                    console.error("Error adding received ice candidate", e);
                }
            }
        });

        return () => {
            socket.off("user-joined-video");
            socket.off("offer");
            socket.off("answer");
            socket.off("ice-candidate");
        };
    }, [socket]);

    const startCall = async () => {
        try {
            // Try video + audio first
            let stream: MediaStream | null = null;

            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            } catch (videoError) {
                // If video fails, try audio only
                console.warn("Video access failed, trying audio only:", videoError);
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                    toast.info("Camera not available. Audio-only mode enabled.");
                    setVideoOn(false);
                } catch (audioError) {
                    // If both fail, show helpful error
                    console.error("Media access failed:", audioError);
                    toast.error("Unable to access camera or microphone. Please check your browser permissions.");
                    return;
                }
            }

            if (!stream) return;

            localStreamRef.current = stream;

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Setup audio level detection
            detectAudioLevel(stream);

            setInCall(true);
            socket?.emit("join-video-channel", roomId);
        } catch (err: any) {
            console.error("Failed to start call", err);
            toast.error(err.message || "Failed to start video call. Please check browser permissions.");
        }
    };

    const detectAudioLevel = (stream: MediaStream) => {
        try {
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);

            analyser.fftSize = 256;
            source.connect(analyser);

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const checkAudioLevel = () => {
                if (!analyserRef.current) return;

                analyserRef.current.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

                // Threshold for detecting speech (adjust as needed)
                setIsSpeaking(average > 20);

                animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
            };

            checkAudioLevel();
        } catch (error) {
            console.error("Failed to setup audio detection:", error);
        }
    };

    const endCall = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (peerRef.current) {
            peerRef.current.close();
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        setInCall(false);
        setIsSpeaking(false);
    };

    const createPeer = (targetUserId?: string) => {
        const peer = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" }
            ]
        });

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket?.emit("ice-candidate", {
                    target: targetUserId, // In mesh, this needs specific ID. For simple broadcast demo:
                    // Actually, simple mesh requires tracking multiple peers. 
                    // For this objective, let's assume 1:1 or simplified handling. 
                    // We'll emit to "channel" if 1:1 or just broadcast if simple.
                    // The socket "ice-candidate" expects { target, candidate }.
                    // If we don't know target, we can't route.
                    // Simplified: We react to "user-joined-video" which gives us an ID.
                    candidate: event.candidate
                });
            }
        };

        peer.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                peer.addTrack(track, localStreamRef.current!);
            });
        }

        return peer;
    };

    const createOffer = async (targetSocketId: string) => {
        const peer = createPeer(targetSocketId);
        peerRef.current = peer;

        // Correctly handle ICE candidates for specific target
        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket?.emit("ice-candidate", {
                    targetSocketId: targetSocketId,
                    candidate: event.candidate
                });
            }
        };

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        socket?.emit("offer", {
            targetSocketId: targetSocketId,
            sdp: offer
        });
    };

    const handleOffer = async (payload: any) => {
        const peer = createPeer(payload.senderSocketId);
        peerRef.current = peer;

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket?.emit("ice-candidate", {
                    targetSocketId: payload.senderSocketId,
                    candidate: event.candidate
                });
            }
        };

        await peer.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket?.emit("answer", {
            targetSocketId: payload.senderSocketId,
            sdp: answer
        });
    };

    const handleAnswer = async (payload: any) => {
        await peerRef.current?.setRemoteDescription(new RTCSessionDescription(payload.sdp));
    };

    const toggleMic = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => track.enabled = !micOn);
            setMicOn(!micOn);
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(track => track.enabled = !videoOn);
            setVideoOn(!videoOn);
        }
    };

    return (
        <div className="flex flex-col h-full bg-black/20 rounded-lg p-4">
            <div className="flex flex-1 gap-4 min-h-[400px]">
                {/* Local Video */}
                <div className={`flex-1 relative bg-black rounded-lg overflow-hidden transition-all ${isSpeaking && micOn ? 'ring-4 ring-green-500 shadow-lg shadow-green-500/50' : ''}`}>
                    <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    <div className="absolute bottom-4 left-4 text-white text-sm bg-black/70 px-3 py-2 rounded-lg backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isSpeaking && micOn ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                            <span>You {!micOn && '(Muted)'}</span>
                        </div>
                    </div>
                    {!videoOn && inCall && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                            <div className="text-center">
                                <VideoOff className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-400 text-sm">Camera Off</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Remote Video */}
                <div className={`flex-1 relative bg-black rounded-lg overflow-hidden transition-all ${remoteSpeaking ? 'ring-4 ring-blue-500 shadow-lg shadow-blue-500/50' : ''}`}>
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50 text-center">
                        {inCall && !peerRef.current && (
                            <div>
                                <Users className="h-12 w-12 mx-auto mb-2 animate-pulse" />
                                <p>Waiting for peer...</p>
                            </div>
                        )}
                        {!inCall && <p>Join to see others</p>}
                    </div>
                </div>
            </div>

            <div className="flex justify-center gap-4 mt-4">
                {!inCall ? (
                    <Button onClick={startCall} className="bg-green-500 hover:bg-green-600">
                        <Video className="mr-2 h-4 w-4" /> Start Video Call
                    </Button>
                ) : (
                    <>
                        <Button
                            variant={micOn ? "outline" : "destructive"}
                            onClick={toggleMic}
                            className={`rounded-full w-12 h-12 p-0 transition-all ${isSpeaking && micOn ? 'ring-2 ring-green-400' : ''}`}
                        >
                            {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                        </Button>
                        <Button variant={videoOn ? "outline" : "destructive"} onClick={toggleVideo} className="rounded-full w-12 h-12 p-0">
                            {videoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                        </Button>
                        <Button variant="destructive" onClick={endCall} className="rounded-full px-6">
                            End Call
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VideoCall;
