const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Ground = require('../models/Ground');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    const grounds = [];
    const baseName = 'Chennai Sports Ground';
    const types = ['cricket', 'football', 'badminton', 'tennis', 'basketball', 'other'];

    const sportImages = {
      cricket: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80',
      football: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
      badminton: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80',
      tennis: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1f0?w=800&q=80',
      basketball: 'https://images.unsplash.com/photo-1546519638-32c0d83b6c31?w=800&q=80',
      other: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&q=80'
    };

    for (let i = 1; i <= 100; i++) {
      const type = types[i % types.length];
      grounds.push({
        name: `${baseName} ${i}`,
        type,
        location: 'Chennai',
        address: `Area ${i}, Chennai 6000${String(i).padStart(2, '0')}`,
        description: `Sample ${type} ground ${i} in Chennai.`,
        facilities: ['Parking', 'Changing rooms', 'Lights'],
        imageUrl: sportImages[type],
        pricePerHour: 500 + (i % 5) * 100,
        isActive: true,
        approvalStatus: 'approved',
      });
    }

    const cleared = await Ground.deleteMany({});
    console.log(`Cleared ${cleared.deletedCount} grounds`);

    const inserted = await Ground.insertMany(grounds);
    console.log(`Inserted ${inserted.length} approved grounds`);
  } catch (err) {
    console.error('Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();

