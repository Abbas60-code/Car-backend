import Booking from '../Models/Booking.js';
import Car from '../Models/Car.js';

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const { carId, startDate, endDate, totalAmount } = req.body;

    if (!carId || !startDate || !endDate || !totalAmount) {
      return res.status(400).json({ success: false, message: 'Please provide all booking details.' });
    }

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    const booking = await Booking.create({
      user: req.user._id,
      car: carId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalAmount: Number(totalAmount),
      status: 'Confirmed',
    });

    // Optionally mark car status as Rented
    await Car.findByIdAndUpdate(carId, { status: 'Rented' });

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully!',
      data: booking,
    });
  } catch (error) {
    console.error('❌ createBooking Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create reservation', error: error.message });
  }
};

// Get current user's bookings
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('car')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    console.error('❌ getUserBookings Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings', error: error.message });
  }
};

// Get all bookings (Admin)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('car', 'name brand type pricePerDay image')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    console.error('❌ getAllBookings Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch all bookings', error: error.message });
  }
};

// Update booking status (Admin)
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    // If completed or cancelled, make car available again
    if (status === 'Completed' || status === 'Cancelled') {
      await Car.findByIdAndUpdate(booking.car, { status: 'Available' });
    }

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: booking,
    });
  } catch (error) {
    console.error('❌ updateBookingStatus Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update booking status', error: error.message });
  }
};

// Delete booking (Admin)
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    // Free up the car if it was rented
    if (booking.status === 'Confirmed') {
      await Car.findByIdAndUpdate(booking.car, { status: 'Available' });
    }
    await booking.deleteOne();
    res.status(200).json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('❌ deleteBooking Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete booking', error: error.message });
  }
};

