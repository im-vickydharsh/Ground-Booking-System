const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  start: { type: String, required: true }, // e.g. "09:00"
  end: { type: String, required: true },   // e.g. "10:00"
  pricePerSlot: { type: Number, required: true, default: 0 },
});

const groundSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, enum: ['cricket', 'football', 'badminton', 'tennis', 'basketball', 'other'] },
  location: { type: String, required: true, trim: true },
  address: { type: String, trim: true },
  description: { type: String, trim: true },
  facilities: [{ type: String, trim: true }], // e.g. ["Parking", "Changing rooms", "Lights"]
  imageUrl: { type: String, trim: true },
  defaultSlots: [timeSlotSchema], // template slots; actual availability is per day
  pricePerHour: { type: Number, required: true, default: 0 },
  isActive: { type: Boolean, default: true },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Ground', groundSchema);
