import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import doctorRoutes from './routes/doctor.js';
import clientRoutes from './routes/client.js';
import insurerRoutes from './routes/insurer.js';


dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use('/api/doctor', doctorRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/insurer', insurerRoutes);


// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.Db);
    console.log('MongoDB connected');
  } catch (error) {
   

 console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});