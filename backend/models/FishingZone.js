const mongoose = require('mongoose');

const FishingZoneSchema = new mongoose.Schema({
  name: String,
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  fishDensity: {
    type: Map,
    of: Number // e.g., { tuna: 0.5, salmon: 0.8 }
  }
});

FishingZoneSchema.index({ location: "2dsphere" });

module.exports = mongoose.model('FishingZone', FishingZoneSchema);
