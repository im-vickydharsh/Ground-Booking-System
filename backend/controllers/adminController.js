const Booking = require('../models/Booking');
const Ground = require('../models/Ground');
const User = require('../models/User');

exports.getStats = async (req, res) => {
  try {
    const [groundsCount, usersCount, bookingsCount, revenue] = await Promise.all([
      Ground.countDocuments({ $or: [{ approvalStatus: 'approved' }, { approvalStatus: { $exists: false } }] }),
      User.countDocuments({ role: 'user' }),
      Booking.countDocuments({ status: { $in: ['confirmed', 'completed'] } }),
      Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'completed'] }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).then((r) => (r[0]?.total ?? 0)),
    ]);
    res.json({
      success: true,
      data: {
        groundsCount,
        usersCount,
        bookingsCount,
        revenue,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
