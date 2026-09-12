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
  if (!isConnected) {
    if (!mongoUri) {
      console.error('MONGO_URI is not defined in environment variables');
      return res.status(500).json({ message: 'Database configuration error' });
    }
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10
    });
    isConnected = true;
    console.log('Connected to MongoDB via Vercel Serverless');
  }
  
  const app = createApp();
  // Vercel routes all /api/(.*) to this handler, and express router handles the rest
  // but we need to make sure the base url matches. Since vercel rewrite is /api/(.*) -> /api/index.js,
  // the req.url will preserve the /api path. express expects this.
  
  return app(req, res);
}
