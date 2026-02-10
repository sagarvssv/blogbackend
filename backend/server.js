import express from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv/config';
import connectDB from './config/db.js';
import { Server } from 'socket.io'; 
import userRouter from './routes/adminRouter.js';
import postRouter from './routes/postRouter.js';
import job from './utils/cron.js';

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
  }
});

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",  
    "https://chipper-sunflower-bdc737.netlify.app",
                                                  "http://localhost:5174", // local dev
    "https://blog.vcloudmaster.com"   // production
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
job.start();
app.use(express.json());


app.use('/api/admin',userRouter)
app.use('/api/post',postRouter)

// defaultRoutes
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Socket events
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
