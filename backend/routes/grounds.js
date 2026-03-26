const express = require('express');
const router = express.Router();
const {
  getGrounds,
  getGroundById,
  getGroundRequests,
  createGround,
  updateGround,
  deleteGround,
  approveGround,
  rejectGround,
} = require('../controllers/groundController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getGrounds);
router.get('/requests', protect, authorize('admin'), getGroundRequests);
router.put('/:id/approve', protect, authorize('admin'), approveGround);
router.put('/:id/reject', protect, authorize('admin'), rejectGround);
router.get('/:id', getGroundById);
router.post('/', protect, createGround);
router.put('/:id', protect, authorize('admin'), updateGround);
router.delete('/:id', protect, authorize('admin'), deleteGround);

module.exports = router;
