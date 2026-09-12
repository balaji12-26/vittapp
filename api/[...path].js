import { createApp } from '../server/src/app.js';
import mongoose from 'mongoose';

let isConnected = false;

// Ensure environment variables are loaded if available locally, though Vercel injects them
const mongoUri = process.env.MONGO_URI;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
    if (!isConnected) {
      if (!mongoUri) {
        console.error('MONGO_URI is not defined in environment variables');
        return res.status(500).json({ message: 'Database configuration error: MONGO_URI missing' });
      }
      await mongoose.connect(mongoUri, {
        maxPoolSize: 10
      });
      isConnected = true;
      console.log('Connected to MongoDB via Vercel Serverless');
    }
    
    const app = createApp();
    return app(req, res);
  } catch (error) {
    console.error('Vercel API Error:', error);
    return res.status(500).json({ message: 'Vercel API Error: ' + error.message });
  }
}
