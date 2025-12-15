const db = require("../config/db");
const { validationResult } = require("express-validator");

exports.listarInsumos = async (req, res) => {
  const { rol, sucursal_id } = req.usuario; // Desestructuramos sucursal_id si la necesitamos
  try {
    let query = `
   SELECT i.insumo_id, i.nombre, i.unidad_medida
   FROM insumos i
  `;
    let params = []; // La lógica solo aplica si NO eres admin

    if (rol !== "admin") {
      // Usamos la sucursal del token (sucursal_id)
      const sucursalId = sucursal_id;

      query += ` WHERE i.sucursal_id = $1`;
      params.push(sucursalId);
    } // Si rol es 'admin', params queda vacío y la query se ejecuta sin WHERE

    const result = await db.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error("Error en listarInsumos:", error); // Es crucial ver el error real
    res.status(500).json({ msg: "Error al cargar insumos" });
  }
};

exports.obtenerInsumoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const sql = `
      SELECT 
        insumo_id,
        nombre,
        unidad_medida
      FROM insumos
      WHERE insumo_id = $1
    `;

    const result = await db.query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: "Insumo no encontrado" });
    }

    res.status(200).json({
      msg: "Insumo obtenido correctamente",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    if (error.code === "22P02") {
      return res.status(400).json({ msg: "ID inválido" });
    }

    res.status(500).send("Error del servidor al obtener insumo");
  }
};

exports.crearInsumo = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errors: errores.array() });
  }

  const { nombre, unidad_medida } = req.body;

  if (!nombre || !unidad_medida) {
    return res.status(400).json({
      msg: "Nombre y unidad de medida son obligatorios",
    });
  }

  try {
    // Verificar duplicado
    const existe = await db.query(
      "SELECT insumo_id FROM insumos WHERE nombre = $1",
      [nombre]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({
        msg: "Ya existe un insumo con ese nombre",
      });
    }

    const sql = `
      INSERT INTO insumos (nombre, unidad_medida)
      VALUES ($1, $2)
      RETURNING insumo_id, nombre, unidad_medida
    `;

    const result = await db.query(sql, [nombre, unidad_medida]);

    res.status(201).json({
      msg: "Insumo creado correctamente",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error del servidor al crear insumo");
  }
};

exports.actualizarInsumo = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errors: errores.array() });
  }

  const { id } = req.params;
  const { nombre, unidad_medida } = req.body;

  if (!nombre && !unidad_medida) {
    return res.status(400).json({
      msg: "Debe enviar al menos un campo a actualizar",
    });
  }

  try {
    const existe = await db.query(
      "SELECT insumo_id, nombre FROM insumos WHERE insumo_id = $1",
      [id]
    );

    if (existe.rows.length === 0) {
      return res.status(404).json({ msg: "Insumo no encontrado" });
    }

    // Validar nombre duplicado
    if (nombre) {
      const duplicado = await db.query(
        "SELECT insumo_id FROM insumos WHERE nombre = $1 AND insumo_id <> $2",
        [nombre, id]
      );

      if (duplicado.rows.length > 0) {
        return res.status(400).json({
          msg: "El nombre ya está en uso",
        });
      }
    }

    const campos = [];
    const valores = [];
    let i = 1;

    if (nombre) {
      campos.push(`nombre = $${i++}`);
      valores.push(nombre);
    }

    if (unidad_medida) {
      campos.push(`unidad_medida = $${i++}`);
      valores.push(unidad_medida);
    }

    valores.push(id);

    const sql = `
      UPDATE insumos
      SET ${campos.join(", ")}
      WHERE insumo_id = $${i}
      RETURNING insumo_id, nombre, unidad_medida
    `;

    const result = await db.query(sql, valores);

    res.status(200).json({
      msg: "Insumo actualizado correctamente",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    if (error.code === "22P02") {
      return res.status(400).json({ msg: "ID inválido" });
    }

    res.status(500).send("Error del servidor al actualizar insumo");
  }
};

exports.eliminarInsumo = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM insumos WHERE insumo_id = $1 RETURNING insumo_id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: "Insumo no encontrado" });
    }

    res.status(200).json({
      msg: "Insumo eliminado correctamente",
    });
  } catch (error) {
    console.error(error);

    if (error.code === "23503") {
      return res.status(400).json({
        msg: "No se puede eliminar el insumo porque tiene movimientos de inventario",
      });
    }

    res.status(500).send("Error del servidor al eliminar insumo");
  }
};
