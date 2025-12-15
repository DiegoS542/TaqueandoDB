const express = require("express");
const router = express.Router();
const inventarioController = require("../controllers/inventario.controller");
const verifyToken = require("../middlewares/auth.middleware");
const sucursalAccess = require("../middlewares/sucursal.middleware");

router.get(
  "/",
  verifyToken,
  sucursalAccess,
  inventarioController.listarInventario
);

router.post(
  "/",
  verifyToken,
  sucursalAccess,
  inventarioController.crearInventario
);

router.post(
  "/detalle",
  verifyToken,
  sucursalAccess,
  inventarioController.guardarDetalleInventario
);

module.exports = router;
