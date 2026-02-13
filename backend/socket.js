const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { ChatMessage, StudyRoom } = require('./models');

let io;

const initializeSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Middleware for authentication
    io.use((socket, next) => {
        if (socket.handshake.query && socket.handshake.query.token) {
            jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) return next(new Error('Authentication error'));
                socket.decoded = decoded;
                next();
            });
        } else {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.decoded.id);

        // Join Room
        socket.on('join-room', (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.decoded.id} joined room ${roomId}`);
        });

        // Leave Room
        socket.on('leave-room', (roomId) => {
            socket.leave(roomId);
            console.log(`User ${socket.decoded.id} left room ${roomId}`);
        });

        // Chat Message
        socket.on('send-message', async (data) => {
            const { roomId, message, sender } = data; // Receive sender info for immediate update
            // Save is handled by API usually, but if using pure socket:
            // We can just broadcast. Ideally API handles DB save and frontend uses emit to notify others.
            // But for "Real-time room chat using Socket.IO", let's broadcast.

            io.to(roomId).emit('receive-message', data);
        });

        // Update Notes
        socket.on('update-notes', (data) => {
            const { roomId, notes } = data;
            socket.to(roomId).emit('notes-updated', notes);
        });

        // Video Call Signaling
        socket.on("join-video-channel", (roomId) => {
            socket.join(`video-${roomId}`);
            console.log(`User ${socket.decoded.id} joined video channel: video-${roomId}`);
            // Notify others in the channel
            socket.to(`video-${roomId}`).emit("user-joined-video", {
                userId: socket.decoded.id,
                socketId: socket.id
            });
        });

        socket.on("offer", (payload) => {
            // Broadcast to specific socket or the whole video room
            if (payload.targetSocketId) {
                io.to(payload.targetSocketId).emit("offer", {
                    ...payload,
                    senderSocketId: socket.id
                });
            }
        });

        socket.on("answer", (payload) => {
            if (payload.targetSocketId) {
                io.to(payload.targetSocketId).emit("answer", {
                    ...payload,
                    senderSocketId: socket.id
                });
            }
        });

        socket.on("ice-candidate", (incoming) => {
            if (incoming.targetSocketId) {
                io.to(incoming.targetSocketId).emit("ice-candidate", {
                    candidate: incoming.candidate,
                    senderSocketId: socket.id
                });
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.decoded.id);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = { initializeSocket, getIO };
