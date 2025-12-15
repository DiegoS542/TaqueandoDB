const express = require('express');
const router = express.Router();
const controller = require('../controllers/productos.controller');
const verifyToken = require('../middlewares/auth.middleware');

// ADMIN (CRUD)
router.get('/', verifyToken, controller.getProductos);
router.post('/', verifyToken, controller.createProducto);
router.put('/:id', verifyToken, controller.updateProducto);
router.delete('/:id', verifyToken, controller.deleteProducto);

// VENTAS (PÚBLICO)
router.get('/venta', controller.obtenerProductosVenta);

module.exports = router;
