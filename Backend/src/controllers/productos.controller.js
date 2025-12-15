const db = require('../config/db');

// Obtener solo productos habilitados para la venta
const obtenerProductosVenta = async (req, res) => {
  try {
    // Filtramos por activo = true y ordenamos alfabéticamente
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

module.exports = {
  obtenerProductosVenta
};