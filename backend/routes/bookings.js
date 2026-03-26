const express = require('express');
const router = express.Router();
const {
  getAvailableSlots,
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.get('/slots', getAvailableSlots);
router.get('/my', protect, getMyBookings);
router.post('/', protect, createBooking);
router.put('/:id/cancel', protect, cancelBooking);
router.get('/admin', protect, authorize('admin'), getAllBookings);
router.put('/:id/status', protect, authorize('admin'), updateBookingStatus);

module.exports = router;
