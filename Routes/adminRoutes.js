import express from 'express';
import { getAdminStats, getAllUsers, updateUserRole, deleteUser } from '../Controllers/adminController.js';
import { protect, adminOnly } from '../Middlewares/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, adminOnly, getAdminStats);
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id/role', protect, adminOnly, updateUserRole);
router.delete('/users/:id', protect, adminOnly, deleteUser);

export default router;
