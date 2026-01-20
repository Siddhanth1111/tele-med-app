import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimiter from "./middleware/rateLimiter";

const app = express();
const PORT = 8080;

app.use(cors());
app.use(rateLimiter);
// app.use(express.json());

// HEALTH CHECK (To confirm it's running)
app.get('/health', (req, res) => {
  res.json({ message: "API Gateway is Alive", timestamp: new Date() });
});

// ROUTE 1: Auth Service Proxy
// Requests to /api/auth will go to the 'auth-service' container on port 3001
app.use('/api/auth', createProxyMiddleware({
  target: 'http://auth-service:3001', // 'auth-service' is the Docker Service Name
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '', // Remove '/api/auth' prefix when forwarding
  },
}));


// ... inside apps/api-gateway/src/index.ts

// ROUTE 2: Appointment Service Proxy
app.use('/api/appointments', createProxyMiddleware({
  target: 'http://appointment-service:3002', // Matches Docker Service Name & Port
  changeOrigin: true,
  pathRewrite: {
    '^/api/appointments': '', // Removes prefix
  },
  onError: (err, req, res) => {
    console.error('Appointment Proxy Error:', err);
    res.status(500).send('Proxy Error');
  }
}));

// Add this new proxy rule
app.use('/api/ai', createProxyMiddleware({ 
    target: 'http://ai-service:3004', 
    changeOrigin: true,
    pathRewrite: { '^/api/ai': '' }
}));

// Add this proxy rule
app.use('/api/payments', createProxyMiddleware({ 
    target: 'http://payment-service:3005', 
    changeOrigin: true,
    pathRewrite: { '^/api/payments': '' }
}));

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});