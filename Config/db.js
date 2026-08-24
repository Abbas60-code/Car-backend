import mongoose from 'mongoose';
import dns from 'dns';

const connectDB = () => {
  // Set reliable DNS servers (Google & Cloudflare) to prevent querySrv ECONNREFUSED issues
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (err) {
    console.warn('⚠️ Failed to set DNS servers:', err.message);
  }

  mongoose.connect(process.env.Database, {
    serverSelectionTimeoutMS: 5000,
  })
    .then(() => {
      console.log('✅ Database Connected Successfully!');
    })
    .catch((err) => {
      console.error('❌ Database Connection Failed:', err.message);
    });
};

export default connectDB;
