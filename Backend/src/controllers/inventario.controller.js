const db = require("../config/db");
const { validationResult } = require("express-validator");

/**
 * @description: Lista los INSUMOS y calcula su stock actual (SUMA de detalle_inventario).
 * Nota: Dado tu MER, esta es la forma más útil de listar el "inventario".
 */
exports.listarInventario = async (req, res) => {
  try {
    const filtro = req.filtroSucursal || {};

    let sql = `
            SELECT 
                i.insumo_id, 
                i.nombre, 
                i.unidad_medida,
                -- Calcula el stock sumando las cantidades del detalle_inventario (entradas/salidas)
                COALESCE(SUM(di.cantidad), 0) AS stock_actual,
                (
                    SELECT MAX(inv.fecha) 
                    FROM inventarios inv
                    JOIN detalle_inventario di_inner ON inv.inventario_id = di_inner.inventario_id
                    WHERE di_inner.insumo_id = i.insumo_id
                    [FILTRO_SUCURSAL_INNER]
                ) AS ultima_actualizacion
            FROM 
                insumos i
            LEFT JOIN
                detalle_inventario di ON i.insumo_id = di.insumo_id
            LEFT JOIN
                inventarios inv ON di.inventario_id = inv.inventario_id
            
            [WHERE_SUCURSAL]
            
            GROUP BY 
                i.insumo_id, i.nombre, i.unidad_medida
            ORDER BY 
                i.nombre ASC;
        `;

    const params = [];
    let whereClause = "";
    let innerFilter = "";

    // Aplicar el filtro de sucursal
    if (filtro.sucursal) {
      params.push(filtro.sucursal);
      // El filtro principal debe ir en la cabecera del inventario
      whereClause = ` WHERE inv.sucursal_id = $1`;
      innerFilter = ` AND inv.sucursal_id = $1`;
    }

    sql = sql.replace("[WHERE_SUCURSAL]", whereClause);
    sql = sql.replace("[FILTRO_SUCURSAL_INNER]", innerFilter);

    const result = await db.query(sql, params);
    const inventarioItems = result.rows;

    if (!inventarioItems || inventarioItems.length === 0) {
      let msg = "No hay insumos registrados.";
      if (Object.keys(filtro).length > 0 && filtro.sucursal) {
        msg = "No hay insumos con movimientos en esta sucursal.";
      }
      return res.status(200).json({ msg, data: [] });
    }

    res.status(200).json({
      msg: "Lista de insumos con stock obtenida con éxito.",
      data: inventarioItems,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error del servidor al obtener el inventario.");
  }
};

/**
 * @description: Obtiene la información maestra de un Insumo por su ID.
 */
exports.obtenerItemPorId = async (req, res) => {
  try {
    // En este modelo, "obtener ítem" significa obtener el registro maestro del insumo
    const sql = "SELECT * FROM insumos WHERE insumo_id = $1";
    const result = await db.query(sql, [req.params.id]);
    const item = result.rows[0];

    if (!item) {
      return res.status(404).json({ msg: "Insumo no encontrado." });
    }

    res.status(200).json({
      msg: "Insumo obtenido con éxito.",
      data: item,
    });
  } catch (error) {
    console.error(error.message);
    if (error.code === "22P02") {
      return res.status(400).json({ msg: "Formato de ID inválido." });
    }
    res.status(500).send("Error del servidor al buscar el insumo.");
  }
};

/**
 * @description: Crea un nuevo Insumo maestro.
 */
exports.crearItem = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errors: errores.array() });
  }

  // Se asume que el body trae 'nombre' y 'unidad_medida' para la tabla insumos.
  // Los campos 'codigo', 'stockActual', 'insumoPrincipal' no existen en tu MER maestro.
  const { nombre, unidad_medida } = req.body;

  try {
    // 1. Verificar si ya existe un insumo con el mismo nombre
    let checkSql = "SELECT insumo_id FROM insumos WHERE nombre = $1";
    let itemExistente = await db.query(checkSql, [nombre]);

    if (itemExistente.rows.length > 0) {
      return res
        .status(400)
        .json({ msg: "Ya existe un insumo con ese nombre.", nombre });
    }

    // 2. Crear el nuevo Insumo (INSERT en tabla insumos)
    const sql = `INSERT INTO insumos (nombre, unidad_medida) 
                     VALUES ($1, $2) 
                     RETURNING *`;

    const params = [nombre, unidad_medida];

    const result = await db.query(sql, params);
    const itemGuardado = result.rows[0];

    res.status(201).json({
      msg: "Insumo maestro creado con éxito.",
      data: itemGuardado,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error del servidor al crear el insumo.");
  }
};

/**
 * @description: Actualiza la información maestra de un Insumo.
 */
exports.actualizarItem = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errors: errores.array() });
  }

  // Se asume que el body trae 'nombre' y 'unidad_medida' para la tabla insumos.
  const { nombre, unidad_medida } = req.body;
  const itemId = req.params.id; // insumo_id

  try {
    // 1. Obtener el insumo existente
    let itemResult = await db.query(
      "SELECT nombre FROM insumos WHERE insumo_id = $1",
      [itemId]
    );
    let item = itemResult.rows[0];

    if (!item) {
      return res
        .status(404)
        .json({ msg: "Insumo no encontrado para actualizar." });
    }

    // 2. Verificar duplicados de nombre si se cambia
    if (nombre && nombre !== item.nombre) {
      let itemConMismoNombre = await db.query(
        "SELECT insumo_id FROM insumos WHERE nombre = $1 AND insumo_id <> $2",
        [nombre, itemId]
      );
      if (itemConMismoNombre.rows.length > 0) {
        return res
          .status(400)
          .json({ msg: "El nuevo nombre ya está en uso por otro insumo." });
      }
    }

    // 3. Construir la consulta de UPDATE dinámicamente
    const fields = [];
    const params = [];
    let paramCount = 1;

    if (nombre !== undefined) {
      fields.push(`nombre = $${paramCount++}`);
      params.push(nombre);
    }
    if (unidad_medida !== undefined) {
      fields.push(`unidad_medida = $${paramCount++}`);
      params.push(unidad_medida);
    }

    if (fields.length === 0) {
      return res
        .status(400)
        .json({ msg: "No se proporcionaron campos para actualizar." });
    }

    // ID del ítem (último parámetro)
    params.push(itemId);

    const sql = `UPDATE insumos SET ${fields.join(
      ", "
    )} WHERE insumo_id = $${paramCount} RETURNING *`;

    const result = await db.query(sql, params);
    const itemActualizado = result.rows[0];

    res.status(200).json({
      msg: "Insumo maestro actualizado con éxito.",
      data: itemActualizado,
    });
  } catch (error) {
    console.error(error.message);
    if (error.code === "22P02") {
      return res.status(400).json({ msg: "Formato de ID inválido." });
    }
    res.status(500).send("Error del servidor al actualizar el insumo.");
  }
};

