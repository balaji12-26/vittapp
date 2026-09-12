import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function start() {
  console.log('Starting MongoDB Memory Server with Replica Set...');
  const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replSet.getUri();

  console.log(`MongoDB Memory Server started at: ${uri}`);

  // Set environment variables for the application
  const env = {
    ...process.env,
    MONGO_URI: uri,
    JWT_SECRET: 'supersecretlongstringthatis24chars_eventease_secret',
    NODE_ENV: 'development',
    PORT: '5000'
  };

  // Seed the local in-memory DB so login works immediately!
  const mongoose = await import('mongoose');
  const bcrypt = await import('bcryptjs');
  await mongoose.default.connect(uri);
  const { User } = await import('./src/models/User.js');
  const hash = await bcrypt.default.hash('password123', 10);
  await User.findOneAndUpdate({ email: 'organizer@eventease.com' }, { name: 'Local Organizer', email: 'organizer@eventease.com', passwordHash: hash, role: 'organizer' }, { upsert: true });
  await User.findOneAndUpdate({ email: 'attendee@eventease.com' }, { name: 'Local Attendee', email: 'attendee@eventease.com', passwordHash: hash, role: 'attendee' }, { upsert: true });
  await mongoose.default.disconnect();
  console.log('Local DB seeded with test accounts.');

  console.log('Starting EventEase API...');
  const child = spawn('node', ['--watch', 'src/server.js'], {
    env,
    cwd: __dirname,
    stdio: 'inherit'
  });

  child.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
    replSet.stop();
    process.exit(code);
  });

  process.on('SIGINT', async () => {
    child.kill('SIGINT');
    await replSet.stop();
    process.exit(0);
  });
}

start().catch(console.error);
