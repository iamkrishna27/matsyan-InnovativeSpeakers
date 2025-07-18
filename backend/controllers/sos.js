const Emergency = require('../models/Emergency');
const User = require('../models/User');
const twilio = require('../services/twilio.service');

exports.sendSOS = async (req, res) => {
  const { latitude, longitude, message } = req.body;
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const emergency = new Emergency({
      user: user._id,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      message
    });
    await emergency.save();

    for (const contact of user.emergencyContacts) {
      await twilio.sendSMS(contact, `🚨 EMERGENCY from ${user.username} at [${latitude},${longitude}]: ${message}`);
    }

    res.status(200).json({ success: true, message: 'SOS alert sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find().populate('user', 'username phone vesselName');
    res.json(emergencies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};