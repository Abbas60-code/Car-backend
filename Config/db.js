import mongoose from 'mongoose';
import dns from 'dns';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (err) {
    console.warn('⚠️ Failed to set DNS servers:', err.message);
  }

  try {
    await mongoose.connect(process.env.Database, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Database Connected Successfully!');
  } catch (err) {
    console.error('❌ Database Connection Failed:', err.message);
  }
};

export default connectDB;