/**
 * @description: Registra un movimiento de stock (CREATE en inventarios + detalle_inventario).
 * Este método reemplaza 'actualizarStock' ya que el modelo es transaccional.
 */
exports.registrarMovimientoStock = async (req, res) => {
  // Se espera: { insumo_id, sucursal_id, cantidad }
  const { insumo_id, sucursal_id, cantidad } = req.body;

  if (typeof cantidad !== "number" || !insumo_id || !sucursal_id) {
    return res
      .status(400)
      .json({
        msg: "Datos de movimiento inválidos (insumo_id, sucursal_id y cantidad son requeridos).",
      });
  }

  try {
    // 1. Iniciar la transacción (fundamental para modelos transaccionales)
    await db.query("BEGIN");

    // 2. Insertar la Cabecera del Movimiento (inventarios)
    const cabeceraSql = `INSERT INTO inventarios (sucursal_id, fecha) 
                             VALUES ($1, $2) RETURNING inventario_id`;
    const cabeceraResult = await db.query(cabeceraSql, [
      sucursal_id,
      new Date(),
    ]);
    const inventario_id = cabeceraResult.rows[0].inventario_id;

    // 3. Insertar el Detalle del Movimiento (detalle_inventario)
    const detalleSql = `INSERT INTO detalle_inventario (inventario_id, insumo_id, cantidad) 
                            VALUES ($1, $2, $3) RETURNING detalle_inv_id`;
    const detalleResult = await db.query(detalleSql, [
      inventario_id,
      insumo_id,
      cantidad,
    ]);

    // 4. Confirmar la transacción
    await db.query("COMMIT");

    res.status(201).json({
      msg: `Movimiento de stock registrado con éxito (Inventario ID: ${inventario_id}).`,
      data: {
        inventario_id,
        detalle_inv_id: detalleResult.rows[0].detalle_inv_id,
      },
    });
  } catch (error) {
    // En caso de error, revertir la transacción
    await db.query("ROLLBACK");
    console.error(error.message);
    res
      .status(500)
      .send("Error del servidor al registrar el movimiento de stock.");
  }
};

/**
 * @description: Elimina un Insumo maestro (y sus dependencias si no hay restricciones).
 */
exports.eliminarItem = async (req, res) => {
  try {
    // NOTA: Si hay movimientos en detalle_inventario para este insumo,
    // la BD debería RECHAZAR la eliminación (restricción FK ON DELETE RESTRICT).
    // Si quieres que se eliminen en cascada, debes configurar la FK en la DB.

    const sql = "DELETE FROM insumos WHERE insumo_id = $1 RETURNING *";
    const result = await db.query(sql, [req.params.id]);
    const item = result.rows[0];

    if (!item) {
      return res.status(404).json({ msg: "Insumo no encontrado." });
    }

    res
      .status(200)
      .json({ msg: "Insumo maestro eliminado con éxito.", data: item });
  } catch (error) {
    console.error(error.message);
    if (error.code === "22P02") {
      return res.status(400).json({ msg: "Formato de ID inválido." });
    }
    // PostgreSQL error code 23503: foreign_key_violation
    if (error.code === "23503") {
      return res
        .status(400)
        .json({
          msg: "No se puede eliminar el insumo. Tiene movimientos de inventario asociados.",
        });
    }
    res.status(500).send("Error del servidor al eliminar el ítem.");
  }
};

// Se renombró la exportación de actualizarStock para usar el nuevo método transaccional
exports.actualizarStock = exports.registrarMovimientoStock;
