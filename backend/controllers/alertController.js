const Alert = require('../models/Alert');
const Security = require('../models/Security');

/**
 * @desc    Get all alerts for user
 * @route   GET /api/alerts
 * @access  Private
 */
const getAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new alert
 * @route   POST /api/alerts
 * @access  Private
 */
const createAlert = async (req, res, next) => {
  try {
    const { stockSymbol, targetPrice, condition } = req.body;

    // Validation
    if (!stockSymbol || !targetPrice || !condition) {
      return res.status(400).json({
        success: false,
        message: 'Please provide stockSymbol, targetPrice, and condition',
      });
    }

    // Check if security exists
    const security = await Security.findOne({ symbol: stockSymbol.toUpperCase() });
    if (!security) {
      return res.status(404).json({
        success: false,
        message: 'Security not found',
      });
    }

    // Check if alert already exists
    const existingAlert = await Alert.findOne({
      user: req.user._id,
      stockSymbol: stockSymbol.toUpperCase(),
      targetPrice,
      condition,
      isTriggered: false,
    });

    if (existingAlert) {
      return res.status(400).json({
        success: false,
        message: 'Alert already exists',
      });
    }

    const alert = await Alert.create({
      user: req.user._id,
      stockSymbol: stockSymbol.toUpperCase(),
      targetPrice,
      condition,
      isTriggered: false,
    });

    res.status(201).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an alert
 * @route   DELETE /api/alerts/:id
 * @access  Private
 */
const deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found',
      });
    }

    await Alert.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Alert deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlerts,
  createAlert,
  deleteAlert,
};


