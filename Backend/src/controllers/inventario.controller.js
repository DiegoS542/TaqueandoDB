const db = require("../config/db");

exports.listarInventario = async (req, res) => {
  try {
    const filtroSucursal = req.filtroSucursal || {};

    const sql = `
      SELECT 
        i.insumo_id,
        i.nombre,
        i.unidad_medida,
        COALESCE(SUM(d.cantidad), 0) AS stock
      FROM inventarios inv
      JOIN detalle_inventario d 
        ON d.inventario_id = inv.inventario_id
      JOIN insumos i 
        ON i.insumo_id = d.insumo_id
      ${filtroSucursal.sucursal ? "WHERE inv.sucursal_id = $1" : ""}
      GROUP BY i.insumo_id, i.nombre, i.unidad_medida
      ORDER BY i.nombre ASC
    `;

    const params = filtroSucursal.sucursal ? [filtroSucursal.sucursal] : [];

    const result = await db.query(sql, params);

    res.status(200).json({
      msg: "Inventario obtenido con éxito",
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener inventario");
  }
};

exports.crearInventario = async (req, res) => {
  const { rol, sucursal_Id } = req.usuario;

  let sucursalFinal;
  console.log(rol);
  if (rol === "GERENTE") {
    sucursalFinal = sucursal_Id;
  } else {
    sucursalFinal = req.body.sucursal_id || null;
  }

  const result = await db.query(
    `INSERT INTO inventarios (sucursal_id, fecha)
     VALUES ($1, NOW())
     RETURNING inventario_id`,
    [sucursalFinal]
  );

  res.json(result.rows[0]);
};

exports.guardarDetalleInventario = async (req, res) => {
  const { inventario_id, detalles } = req.body;

  if (!inventario_id || !Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({ msg: "Datos inválidos" });
  }

  try {
    const invResult = await db.query(
      `SELECT sucursal_id FROM inventarios WHERE inventario_id = $1`,
      [inventario_id]
    );

    if (invResult.rows.length === 0) {
      return res.status(404).json({ msg: "Inventario no encontrado" });
    }

    const sucursalInventario = invResult.rows[0].sucursal_id;

    if (
      req.usuario.rol === "gerente" &&
      req.usuario.sucursal_id !== sucursalInventario
    ) {
      return res.status(403).json({
        msg: "No puede modificar inventarios de otra sucursal",
      });
    }

    await db.query("BEGIN");

    await db.query(`DELETE FROM detalle_inventario WHERE inventario_id = $1`, [
      inventario_id,
    ]);

    for (const d of detalles) {
      if (!d.insumo_id || typeof d.cantidad !== "number" || d.cantidad < 0) {
        await db.query("ROLLBACK");
        return res.status(400).json({
          msg: "Detalle inválido: insumo o cantidad incorrecta",
        });
      }

      await db.query(
        `INSERT INTO detalle_inventario 
         (inventario_id, insumo_id, cantidad)
         VALUES ($1, $2, $3)`,
        [inventario_id, d.insumo_id, d.cantidad]
      );
    }

    await db.query("COMMIT");

    res.status(201).json({
      msg: "Inventario guardado correctamente",
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ msg: "Error al guardar inventario" });
  }
};
