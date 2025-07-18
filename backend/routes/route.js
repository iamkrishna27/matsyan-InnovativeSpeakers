// routes/route.js

const express = require('express');
const router = express.Router();
const FishingZone = require('../models/FishingZone');

// GET /api/route/optimal?lat=...&lng=...
router.get('/optimal', async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Missing lat or lng parameter' });
  }

  try {
    // Find nearby fishing zones sorted by distance
    const zones = await FishingZone.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: "distance",
          spherical: true
        }
      }
    ]);

    // Calculate average fish density and sort by best density
    const sorted = zones
      .map(zone => {
        const avgDensity = Object.values(zone.fishDensity).reduce((a, b) => a + b, 0) / Object.keys(zone.fishDensity).length;
        return { ...zone, avgDensity };
      })
      .sort((a, b) => b.avgDensity - a.avgDensity)
      .slice(0, 5); // Limit to best 5 zones

    res.json(sorted);

  } catch (err) {
    console.error("Optimal route error:", err);
    res.status(500).json({ error: 'Failed to calculate optimal route' });
  }
});

module.exports = router;
