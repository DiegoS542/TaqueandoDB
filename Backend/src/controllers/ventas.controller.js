const db = require('../config/db'); // Asegúrate que db.js exporte { pool, query }

// ---------------------------------------------------------
// 1. CREAR VENTA (Transaccional)
// ---------------------------------------------------------
const crearVenta = async (req, res) => {
  // Nota: Si en el futuro agregas usuario_id a la tabla ventas, añádelo aquí.
  const { sucursal_id, total, detalles } = req.body;
  
  // Obtenemos un cliente del pool para manejar la transacción
  const client = await db.pool.connect();

  try {
    // 1. Iniciar Transacción
    await client.query('BEGIN');

    // ---------------------------------------------------------
    // PASO A: Insertar en la tabla 'ventas'
    // ---------------------------------------------------------
    // Columnas según tu imagen: sucursal_id, fecha, total_venta
    const ventaQuery = `
      INSERT INTO ventas (sucursal_id, total_venta, fecha)
      VALUES ($1, $2, NOW())
      RETURNING venta_id
    `;
    
    // Ejecutamos la consulta enviando los valores
    const ventaResult = await client.query(ventaQuery, [sucursal_id, total]);
    
    // Obtenemos el ID generado (venta_id)
    const nuevaVentaId = ventaResult.rows[0].venta_id;

    // ---------------------------------------------------------
    // PASO B: Insertar en la tabla 'detalle_ventas'
    // ---------------------------------------------------------
    // Columnas según tu imagen: venta_id, producto_id, cantidad, precio_unitario_venta
    const detalleQuery = `
      INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario_venta)
      VALUES ($1, $2, $3, $4)
    `;

    for (const item of detalles) {
      await client.query(detalleQuery, [
        nuevaVentaId,           // El ID de la venta que acabamos de crear
        item.producto_id,       // Viene del frontend
        item.cantidad,          // Viene del frontend
        item.precio_unitario    // Viene del frontend
      ]);
    }

    // 2. Confirmar Transacción (Guardar cambios permanentemente)
    await client.query('COMMIT');

    res.status(201).json({ 
      message: 'Venta registrada con éxito', 
      ventaId: nuevaVentaId 
    });

  } catch (error) {
    // 3. Si algo falla, deshacemos todo (Rollback) para no dejar datos corruptos
    await client.query('ROLLBACK');
    console.error('Error en transacción de venta:', error);
    res.status(500).json({ message: 'Error al procesar la venta', error: error.message });
  } finally {
    // 4. Liberar el cliente
    client.release();
  }
}; // <--- AQUÍ FALTABA CERRAR LA LLAVE Y EL PUNTO Y COMA

// ---------------------------------------------------------
// 2. OBTENER LISTA DE VENTAS (Historial)
// ---------------------------------------------------------
const obtenerVentas = async (req, res) => {
  try {
    // Seleccionamos las ventas ordenadas por fecha (las más recientes primero)
    // Usamos los nombres de columna exactos de tus imágenes: venta_id, fecha, total_venta
    const response = await db.query(
      'SELECT venta_id, sucursal_id, fecha, total_venta FROM ventas ORDER BY fecha DESC'
    );
    res.status(200).json(response.rows);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ message: 'Error al obtener el historial de ventas' });
  }
};

// ---------------------------------------------------------
// 3. OBTENER UNA VENTA ESPECÍFICA CON SUS DETALLES
// ---------------------------------------------------------
const obtenerVentaPorId = async (req, res) => {
  const id = req.params.id; // El ID vendrá en la URL (ej: /api/ventas/15)

  try {
    // A. Buscar la cabecera de la venta
    const ventaResult = await db.query(
      'SELECT * FROM ventas WHERE venta_id = $1', [id]
    );

    if (ventaResult.rows.length === 0) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }

    const venta = ventaResult.rows[0];

    // B. Buscar los detalles (productos) de esa venta
    // Usamos los nombres exactos: detalle_venta_id, producto_id, cantidad, precio_unitario_venta
    const detallesResult = await db.query(
      'SELECT * FROM detalle_ventas WHERE venta_id = $1', [id]
    );

    // C. Unir todo en un solo objeto para enviarlo al frontend
    venta.detalles = detallesResult.rows;

    res.status(200).json(venta);

  } catch (error) {
    console.error('Error al obtener la venta:', error);
    res.status(500).json({ message: 'Error al obtener el detalle de la venta' });
  }
};

// ¡No olvides exportar las nuevas funciones!
module.exports = {
  crearVenta,
  obtenerVentas,
  obtenerVentaPorId
};