import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { cloudinary } from './Config/cloudinary.js';
import authRoutes from './Routes/authRoutes.js';
import carRoutes from './Routes/carRoutes.js';
import bookingRoutes from './Routes/bookingRoutes.js';
import adminRoutes from './Routes/adminRoutes.js';

const app = express();

// ─── Middlewares ─────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Multer (memory storage) ──────────────────────────────
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ─── Routes ──────────────────────────────────────────────

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Auth Routes
app.use('/api/auth', authRoutes);

// Car Fleet Routes
app.use('/api/cars', carRoutes);

// Booking Routes
app.use('/api/bookings', bookingRoutes);

// Admin Routes
app.use('/api/admin', adminRoutes);

// Image Upload → Cloudinary (general purpose)
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file.' });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'backend_uploads' },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary Upload Failed:', error);
          return res.status(500).json({
            success: false,
            message: 'Upload to Cloudinary failed',
            error: error.message,
          });
        }

        console.log('🖼️  Image saved to Cloudinary:', result.secure_url);

        return res.status(200).json({
          success: true,
          message: 'Image uploaded successfully to Cloudinary!',
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error('❌ Internal Server Error:', error);
    res.status(500).json({ success: false, message: 'Server error during upload', error: error.message });
  }
});

export default app;
