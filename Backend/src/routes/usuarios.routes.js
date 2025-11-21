const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuarios.controller');
const verifyToken = require('../middlewares/auth.middleware');

router.get('/test', (req, res) => {
    res.send('¡La ruta de usuarios existe!');
});

// Rutas protegidas (solo admin debería usarlas, controlado por el frontend y el token)
router.get('/', verifyToken, controller.getUsuarios);
router.post('/', verifyToken, controller.createUsuario);
router.put('/:id', verifyToken, controller.updateUsuario);
router.delete('/:id', verifyToken, controller.deleteUsuario);

module.exports = router;