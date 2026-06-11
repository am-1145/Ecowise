import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User';
import { Challenge } from './models/Challenge';
import { MarketplaceProduct } from './models/MarketplaceProduct';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecowise';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected. Clearing existing data...');

    await User.deleteMany({});
    await Challenge.deleteMany({});
    await MarketplaceProduct.deleteMany({});

    console.log('Inserting seed users...');
    const admin = new User({
      name: 'EcoWise Admin',
      email: 'admin@ecowise.ai',
      password: 'adminpassword123',
      role: 'admin',
      points: 1000,
      level: 5,
      xp: 450,
      badges: ['Founding Member 🎖️', 'Green Chief 👑']
    });

    const user = new User({
      name: 'Jane Doe',
      email: 'user@ecowise.ai',
      password: 'userpassword123',
      role: 'user',
      points: 250,
      level: 2,
      xp: 120,
      badges: ['Welcome Greenhorn 🌿']
    });

    await admin.save();
    await user.save();

    console.log('Inserting seed challenges...');
    const challenges = [
      {
        title: 'Meat-Free Week',
        description: 'Reduce greenhouse gases by avoiding beef, pork, and chicken for 7 days. Swap for delicious plant-based alternatives.',
        category: 'food',
        durationDays: 7,
        participantsCount: 124,
        xpReward: 100,
        pointsReward: 150,
        badgeReward: 'Herbivore Champion 🥦',
        qrCodeData: 'QR_CHALLENGE_MEAT_FREE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        rules: [
          'Log vegetarian or vegan diet each day in the Carbon Calculator.',
          'Post at least 1 veggie meal recipe in the community chat.',
          'Complete the end-of-challenge quiz.'
        ]
      },
      {
        title: 'Public Transit Streak',
        description: 'Ditch your personal car commute. Take the bus or metro to work at least 3 times this week.',
        category: 'transportation',
        durationDays: 5,
        participantsCount: 88,
        xpReward: 120,
        pointsReward: 180,
        badgeReward: 'Metro Commuter 🚇',
        qrCodeData: 'QR_CHALLENGE_TRANSIT_STREAK',
        startDate: new Date(),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        rules: [
          'Avoid solo private combustion car trips.',
          'Log at least 3 public transit commutes in the carbon activity logger.',
          'Scan the check-in QR code at your local station.'
        ]
      },
      {
        title: 'Zero Waste Plastic Ban',
        description: 'Avoid buying single-use plastic bottles, cups, and food packaging for a full week.',
        category: 'waste',
        durationDays: 7,
        participantsCount: 201,
        xpReward: 150,
        pointsReward: 200,
        badgeReward: 'Plastic Slayer 🛡️',
        qrCodeData: 'QR_CHALLENGE_ZERO_PLASTIC',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        rules: [
          'Use reusable water containers and coffee mugs.',
          'Recycle all paper and aluminum packaging.',
          'Buy groceries bulk without plastic wrapping.'
        ]
      }
    ];

    await Challenge.insertMany(challenges);

    console.log('Inserting marketplace catalog...');
    const products = [
      {
        name: 'Amazon Rainforest Reforestation',
        description: 'Fund the planting and nurturing of 10 native trees in protected sectors of the Brazilian Amazon to directly capture greenhouse gases.',
        category: 'offset',
        price: 25.00,
        imageUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&q=80&w=600',
        carbonSaved: 250, // 250 kg offset
        rating: 4.9,
        ratingCount: 382,
        provider: 'Rainforest Rescue',
        isOffset: true,
        offsetType: 'forestry'
      },
      {
        name: 'Wind Turbine Renewable Offset',
        description: 'Purchase verified carbon credits funding high-yield wind turbine grids in Texas, displacing grid fossil fuel combustion.',
        category: 'offset',
        price: 15.00,
        imageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=600',
        carbonSaved: 180, // 180 kg
        rating: 4.7,
        ratingCount: 194,
        provider: 'CleanVolt Energies',
        isOffset: true,
        offsetType: 'wind'
      },
      {
        name: 'Solar-Powered Waterproof Powerbank',
        description: 'A rugged, high-capacity 20,000mAh external battery that charges in the sun. Ideal for camping and off-grid mobile power.',
        category: 'product',
        price: 39.99,
        imageUrl: 'https://images.unsplash.com/photo-1620283085439-39620a1e21c4?auto=format&fit=crop&q=80&w=600',
        carbonSaved: 42,
        rating: 4.6,
        ratingCount: 88,
        provider: 'SunSpike Gear',
        isOffset: false,
        alternatives: ['Standard Lithium Powerbank', 'Grid Outlet Charger']
      },
      {
        name: 'Reusable Zero Waste Grocery Bags (Set of 6)',
        description: 'Heavy duty, organic cotton produce and grocery tote bags. Completely biodegradable and machine washable.',
        category: 'product',
        price: 18.50,
        imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
        carbonSaved: 68,
        rating: 4.8,
        ratingCount: 412,
        provider: 'GreenThreads Co.',
        isOffset: false,
        alternatives: ['Single-use Plastic Shopping Bags', 'Paper Totes']
      }
    ];

    await MarketplaceProduct.insertMany(products);

    console.log('Database seeding successfully finished!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Seeding process failed:', error);
    process.exit(1);
  }
};

seedDatabase();
