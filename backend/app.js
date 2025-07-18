const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const authRoutes = require('./routes/auth.routes');


// Initialize Express
const app = express();
app.use('/api/auth', authRoutes);
// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
require('./config/db');

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/fishing', require('./routes/fishing.routes'));
app.use('/api/sos', require('./routes/sos.routes'));
const weatherRoutes = require('./routes/weather.routes');
app.use('/api/weather', weatherRoutes);
const routeRoutes = require('./routes/route');
app.use('/api/route', routeRoutes);
app.use('/api/db',require('./config/db'));

app.get('/', (req, res) => {
  res.send('INGA NAANGATHA SmartNav API');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port nammathaaa ${PORT}`);
});