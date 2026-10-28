import express from 'express';
import { registerSchema, loginSchema, otpVerifySchema, createListingSchema } from '../validators/user.validator.js';
import { register, login, sendOtp, verifyOtp } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: result.error.errors[0].message });
    }
    await register(req, res, result.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: result.error.errors[0].message });
    }
    await login(req, res, result.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/send-otp', async (req, res) => {
  try {
    await sendOtp(req, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const result = otpVerifySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: result.error.errors[0].message });
    }
    await verifyOtp(req, res, result.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;