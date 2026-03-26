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

    for (let i = 1; i <= 100; i++) {
      const type = types[i % types.length];
      grounds.push({
        name: `${baseName} ${i}`,
        type,
        location: 'Chennai',
        address: `Area ${i}, Chennai 6000${String(i).padStart(2, '0')}`,
        description: `Sample ${type} ground ${i} in Chennai.`,
        facilities: ['Parking', 'Changing rooms', 'Lights'],
        imageUrl: `https://picsum.photos/seed/chennai-${i}/800/600`,
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

