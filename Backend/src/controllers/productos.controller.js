const db = require('../config/db');

// ==============================
// OBTENER TODOS LOS PRODUCTOS (ADMIN)
// ==============================
const getProductos = async (req, res) => {
  try {
    const query = `
      SELECT producto_id, nombre, descripcion, precio_venta, categoria, activo
      FROM productos
      ORDER BY nombre ASC
    `;
    const response = await db.query(query);
    res.status(200).json(response.rows);

  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ==============================
// OBTENER PRODUCTOS DE VENTA (PÚBLICO)
// ==============================
const obtenerProductosVenta = async (req, res) => {
  try {
    const query = `
      SELECT producto_id, nombre, descripcion, precio_venta, categoria
      FROM productos
      WHERE activo = true
      ORDER BY nombre ASC
    `;
    const response = await db.query(query);
    res.status(200).json(response.rows);

  } catch (error) {
    console.error('Error al obtener productos de venta:', error);
    res.status(500).json({ message: 'Error interno al cargar productos' });
  }
};

// ==============================
// CREAR PRODUCTO
// ==============================
const createProducto = async (req, res) => {
  const { nombre, descripcion, precio_venta, categoria } = req.body;

  if (!nombre || !precio_venta) {
    return res.status(400).json({ error: 'Nombre y precio son obligatorios' });
  }

  try {
    const query = `
      INSERT INTO productos (nombre, descripcion, precio_venta, categoria, activo)
      VALUES ($1, $2, $3, $4, true)
      RETURNING *
    `;
    const response = await db.query(query, [
      nombre,
      descripcion,
      precio_venta,
      categoria
    ]);

    res.status(201).json(response.rows[0]);

  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

// ==============================
// ACTUALIZAR PRODUCTO
// ==============================
const updateProducto = async (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, descripcion, precio_venta, categoria, activo } = req.body;

  try {
    const query = `
      UPDATE productos
      SET nombre = $1,
          descripcion = $2,
          precio_venta = $3,
          categoria = $4,
          activo = COALESCE($5, activo)
      WHERE producto_id = $6
      RETURNING *
    `;

    const response = await db.query(query, [
      nombre,
      descripcion,
      precio_venta,
      categoria,
      activo,
      id
    ]);

    if (response.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json(response.rows[0]);

  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

// ==============================
// ELIMINAR PRODUCTO (BORRADO LÓGICO)
// ==============================
const deleteProducto = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const query = `
      UPDATE productos
      SET activo = false
      WHERE producto_id = $1
      RETURNING *
    `;
    const response = await db.query(query, [id]);

    if (response.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json({ message: 'Producto desactivado correctamente' });

  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error interno al eliminar producto' });
  }
};

module.exports = {
  getProductos,
  obtenerProductosVenta,
  createProducto,
  updateProducto,
  deleteProducto
};
