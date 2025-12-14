const db = require("../config/db");
// const Inventario = require('../models/Inventario'); // Ya no es necesario

const { validationResult } = require("express-validator");

exports.listarInventario = async (req, res) => {
  try {
    const filtro = req.filtroSucursal || {};

    // CONSTRUCCIÓN DINÁMICA DE LA CONSULTA SQL
    let sql = "SELECT * FROM inventario";
    const params = [];

    // 1. Aplicar el filtro de sucursal
    if (filtro.sucursal) {
      sql += " WHERE sucursal = $1";
      params.push(filtro.sucursal);
    }

    // 2. Aplicar ordenamiento
    sql += " ORDER BY nombre ASC";

    const result = await db.query(sql, params);
    const inventarioItems = result.rows;

    if (!inventarioItems || inventarioItems.length === 0) {
      let msg = "No hay ítems registrados en el inventario.";
      if (Object.keys(filtro).length > 0 && filtro.sucursal) {
        msg = "No hay ítems registrados en el inventario para esta sucursal.";
      }
      return res.status(200).json({ msg, data: [] });
    }

    res.status(200).json({
      msg: "Lista de inventario obtenida con éxito.",
      data: inventarioItems,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error del servidor al obtener el inventario.");
  }
};

exports.obtenerItemPorId = async (req, res) => {
  try {
    const sql = "SELECT * FROM inventario WHERE id = $1";
    const result = await db.query(sql, [req.params.id]);
    const item = result.rows[0];

    if (!item) {
      return res.status(404).json({ msg: "Ítem de inventario no encontrado." });
    }

    res.status(200).json({
      msg: "Ítem obtenido con éxito.",
      data: item,
    });
  } catch (error) {
    console.error(error.message);
    // Manejo de error de SQL (ej: formato UUID incorrecto si ID es UUID)
    if (error.code === "22P02") {
      return res.status(400).json({ msg: "Formato de ID inválido." });
    }
    res.status(500).send("Error del servidor al buscar el ítem.");
  }
};

exports.crearItem = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errors: errores.array() });
  }

  const { codigo, nombre, insumoPrincipal, stockActual, unidad, sucursal } =
    req.body;

  if (!sucursal) {
    return res
      .status(400)
      .json({
        msg: "El ID de la sucursal es obligatorio para registrar un ítem.",
      });
  }

  try {
    // 1. Verificar si ya existe un ítem con el mismo código
    let checkSql = "SELECT id FROM inventario WHERE codigo = $1";
    let itemExistente = await db.query(checkSql, [codigo]);

    if (itemExistente.rows.length > 0) {
      return res
        .status(400)
        .json({ msg: "Ya existe un ítem con ese código.", codigo });
    }

    // 2. Crear el nuevo ítem (INSERT)
    const sql = `INSERT INTO inventario (codigo, nombre, insumoPrincipal, stockActual, unidad, sucursal, "ultimaActualizacion") 
                     VALUES ($1, $2, $3, $4, $5, $6, $7) 
                     RETURNING *`;

    const params = [
      codigo,
      nombre,
      insumoPrincipal,
      stockActual,
      unidad,
      sucursal,
      new Date(),
    ];

    const result = await db.query(sql, params);
    const itemGuardado = result.rows[0];

    res.status(201).json({
      msg: "Ítem de inventario creado con éxito.",
      data: itemGuardado,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error del servidor al crear el ítem.");
  }
};

exports.actualizarItem = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errors: errores.array() });
  }

  const { codigo, nombre, insumoPrincipal, stockActual, unidad, sucursal } =
    req.body;
  const itemId = req.params.id;

  try {
    // 1. Obtener el ítem existente
    let itemResult = await db.query(
      "SELECT codigo FROM inventario WHERE id = $1",
      [itemId]
    );
    let item = itemResult.rows[0];

    if (!item) {
      return res
        .status(404)
        .json({ msg: "Ítem de inventario no encontrado para actualizar." });
    }

    // 2. Verificar duplicados de código si se cambia
    if (codigo && codigo !== item.codigo) {
      let itemConMismoCodigo = await db.query(
        "SELECT id FROM inventario WHERE codigo = $1 AND id <> $2",
        [codigo, itemId]
      );
      if (itemConMismoCodigo.rows.length > 0) {
        return res
          .status(400)
          .json({ msg: "El nuevo código ya está en uso por otro ítem." });
      }
    }

    // 3. Construir la consulta de UPDATE dinámicamente
    const fields = [];
    const params = [];
    let paramCount = 1;

    if (codigo !== undefined) {
      fields.push(`codigo = $${paramCount++}`);
      params.push(codigo);
    }
    if (nombre !== undefined) {
      fields.push(`nombre = $${paramCount++}`);
      params.push(nombre);
    }
    if (insumoPrincipal !== undefined) {
      fields.push(`"insumoPrincipal" = $${paramCount++}`);
      params.push(insumoPrincipal);
    }
    if (stockActual !== undefined) {
      fields.push(`"stockActual" = $${paramCount++}`);
      params.push(stockActual);
    }
    if (unidad !== undefined) {
      fields.push(`unidad = $${paramCount++}`);
      params.push(unidad);
    }
    if (sucursal !== undefined) {
      fields.push(`sucursal = $${paramCount++}`);
      params.push(sucursal);
    }

    // Actualizar la fecha siempre
    fields.push(`"ultimaActualizacion" = $${paramCount++}`);
    params.push(new Date());

    // ID del ítem (último parámetro)
    params.push(itemId);

    const sql = `UPDATE inventario SET ${fields.join(
      ", "
    )} WHERE id = $${paramCount} RETURNING *`;

    const result = await db.query(sql, params);
    const itemActualizado = result.rows[0];

    res.status(200).json({
      msg: "Ítem de inventario actualizado con éxito.",
      data: itemActualizado,
    });
  } catch (error) {
    console.error(error.message);
    if (error.code === "22P02") {
      return res.status(400).json({ msg: "Formato de ID inválido." });
    }
    res.status(500).send("Error del servidor al actualizar el ítem.");
  }
};

