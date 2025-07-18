const express = require('express');
const router = express.Router();
const FishingZone = require('../models/FishingZone');
const axios = require('axios');

// 1. GET /api/fishing/zones - Fetch all fishing zones
router.get('/zones', async (req, res) => {
  try {
    const zones = await FishingZone.find();
    res.json(zones);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch zones' });
  }
});

// 2. GET /api/fishing/optimal - Fetch high-density zones
router.get('/optimal', async (req, res) => {
  try {
    const zones = await FishingZone.find();
    const highDensityZones = zones.filter(zone => {
      const avgDensity = Object.values(zone.fishDensity).reduce((a, b) => a + b, 0) / Object.keys(zone.fishDensity).length;
      return avgDensity >= 0.6;
    });
    res.json(highDensityZones);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch optimal zones' });
  }
});

// 3. GET /api/fishing/predict?lat=...&lon=... - Predict fish density using weather data
router.get('/predict', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'Missing lat/lon' });

  try {
    const apiKey = process.env.WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await axios.get(url);
    const data = response.data;

    const temp = data.main.temp;
    const wind = data.wind.speed;
    const condition = data.weather[0].main;

    let density = 0.5;
    let reason = [];

    if (temp >= 20 && temp <= 27) {
      density += 0.2;
      reason.push("Ideal temperature");
    } else if (temp > 30) {
      density -= 0.1;
      reason.push("Too hot");
    } else if (temp < 18) {
      density -= 0.1;
      reason.push("Too cold");
    }

    if (wind < 4) {
      density += 0.2;
      reason.push("Low wind");
    } else if (wind > 8) {
      density -= 0.2;
      reason.push("High wind");
    }

    if (condition.includes("Cloud") || condition.includes("Rain")) {
      density += 0.1;
      reason.push("Cloudy/Rainy condition");
    }

    density = Math.max(0, Math.min(1, density));

    res.json({
      location: data.name,
      fishDensity: parseFloat(density.toFixed(2)),
      reason: reason.join(", ")
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to predict fish density" });
  }
});

module.exports = router;
