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
