const express = require("express");
const router = express.Router();
const insumoController = require("../controllers/insumos.controller");
const verifyToken = require("../middlewares/auth.middleware");
const sucursalAccess = require("../middlewares/sucursal.middleware");

router.post("/", verifyToken, sucursalAccess, insumoController.crearInsumo);
router.get("/", verifyToken, sucursalAccess, insumoController.listarInsumos);
router.put(
  "/:id",
  verifyToken,
  sucursalAccess,
  insumoController.actualizarInsumo
);
router.delete(
  "/:id",
  verifyToken,
  sucursalAccess,
  insumoController.eliminarInsumo
);

module.exports = router;
