import dotenv from 'dotenv';
dotenv.config();

import connectDB from '../config/db.js';
import User from '../src/models/User.js';
import Auction from '../src/models/Auction.js';
import bcrypt from 'bcryptjs';

const seed = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Auction.deleteMany({});

    const hashedPw = await bcrypt.hash('password123', 10);

    // Create demo users
    const seller = await User.create({
      name: 'Rohan Sharma (Senior)',
      email: 'rohan@college.edu',
      passwordHash: hashedPw,
      isVerified: true,
      role: 'seller'
    });

    const buyer1 = await User.create({
      name: 'Sarthak Patel (Junior)',
      email: 'sarthak@college.edu',
      passwordHash: hashedPw,
      isVerified: true,
      role: 'student'
    });

    const buyer2 = await User.create({
      name: 'Priya Iyer (Junior)',
      email: 'priya@college.edu',
      passwordHash: hashedPw,
      isVerified: true,
      role: 'student'
    });

    // Create demo campus surplus auctions
    const now = Date.now();

    const auction1 = await Auction.create({
      sellerId: seller._id,
      title: 'Hercules Roadeo 21-Speed Gear Bicycle',
      description: 'Used for 2 years on campus. Front fork dampers re-greased at cycle shop. Dual disc brakes. Perfect for commuting between hostel and lecture halls.',
      category: 'Cycles',
      condition: 'used',
      startPrice: 1800,
      minIncrement: 50,
      currentPrice: 1950,
      leaderId: buyer1._id,
      bidCount: 3,
      closesAt: new Date(now + 25 * 60 * 1000), // 25 minutes
      status: 'ACTIVE'
    });

    const auction2 = await Auction.create({
      sellerId: seller._id,
      title: 'Haier 50L Dorm Mini-Refrigerator',
      description: 'Super compact, fits perfectly under standard hostel desk. Works flawlessly, clean freezer compartment. Essential for summer sem.',
      category: 'Dorm',
      condition: 'used',
      startPrice: 2800,
      minIncrement: 100,
      currentPrice: 3100,
      leaderId: buyer2._id,
      bidCount: 4,
      closesAt: new Date(now + 90 * 60 * 1000), // 1.5 hours
      status: 'ACTIVE'
    });

    const auction3 = await Auction.create({
      sellerId: seller._id,
      title: 'Casio FX-991EX ClassWiz Scientific Calculator',
      description: 'Original solar powered engineering calculator. QR code function, matrix & vector ops. Essential for calculus and physics exams.',
      category: 'Electronics',
      condition: 'like-new',
      startPrice: 600,
      minIncrement: 20,
      currentPrice: 660,
      leaderId: buyer1._id,
      bidCount: 2,
      closesAt: new Date(now + 3 * 60 * 1000), // 3 minutes (Ending soon)
      status: 'ACTIVE'
    });

    const auction4 = await Auction.create({
      sellerId: seller._id,
      title: 'Complete B.Tech Mechanical Core Sem 3-6 Textbooks & Handwritten Notes',
      description: 'Thermodynamics by Cengel, Fluid Mechanics by Fox & McDonald, SOM by Gere. Includes my handwritten notes with previous years solved papers.',
      category: 'Books',
      condition: 'used',
      startPrice: 700,
      minIncrement: 50,
      currentPrice: 700,
      leaderId: null,
      bidCount: 0,
      closesAt: new Date(now + 5 * 60 * 1000), // 5 minutes
      status: 'ACTIVE'
    });

    console.log('✅ Demo seed data created successfully!');
    console.log(`Demo Seller Account: rohan@college.edu | password123`);
    console.log(`Demo Buyer Account:  sarthak@college.edu | password123`);
    console.log(`Created 4 live surplus auctions: Cycle, Mini-Fridge, Calculator, Textbooks.`);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();