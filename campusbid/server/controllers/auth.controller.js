import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OTPService from '../services/otpService.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check domain allowlist
    const domain = email.split('@')[1];
    if (domain !== process.env.ALLOWED_EMAIL_DOMAIN) {
      return res.status(400).json({ message: 'Email domain not allowed' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, isVerified: user.isVerified } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const code = String(Math.floor(100000 + Math.random() * 900000));
    
    const otpHash = await bcrypt.hash(code, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await User.findByIdAndUpdate(req.user.userId, {
      otpHash,
      otpExpiresAt,
    });

    if (process.env.OTP_DEV_LOG === 'true') {
      console.log(`[OTP_DEV] Code for ${email}: ${code}`);
    }

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Your CampusBid OTP Code',
      text: `Your CampusBid verification code is: ${code}. It expires in 10 minutes.`,
    });

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    const isMatch = await bcrypt.compare(req.body.code, user.otpHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    if (user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (user.otpAttempts >= 5) {
      return res.status(400).json({ message: 'Too many attempts' });
    }

    await User.findByIdAndUpdate(req.user.userId, {
      isVerified: true,
      otpHash: '',
      otpExpiresAt: null,
      otpAttempts: 0,
    });

    res.json({ message: 'OTP verified successfully', isVerified: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};