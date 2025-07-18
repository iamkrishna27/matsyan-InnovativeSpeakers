const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/auth');
const authMiddleware = require('../middleware/auth');

// Reusable validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    res.status(400).json({ errors: errors.array() });
  };
};

router.post(
  '/register',
  validate([
    body('username').notEmpty().isLength({ min: 3 }),
    body('password').notEmpty().isLength({ min: 6 }),
    body('phone').notEmpty().isMobilePhone()
  ]),
  authController.register
);

router.post(
  '/login',
  validate([
    body('username').notEmpty(),
    body('password').notEmpty()
  ]),
  authController.login
);

router.get('/user', authMiddleware, authController.getUser);

module.exports = router;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');