exports.actualizarStock = async (req, res) => {
  const { cantidad } = req.body;
  const itemId = req.params.id;

  if (typeof cantidad !== "number") {
    return res
      .status(400)
      .json({ msg: "La cantidad debe ser un número válido." });
  }

  try {
    // 1. Obtener el stock actual (esto requiere una transacción segura en producción,
    // pero lo hacemos simple aquí para la demo)
    let itemResult = await db.query(
      'SELECT "stockActual" FROM inventario WHERE id = $1',
      [itemId]
    );
    let item = itemResult.rows[0];

    if (!item) {
      return res.status(404).json({ msg: "Ítem de inventario no encontrado." });
    }

    const nuevoStock = item.stockActual + cantidad;
    if (nuevoStock < 0) {
      return res
        .status(400)
        .json({ msg: "El stock resultante no puede ser negativo." });
    }

    // 2. Actualizar el stock
    const sql = `UPDATE inventario SET "stockActual" = $1, "ultimaActualizacion" = $2 WHERE id = $3 RETURNING *`;
    const params = [nuevoStock, new Date(), itemId];

    const result = await db.query(sql, params);
    const itemActualizado = result.rows[0];

    res.status(200).json({
      msg: `Stock actualizado a ${nuevoStock}.`,
      data: itemActualizado,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error del servidor al actualizar el stock.");
  }
};

exports.eliminarItem = async (req, res) => {
  try {
    const sql = "DELETE FROM inventario WHERE id = $1 RETURNING *";
    const result = await db.query(sql, [req.params.id]);
    const item = result.rows[0];

    if (!item) {
      return res.status(404).json({ msg: "Ítem de inventario no encontrado." });
    }

    res
      .status(200)
      .json({ msg: "Ítem de inventario eliminado con éxito.", data: item });
  } catch (error) {
    console.error(error.message);
    if (error.code === "22P02") {
      return res.status(400).json({ msg: "Formato de ID inválido." });
    }
    res.status(500).send("Error del servidor al eliminar el ítem.");
  }
};
