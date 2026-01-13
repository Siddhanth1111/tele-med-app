import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

// Health Check
app.get('/health', (req, res) => {
  res.send('Video Service is running');
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for now (Frontend will connect here)
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // 1. Join a specific appointment room
  socket.on("join-room", (roomId, userId) => {
    console.log(`User ${userId} joined room ${roomId}`);
    socket.join(roomId);
    
    // Notify others in the room that a new user appeared
    socket.to(roomId).emit("user-connected", userId);
  });

  // 2. Handle WebRTC Signaling (The "Handshake")
  
  // When User A sends an "Offer" (Calling...), send it to User B
  socket.on("offer", (payload) => {
    io.to(payload.target).emit("offer", payload);
  });

  // When User B sends an "Answer" (Picking up...), send it back to User A
  socket.on("answer", (payload) => {
    io.to(payload.target).emit("answer", payload);
  });

  // When browsers swap network details (ICE Candidates)
  socket.on("ice-candidate", (incoming) => {
    io.to(incoming.target).emit("ice-candidate", incoming.candidate);
  });

  // 3. Handle Disconnect
  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

const PORT = 3003;
server.listen(PORT, () => {
  console.log(`Video Service running on port ${PORT}`);
});