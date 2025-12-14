const express = require('express');
const router = express.Router();
const controller = require('../controllers/pedidos.controller');
const verifyToken = require('../middlewares/auth.middleware');

// Rutas protegidas (Solo usuarios logueados pueden hacer pedidos)
router.post('/', verifyToken, controller.createPedido);
router.get('/sucursal/:sucursalId', verifyToken, controller.getPedidosBySucursal);

module.exports = router;