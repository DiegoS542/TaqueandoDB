const express = require('express');
const router = express.Router();
const controller = require('../controllers/proveedores.controller');
const verifyToken = require('../middlewares/auth.middleware');

router.get('/', verifyToken, controller.getProveedores);
router.post('/', verifyToken, controller.createProveedor);
router.put('/:id', verifyToken, controller.updateProveedor);
router.delete('/:id', verifyToken, controller.deleteProveedor);
router.get('/:id/insumos', verifyToken, controller.getInsumosByProveedor);

module.exports = router;