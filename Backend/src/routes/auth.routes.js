const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

const verifyToken = require('../middlewares/auth.middleware');

// Definir la ruta POST /login
router.post('/login', authController.login);

module.exports = router;