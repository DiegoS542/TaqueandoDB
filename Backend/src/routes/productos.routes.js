const { Router } = require('express');
const router = Router();
const { obtenerProductosVenta } = require('../controllers/productos.controller');

// GET http://localhost:3000/api/productos/venta
router.get('/venta', obtenerProductosVenta);

module.exports = router;