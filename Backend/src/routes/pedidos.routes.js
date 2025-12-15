const express = require('express');
const router = express.Router();
const controller = require('../controllers/pedidos.controller');
const verifyToken = require('../middlewares/auth.middleware');

// Rutas protegidas (Solo usuarios logueados pueden hacer pedidos)
router.get('/stats', verifyToken, controller.getDashboardStats);
router.post('/', verifyToken, controller.createPedido);
router.get('/sucursal/:sucursalId', verifyToken, controller.getPedidosBySucursal);
router.get('/:id/detalle', verifyToken, controller.getDetallePedido);
router.delete('/:id', verifyToken, controller.deletePedido);
router.put('/:id', verifyToken, controller.updatePedido);
//router.put('/:id', controller.updatePedido);

module.exports = router;