import User from '../Models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_12345';

// ─── Email Transporter Setup ─────────────────────────────────────
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.Gmailuser,
      pass: process.env.Gmailpassword,
    },
  });
};

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
    });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('❌ Register Error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.', error: error.message });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role || 'user' }, JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role || 'user' },
    });
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.', error: error.message });
  }
};

// ─── Forgot Password: Generate OTP & Send Email ──────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email address.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Security: don't reveal whether email exists
      return res.status(200).json({ success: true, message: 'If this email is registered, an OTP has been sent.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetOTP = otp;
    user.resetOTPExpiry = otpExpiry;
    await user.save();

    // Send email
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Velocity Rentals" <${process.env.Gmailuser}>`,
      to: email,
      subject: '🔐 Your Password Reset OTP - Velocity Rentals',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0a0b10;color:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);">
          <div style="background:linear-gradient(135deg,#00f2fe,#4facfe);padding:32px 24px;text-align:center;">
            <h1 style="margin:0;font-size:28px;font-weight:900;color:#0a0b10;letter-spacing:-0.5px;">VELOCITY<span style="opacity:0.5;">.</span></h1>
            <p style="margin:6px 0 0;color:#0a0b10;font-size:14px;font-weight:600;opacity:0.8;">Premium Car Rentals</p>
          </div>
          <div style="padding:32px 28px;">
            <h2 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#fff;">Password Reset Request</h2>
            <p style="color:#9ca3af;font-size:15px;margin:0 0 28px;line-height:1.6;">
              We received a request to reset the password for <strong style="color:#fff;">${email}</strong>. Use the OTP code below.
            </p>
            <div style="background:rgba(0,242,254,0.08);border:2px dashed rgba(0,242,254,0.4);border-radius:14px;padding:24px;text-align:center;margin-bottom:28px;">
              <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">One-Time Password (OTP)</p>
              <p style="margin:0;font-size:44px;font-weight:900;color:#00f2fe;letter-spacing:10px;">${otp}</p>
            </div>
            <p style="color:#6b7280;font-size:13px;margin:0 0 6px;">⏱ This OTP expires in <strong style="color:#f59e0b;">10 minutes</strong>.</p>
            <p style="color:#6b7280;font-size:13px;margin:0;">🔒 If you didn't request this, ignore this email. Your account is safe.</p>
          </div>
          <div style="padding:20px 28px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
            <p style="color:#4b5563;font-size:12px;margin:0;">© 2026 Velocity Rentals. Manhattan, New York.</p>
          </div>
        </div>
      `,
    });

    res.status(200).json({ success: true, message: 'OTP has been sent to your email. It expires in 10 minutes.' });
  } catch (error) {
    console.error('❌ Forgot Password Error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.', error: error.message });
  }
};

// ─── Reset Password: Verify OTP & Set New Password ───────────────
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found.' });
    }

    if (!user.resetOTP || user.resetOTP !== otp.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please check your email and try again.' });
    }

    if (!user.resetOTPExpiry || new Date() > user.resetOTPExpiry) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetOTP = null;
    user.resetOTPExpiry = null;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful! You can now log in with your new password.' });
  } catch (error) {
    console.error('❌ Reset Password Error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password.', error: error.message });
  }
};
