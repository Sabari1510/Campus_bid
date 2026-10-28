import './config/db.js';
import User from './src/models/User.js';
import Auction from './src/models/Auction.js';
import Auction from './src/models/Auction.js';

const seed = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Auction.deleteMany({});

    // Create demo users
    const seller = await User.create({
      name: 'Senior Seller',
      email: 'seller@college.edu',
      passwordHash: 'password123', // Will be hashed by pre-save hook
      role: 'seller',
    });

    const buyer1 = await User.create({
      name: 'Junior Buyer 1',
      email: 'junior1@college.edu',
      passwordHash: 'password123',
    });

    const buyer2 = await User.create({
      name: 'Junior Buyer 2',
      email: 'junior2@college.edu',
      passwordHash: 'password123',
    });

    // Create auctions with different close times
    const now = new Date();
    const close1 = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
    const close2 = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes
    const close3 = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours

    const auction1 = await Auction.create({
      sellerId: seller._id,
      title: 'Old Bicycle',
      description: 'Used bicycle in good condition',
      category: 'Sports',
      condition: 'used',
      photos: ['https://example.com/bike1.jpg', 'https://example.com/bike2.jpg'],
      startPrice: 500,
      minIncrement: 50,
      currentPrice: 500,
      leaderId: buyer1._id,
      bidCount: 1,
      closesAt: close1,
      status: 'ACTIVE',
    });

    const auction2 = await Auction.create({
      sellerId: seller._id,
      title: 'Textbooks Set',
      description: 'Grade 12 Mathematics and Physics textbooks',
      category: 'Education',
      condition: 'like-new',
      photos: ['https://example.com/books1.jpg'],
      startPrice: 1000,
      minIncrement: 100,
      currentPrice: 1000,
      closesAt: close2,
      status: 'ACTIVE',
    });

    const auction3 = await Auction.create({
      sellerId: seller._id,
      title: 'Gaming Headset',
      description: 'RGB gaming headset with mic',
      category: 'Electronics',
      condition: 'new',
      photos: ['https://example.com/headset1.jpg'],
      startPrice: 2000,
      minIncrement: 200,
      currentPrice: 2000,
      closesAt: close3,
      status: 'ACTIVE',
    });

    console.log('Seed data created successfully');
    console.log(`Seller: ${seller.email}`);
    console.log(`Auctions: ${auction1.title}, ${auction2.title}, ${auction3.title}`);
  } catch (error) {
    console.error('Seed error:', error);
  }
};

seed();
process.exit();