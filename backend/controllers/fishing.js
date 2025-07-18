const FishingZone = require('../models/FishingZone');
const axios = require('axios');

// GET all zones
exports.getZones = async (req, res) => {
  try {
    const zones = await FishingZone.find();
    res.json(zones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET optimal nearby fishing zones
exports.findOptimalZones = async (req, res) => {
  const { lat, lng, species } = req.query;

  try {
    const zones = await FishingZone.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: "distance",
          spherical: true
        }
      },
      {
        $match: {
          [`fishDensity.${species}`]: { $gt: 0.3 }
        }
      },
      { $limit: 5 }
    ]);

    res.json(zones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Predict fish availability based on weather
exports.predictFish = async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'Latitude and longitude required' });

  try {
    const zones = await FishingZone.find();
    let closestZone = null;
    let minDistance = Infinity;

    zones.forEach(zone => {
      const [zoneLon, zoneLat] = zone.location.coordinates;
      const distance = Math.sqrt(Math.pow(lat - zoneLat, 2) + Math.pow(lon - zoneLon, 2));
      if (distance < minDistance) {
        minDistance = distance;
        closestZone = zone;
      }
    });

    if (!closestZone) {
      return res.status(404).json({ error: 'No nearby fishing zone found' });
    }

    const weatherApiKey = process.env.OPENWEATHER_API_KEY;
    const weatherRes = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat,
        lon,
        appid: weatherApiKey,
        units: 'metric'
      }
    });

    const weather = weatherRes.data;
    const temp = weather.main.temp;
    const humidity = weather.main.humidity;
    const condition = weather.weather[0].main;

    const avgDensity = Object.values(closestZone.fishDensity).reduce((a, b) => a + b, 0) / Object.keys(closestZone.fishDensity).length;
    const recommendation = avgDensity > 0.5 && humidity < 90
      ? "✅ Good fishing conditions"
      : "⚠️ Poor fishing conditions";

    res.json({
      zone: closestZone.name,
      fishDensity: closestZone.fishDensity,
      weather: {
        temperature: temp,
        humidity,
        condition
      },
      recommendation
    });
  } catch (err) {
    console.error("Prediction error:", err.message);
    res.status(500).json({ error: 'Failed to predict fish density' });
  }
};
