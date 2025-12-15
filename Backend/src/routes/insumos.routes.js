const express = require('express');
const router = express.Router();
const controller = require('../controllers/insumos.controller');
const verifyToken = require('../middlewares/auth.middleware');

// Rutas protegidas
router.get('/', verifyToken, controller.getInsumos);
router.post('/', verifyToken, controller.createInsumo);
router.put('/:id', verifyToken, controller.updateInsumo);
router.delete('/:id', verifyToken, controller.deleteInsumo);

module.exports = router;