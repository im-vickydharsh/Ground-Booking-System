const Booking = require('../models/Booking');
const Ground = require('../models/Ground');

// Get available time slots for a ground on a date (exclude already booked slots)
exports.getAvailableSlots = async (req, res) => {
  try {
    const { groundId, date } = req.query;
    if (!groundId || !date) {
      return res.status(400).json({ success: false, message: 'groundId and date (YYYY-MM-DD) required' });
    }
    const ground = await Ground.findById(groundId);
    if (!ground) {
      return res.status(404).json({ success: false, message: 'Ground not found' });
    }
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const booked = await Booking.find({
      ground: groundId,
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $in: ['confirmed'] },
    }).select('slotStart slotEnd');

    const templateSlots = ground.defaultSlots && ground.defaultSlots.length
      ? ground.defaultSlots
      : generateDefaultSlots(ground.pricePerHour);

    const available = templateSlots.filter((slot) => {
      const overlap = booked.some(
        (b) => !(slot.end <= b.slotStart || slot.start >= b.slotEnd)
      );
      return !overlap;
    });

    res.json({ success: true, data: available });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

function generateDefaultSlots(pricePerHour) {
  const slots = [];
  for (let h = 6; h < 22; h++) {
    const start = `${String(h).padStart(2, '0')}:00`;
    const end = `${String(h + 1).padStart(2, '0')}:00`;
    slots.push({ start, end, pricePerSlot: pricePerHour || 0 });
  }
  return slots;
}

exports.createBooking = async (req, res) => {
  try {
    const { groundId, date, slotStart, slotEnd, notes } = req.body;
    if (!groundId || !date || !slotStart || !slotEnd) {
      return res.status(400).json({ success: false, message: 'groundId, date, slotStart, slotEnd required' });
    }
    const ground = await Ground.findById(groundId);
    if (!ground) {
      return res.status(404).json({ success: false, message: 'Ground not found' });
    }

    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    const existing = await Booking.findOne({
      ground: groundId,
      date: bookingDate,
      status: { $in: ['confirmed'] },
      slotStart: { $lt: slotEnd },
      slotEnd: { $gt: slotStart },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Slot no longer available' });
    }

    const hours = (parseTime(slotEnd) - parseTime(slotStart)) / 60;
    const amount = Math.round((ground.pricePerHour || 0) * hours * 100) / 100;

    const booking = await Booking.create({
      user: req.user.id,
      ground: groundId,
      date: bookingDate,
      slotStart,
      slotEnd,
      amount,
      notes,
      status: 'confirmed',
    });

    const populated = await Booking.findById(booking._id)
      .populate('ground', 'name type location pricePerHour')
      .populate('user', 'name email');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

function parseTime(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('ground', 'name type location pricePerHour')
      .sort({ date: -1, slotStart: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Already cancelled' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const { groundId, status, from, to } = req.query;
    const filter = {};
    if (groundId) filter.ground = groundId;
    if (status) filter.status = status;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    const bookings = await Booking.find(filter)
      .populate('ground', 'name type location')
      .populate('user', 'name email')
      .sort({ date: -1, slotStart: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('ground', 'name type location').populate('user', 'name email');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
