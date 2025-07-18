const express = require('express');
const axios = require('axios');
const router = express.Router();

// Replace with your real OpenWeatherMap API key
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
console.log('Loaded API Key:', OPENWEATHER_API_KEY); // Add this line

// @route   GET /api/weather?lat=xx&lon=yy
// @desc    Get current weather data
router.get('/', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          lat,
          lon,
          appid: OPENWEATHER_API_KEY,
          units: 'metric',
        },
      }
    );

    const weather = response.data;
    res.json({
      location: weather.name,
      temperature: weather.main.temp,
      humidity: weather.main.humidity,
      condition: weather.weather[0].main,
      description: weather.weather[0].description,
      wind_speed: weather.wind.speed,
    });

  } catch (error) {
    console.error('Error fetching weather:', error.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

module.exports = router;

