import dotenv from 'dotenv';

dotenv.config();

import app from './app.js';
import connectDB from './Config/db.js';
import { connectCloudinary } from './Config/cloudinary.js';

const PORT = process.env.Port || 9000;

// ─── Initialize Connections ───────────────────────────────
connectCloudinary();
connectDB();

// ─── Start Server ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server Running on Port ${PORT}`);
});
