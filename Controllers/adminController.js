import User from '../Models/User.js';
import Car from '../Models/Car.js';
import Booking from '../Models/Booking.js';

// Get Admin Overview Stats
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCars = await Car.countDocuments();
    const availableCars = await Car.countDocuments({ status: 'Available' });
    const rentedCars = await Car.countDocuments({ status: 'Rented' });
    const maintenanceCars = await Car.countDocuments({ status: 'Maintenance' });

    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: 'Confirmed' });
    
    // Aggregate Total Revenue
    const revenueData = await Booking.aggregate([
      { $match: { status: { $in: ['Confirmed', 'Completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalUsers,
        totalCars,
        availableCars,
        rentedCars,
        maintenanceCars,
        totalBookings,
        activeBookings,
      },
    });
  } catch (error) {
    console.error('❌ getAdminStats Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats', error: error.message });
  }
};

// Get All Users (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error('❌ getAllUsers Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
};

// Update User Role (Admin)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: `User role updated to ${role}`, data: user });
  } catch (error) {
    console.error('❌ updateUserRole Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user role', error: error.message });
  }
};

// Delete User (Admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.email === 'muhammadabbas09dec@gmail.com') {
      return res.status(400).json({ success: false, message: 'Cannot delete the primary owner account.' });
    }

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ deleteUser Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
};
