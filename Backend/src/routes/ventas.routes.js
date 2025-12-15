// Backend/src/routes/ventas.routes.js
const { Router } = require('express'); // O import { Router } from 'express' si usas modules
const router = Router();
const { crearVenta, obtenerVentas, obtenerVentaPorId } = require('../controllers/ventas.controller');

// Ruta para crear venta (POST)
router.post('/', crearVenta);

// NUEVA: Ruta para ver todas las ventas (GET)
// URL: http://localhost:3000/api/ventas
router.get('/', obtenerVentas);

// NUEVA: Ruta para ver una venta específica por su ID (GET)
// URL ejemplo: http://localhost:3000/api/ventas/123
router.get('/:id', obtenerVentaPorId);

module.exports = router;