const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sos');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, sosController.sendSOS);

module.exports = router;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');