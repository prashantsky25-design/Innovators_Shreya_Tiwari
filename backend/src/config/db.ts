import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './env.js';

let mongod: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    let uri = config.mongoUri;

    if (!uri) {
      console.log('🔄 No MONGODB_URI provided. Initializing embedded in-memory MongoDB server...');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log(`✅ In-memory MongoDB server started at: ${uri}`);
    } else {
      console.log(`🔄 Connecting to configured MongoDB instance...`);
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`🎉 MongoDB successfully connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err: any) {
    console.warn(`⚠️ Failed connecting to primary MongoDB (${err.message}). Falling back to embedded MongoMemoryServer...`);
    try {
      if (!mongod) {
        mongod = await MongoMemoryServer.create();
      }
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      console.log(`🎉 Connected to embedded fallback MongoDB: ${memoryUri}`);
    } catch (fallbackErr: any) {
      console.error('❌ Catastrophic MongoDB initialization error:', fallbackErr);
      process.exit(1);
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};
