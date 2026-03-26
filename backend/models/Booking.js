const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ground: { type: mongoose.Schema.Types.ObjectId, ref: 'Ground', required: true },
  date: { type: Date, required: true }, // booking date (day)
  slotStart: { type: String, required: true }, // e.g. "09:00"
  slotEnd: { type: String, required: true },   // e.g. "10:00"
  amount: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  notes: { type: String, trim: true },
}, { timestamps: true });

// Compound index for availability checks
bookingSchema.index({ ground: 1, date: 1, slotStart: 1, slotEnd: 1 });
bookingSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
