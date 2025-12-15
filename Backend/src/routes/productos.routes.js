const express = require('express');
const router = express.Router();
const controller = require('../controllers/productos.controller');
const verifyToken = require('../middlewares/auth.middleware');

// 🔹 VENTAS (PÚBLICO)
router.get('/venta', controller.obtenerProductosVenta);

// 🔹 ADMIN (CRUD)
router.get('/', verifyToken, controller.getProductos);
router.post('/', verifyToken, controller.createProducto);
router.put('/:id', verifyToken, controller.updateProducto);
router.delete('/:id', verifyToken, controller.deleteProducto);

module.exports = router;
