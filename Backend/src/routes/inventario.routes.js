const express = require("express");
const router = express.Router();
const inventarioController = require("../controllers/inventario.controller");
const sucursalMiddleware = require("../middlewares/sucursal.middleware");

// GET todos los items (READ ALL)
router.get("/", sucursalMiddleware, inventarioController.listarInventario);

// GET un item por ID (READ ONE)
router.get("/:id", sucursalMiddleware, inventarioController.obtenerItemPorId);

// POST crear un nuevo item (CREATE)
// Ejemplo de ruta con middleware de protección: auth, authorize(['admin', 'gerente'])
router.post("/", sucursalMiddleware, inventarioController.crearItem);

// PUT actualizar un item completo (UPDATE)
router.put("/:id", sucursalMiddleware, inventarioController.actualizarItem);

// PATCH actualizar solo el stock (UPDATE PARCIAL)
router.patch(
  "/stock/:id",
  sucursalMiddleware,
  inventarioController.actualizarStock
);

// DELETE eliminar un item
router.delete("/:id", sucursalMiddleware, inventarioController.eliminarItem);

module.exports = router;
