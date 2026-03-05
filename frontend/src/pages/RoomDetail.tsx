import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  MessageSquare,
  Video,
  FileText,
  Bot,
  Send,
  Users,
  Hash,
  LogOut,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { roomAPI, aiAPI, User } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import VideoCall from "@/components/VideoCall";
import { connectSocket, getSocket, disconnectSocket } from "@/lib/socket";
import { useRef } from "react";


const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const startTime = useRef<number>(Date.now());

  const [aiMessages, setAiMessages] = useState<
    { role: "user" | "system"; content: string }[]
  >([
    {
      role: "system",
      content:
        "Hello! I'm here to help you with your studies. Ask me anything about the room topic!",
    },
  ]);

  useEffect(() => {
    if (id) {
      startTime.current = Date.now();
      fetchRoomData();
      fetchMessages();
    }
  }, [id]);

  const fetchRoomData = async () => {
    try {
      const response = await roomAPI.getRoomById(id!);
      setRoom(response.data.data.room);
      setNotes(response.data.data.room.sharedNotes || "");
    } catch (error) {
      toast.error("Failed to load room details");
      navigate("/rooms");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await roomAPI.getMessages(id!);
      setMessages(response.data.data.messages);
    } catch (error) {
      console.error("Failed to load messages");
    }
  };

  useEffect(() => {
    const socket = getSocket();

    if (socket && id) {
      socket.emit("join-room", id);

      socket.on("receive-message", (newMessage: any) => {
        setMessages((prev) => [...prev, newMessage]);
      });

      socket.on("notes-updated", (updatedNotes: string) => {
        setNotes(updatedNotes);
      });
    }

    return () => {
      if (id && socket) {
        socket.emit("leave-room", id);
        socket.off("receive-message");
        socket.off("notes-updated");
      }
    };
  }, [id, user]); // Depend on user to ensure socket is available

  // Refresh room data periodically to get updated member count
  useEffect(() => {
    if (!id) return;

    const refreshInterval = setInterval(() => {
      fetchRoomData();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(refreshInterval);
  }, [id]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      try {
        const response = await roomAPI.sendMessage(id!, message);
        const savedMessage = response.data.data.message;

        // Emit to ALL users (including self) via socket
        getSocket()?.emit("send-message", {
          roomId: id,
          ...savedMessage,
        });

        // Clear input - don't add to local state, wait for socket broadcast
        setMessage("");
      } catch (error) {
        toast.error("Failed to send message");
      }
    }
  };

  // Debounced Notes Update
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (notes !== room?.sharedNotes && id) {
        // Only emit if changed and valid
        getSocket()?.emit("update-notes", { roomId: id, notes });
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [notes, id, room]);

  const handleSaveNotes = async () => {
    try {
      await roomAPI.updateSharedNotes(id!, notes);
      toast.success("Notes saved!");
      // Also emit immediately on save
      getSocket()?.emit("update-notes", { roomId: id, notes });
    } catch (error) {
      toast.error("Failed to save notes");
    }
  };

  const handleAiChat = async () => {
    if (!aiQuery.trim()) return;

    const newMessages = [
      ...aiMessages,
      { role: "user" as const, content: aiQuery },
    ];
    setAiMessages(newMessages);
    setAiQuery("");

    try {
      console.log("Sending AI request:", {
        message: aiQuery,
        topic: room.topic,
      });
      const response = await aiAPI.chat(aiQuery, room.topic);
      console.log("AI response:", response.data);
      setAiMessages([
        ...newMessages,
        { role: "system" as const, content: response.data.data.message },
      ]);
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      console.error("Error details:", error.response?.data || error.message);
      const errorMessage =
        error.response?.data?.message ||
        "Sorry, I can't respond right now. Please try again.";
      setAiMessages([
        ...newMessages,
        { role: "system" as const, content: errorMessage },
      ]);
      toast.error("AI chat failed: " + errorMessage);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      const timeSpent = (Date.now() - startTime.current) / (1000 * 60); // minutes
      await roomAPI.leaveRoom(id!, timeSpent);
      toast.success("Left the room");
      navigate("/rooms");
    } catch (error) {
      toast.error("Failed to leave room");
    }
  };

  if (loading || !room) {
    return <div>Loading...</div>;
  }

  console.log("Room Data:", room);
  console.log("Messages:", messages);
  console.log("AI Messages:", aiMessages);
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 gradient-text">
                {room.name}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Hash className="h-4 w-4" />
                  <span>{room.code}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{room.members.length} members</span>
                </div>
              </div>
            </div>
            <Button
              variant="destructive"
              onClick={handleLeaveRoom}
              className="glass-card"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Leave Room
            </Button>
          </div>
        </motion.div>

        {/* Members Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="glass-card p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Members:</span>
              <div className="flex -space-x-2">
                {room.members.slice(0, 5).map((member: any, index: number) => (
                  <Avatar key={index} className="border-2 border-background">
                    <AvatarImage src={member.user.avatar} />
                    <AvatarFallback>{member.user.name[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {room.members.length > 5 && (
                <span className="text-sm text-muted-foreground">
                  +{room.members.length - 5} more
                </span>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="chat" className="space-y-6">
            <TabsList className="glass-card">
              <TabsTrigger value="chat" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="video" className="gap-2">
                <Video className="h-4 w-4" />
                Video Call
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-2">
                <FileText className="h-4 w-4" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2">
                <Bot className="h-4 w-4" />
                AI Assistant
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat">
              <Card className="glass-card p-6">
                <div className="space-y-4 mb-6 h-96 overflow-y-auto">
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex gap-3 ${msg.sender._id === user?._id ? "flex-row-reverse" : ""}`}
                    >
                      <Avatar>
                        <AvatarImage src={msg.sender.avatar} />
                        <AvatarFallback>{msg.sender.name[0]}</AvatarFallback>
                      </Avatar>
                      <div
                        className={`flex-1 ${msg.sender._id === user?._id ? "text-right" : ""}`}
                      >
                        <div className="flex items-center gap-2 mb-1 justify-end">
                          <span className="font-medium text-sm">
                            {msg.sender.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <div
                          className={`inline-block p-3 rounded-lg ${msg.sender._id === user?._id
                              ? "bg-primary/20 text-primary-foreground"
                              : "glass-card"
                            }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="glass-card"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="video">
              <Card className="glass-card p-6">
                <VideoCall roomId={id!} user={user} />
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card className="glass-card p-6">
                <h3 className="text-xl font-bold mb-4">Shared Notes</h3>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="glass-card min-h-96 font-mono"
                />
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" className="glass-card">
                    Export
                  </Button>
                  <Button
                    onClick={handleSaveNotes}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Save Changes
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="ai">
              <Card className="glass-card p-6">
                <div className="space-y-4 mb-6 h-96 overflow-y-auto">
                  {aiMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`flex-1 ${msg.role === "user" ? "text-right" : ""}`}
                      >
                        <div
                          className={`inline-block p-3 rounded-lg ${msg.role === "user" ? "bg-primary/20" : "glass-card"}`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask AI anything..."
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAiChat()}
                    className="glass-card"
                  />
                  <Button
                    onClick={handleAiChat}
                    className="bg-secondary hover:bg-secondary/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default RoomDetail;
