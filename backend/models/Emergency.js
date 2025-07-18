const mongoose = require('mongoose');

const EmergencySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  message: {
    type: String,
    required: true
  }
}, { timestamps: true });

EmergencySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Emergency', EmergencySchema);
