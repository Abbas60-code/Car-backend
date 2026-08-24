/**
 * Seed Script: Create a default admin user
 * Run with: node seed.js
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dns from 'dns';

// Use Google/Cloudflare DNS to avoid Atlas SRV lookup failures
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (_) {}

const MONGO_URI = process.env.Database || process.env.MONGO_URI || process.env.MONGODB_URI;
const ADMIN_EMAIL = 'muhammadabbas09dec@gmail.com';
const ADMIN_PASSWORD = 'abbas123';
const ADMIN_NAME = 'Muhammad Abbas';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function seed() {
  if (!MONGO_URI) {
    console.error('❌ MONGO_URI not found in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    // Upgrade existing user to admin
    existing.role = 'admin';
    await existing.save();
    console.log(`✅ Existing user "${ADMIN_EMAIL}" upgraded to admin.`);
  } else {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: hashedPassword, role: 'admin' });
    console.log(`✅ Admin user created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  }

  await mongoose.disconnect();
  console.log('✅ Done! You can now log in with muhammadabbas09dec@gmail.com / abbas123');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
