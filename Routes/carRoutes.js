import express from 'express';
import multer from 'multer';
import { getCars, getCarById, createCar, updateCar, deleteCar } from '../Controllers/carController.js';
import { protect, adminOnly } from '../Middlewares/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public routes
router.get('/', getCars);
router.get('/:id', getCarById);

// Admin protected routes
router.post('/', protect, adminOnly, upload.single('image'), createCar);
router.put('/:id', protect, adminOnly, upload.single('image'), updateCar);
router.delete('/:id', protect, adminOnly, deleteCar);

export default router;
