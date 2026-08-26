import mongoose from 'mongoose';
import dns from 'dns';

let cachedPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (err) {
    console.warn('⚠️ DNS server set warning:', err.message);
  }

  cachedPromise = mongoose.connect(process.env.Database, {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
    bufferCommands: false,
  }).then((m) => {
    console.log('✅ Database Connected Successfully!');
    return m;
  }).catch((err) => {
    cachedPromise = null;
    console.error('❌ Database Connection Failed:', err.message);
    throw err;
  });

  return cachedPromise;
};

export default connectDB;
