const express = require('express');
const router = express.Router();
const controller = require('../controllers/sucursales.controller');
const verifyToken = require('../middlewares/auth.middleware');

// Todas las rutas requieren estar logueado (verifyToken)

// GET /api/sucursales (Obtener todas)
router.get('/', verifyToken, controller.getSucursales);

// GET /api/sucursales/:id (Obtener una)
router.get('/:id', verifyToken, controller.getSucursalById);

// POST /api/sucursales (Crear)
router.post('/', verifyToken, controller.createSucursal);

// PUT /api/sucursales/:id (Editar)
router.put('/:id', verifyToken, controller.updateSucursal);

// DELETE /api/sucursales/:id (Eliminar)
router.delete('/:id', verifyToken, controller.deleteSucursal);

module.exports = router;