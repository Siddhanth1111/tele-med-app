// apps/ai-service/src/index.ts
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import axios from 'axios'; 
import dotenv from 'dotenv';
import redis from './config/redis'; // <--- Import Redis

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = 3004;

app.use(cors());
app.use(express.json());

// API: Get Chat History (No changes needed here)
app.get('/history/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    let session = await prisma.chatSession.findFirst({
      where: { patientId: Number(patientId) },
      include: { messages: { orderBy: { timestamp: 'asc' } } }
    });

    if (!session) {
      session = await prisma.chatSession.create({
        data: { patientId: Number(patientId) },
        include: { messages: true }
      });
    }
    res.json(session);
  } catch (error) {
    console.error("History Error:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// API: Send Message with REDIS CACHING
app.post('/chat', async (req, res) => {
  try {
    const { patientId, text } = req.body;
    if (!text) return res.status(400).json({ error: "Message text is required" });

    // 1. Get Session
    let session = await prisma.chatSession.findFirst({
      where: { patientId: Number(patientId) }
    });
    if (!session) {
      session = await prisma.chatSession.create({ data: { patientId: Number(patientId) } });
    }

    // 2. Save USER Message
    await prisma.message.create({
      data: { chatId: session.id, sender: 'user', text: text }
    });

    // --- REDIS CACHING START ---
    
    // Create a unique cache key based on the question
    // "trim()" removes spaces so " fever " and "fever" use the same cache
    const cacheKey = `ai_response:${text.trim().toLowerCase()}`;
    
    let aiText = "";

    // 3. Check Redis Cache
    const cachedResponse = await redis.get(cacheKey);

    if (cachedResponse) {
      console.log("⚡ Serving response from Redis Cache");
      aiText = cachedResponse;
    } else {
      console.log("🤖 Cache Miss - Calling Gemini API");
      
      // 4. Call Gemini API (Only if not in cache)
      const apiKey = process.env.GEMINI_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const aiRes = await axios.post(url, {
        contents: [{
          parts: [{ text: `You are a helpful medical assistant. The patient says: "${text}". Provide brief guidance.` }]
        }]
      });

      aiText = aiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't understand that.";

      // 5. Save to Redis (Expires in 1 hour / 3600 seconds)
      await redis.setex(cacheKey, 3600, aiText);
    }
    // --- REDIS CACHING END ---

    // 6. Save AI Message to Database
    // We save it even if it came from cache, so the chat history is preserved
    const aiMessage = await prisma.message.create({
      data: { chatId: session.id, sender: 'ai', text: aiText }
    });

    res.json(aiMessage);

  } catch (error: any) {
    console.error("Chat Error:", error.response?.data || error.message);
    res.status(500).json({ error: "AI Service failed" });
  }
});

app.listen(PORT, () => {
  console.log(`AI Service running on port ${PORT}`);
});