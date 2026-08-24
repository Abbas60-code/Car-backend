import express from 'express';
import { createBooking, getUserBookings, getAllBookings, updateBookingStatus, deleteBooking } from '../Controllers/bookingController.js';
import { protect, adminOnly } from '../Middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getUserBookings);

// Admin routes
router.get('/all', protect, adminOnly, getAllBookings);
router.put('/:id/status', protect, adminOnly, updateBookingStatus);
router.delete('/:id', protect, adminOnly, deleteBooking);

export default router;
