const Ground = require('../models/Ground');

const isAdmin = (req) => req.user && req.user.role === 'admin';

exports.getGrounds = async (req, res) => {
  try {
    const { type, search, active, approvalStatus } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (active !== undefined) filter.isActive = active === 'true';

    if (!isAdmin(req)) {
      filter.isActive = true;
      filter.approvalStatus = 'approved';
    } else if (approvalStatus) {
      filter.approvalStatus = approvalStatus;
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
      ];
    }

    const grounds = await Ground.find(filter)
      .populate('createdBy', 'name')
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: grounds });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getGroundRequests = async (req, res) => {
  try {
    const grounds = await Ground.find({ approvalStatus: 'pending' }).populate('submittedBy', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: grounds });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getGroundById = async (req, res) => {
  try {
    const ground = await Ground.findById(req.params.id).populate('createdBy', 'name').populate('submittedBy', 'name email');
    if (!ground) {
      return res.status(404).json({ success: false, message: 'Ground not found' });
    }
    const approved = ground.approvalStatus === 'approved' || ground.approvalStatus == null;
    if (!approved && !isAdmin(req)) {
      return res.status(404).json({ success: false, message: 'Ground not found' });
    }
    res.json({ success: true, data: ground });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createGround = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    if (isAdmin(req)) {
      req.body.approvalStatus = 'approved';
      req.body.isActive = true;
    } else {
      req.body.approvalStatus = 'pending';
      req.body.isActive = false;
      req.body.submittedBy = req.user.id;
    }
    const ground = await Ground.create(req.body);
    res.status(201).json({ success: true, data: ground });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approveGround = async (req, res) => {
  try {
    const ground = await Ground.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: 'approved', isActive: true },
      { new: true }
    );
    if (!ground) return res.status(404).json({ success: false, message: 'Ground not found' });
    res.json({ success: true, data: ground });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rejectGround = async (req, res) => {
  try {
    const ground = await Ground.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: 'rejected' },
      { new: true }
    );
    if (!ground) return res.status(404).json({ success: false, message: 'Ground not found' });
    res.json({ success: true, data: ground });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateGround = async (req, res) => {
  try {
    const ground = await Ground.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ground) {
      return res.status(404).json({ success: false, message: 'Ground not found' });
    }
    res.json({ success: true, data: ground });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteGround = async (req, res) => {
  try {
    const ground = await Ground.findByIdAndDelete(req.params.id);
    if (!ground) {
      return res.status(404).json({ success: false, message: 'Ground not found' });
    }
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
