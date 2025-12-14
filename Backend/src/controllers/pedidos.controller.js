const db = require('../config/db');

// Crear Pedido (Transacción Completa + Llamada a Cursor)
const createPedido = async (req, res) => {
    // Recibimos la sucursal y el array de items del formulario
    const { sucursal_id, items } = req.body; 

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'El pedido no puede estar vacío' });
    }

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN'); // Inicia la transacción

        // El total se queda en 0 por ahora, el Cursor lo calculará después
        const headerQuery = `
            INSERT INTO pedidos (sucursal_id, fecha, total, estado) 
            VALUES ($1, CURRENT_DATE, 0, 'Pendiente') 
            RETURNING pedido_id
        `;
        const headerRes = await client.query(headerQuery, [sucursal_id]);
        const nuevoPedidoId = headerRes.rows[0].pedido_id;

        // Insertar el Detalle
        for (const item of items) {
            await client.query(`
                INSERT INTO detalle_pedidos (
                    pedido_id, 
                    proveedor_id, 
                    insumo_id, 
                    cantidad, 
                    precio_unitario_compra
                )
                VALUES ($1, $2, $3, $4, $5)
            `, [
                nuevoPedidoId, 
                item.proveedor_id, 
                item.insumo_id, 
                item.cantidad, 
                item.precio
            ]);
        }

        // LLAMADA AL CURSOR
        await client.query('CALL sp_calcular_total_pedido($1)', [nuevoPedidoId]);

        await client.query('COMMIT'); // Confirmamos todo
        res.status(201).json({ message: 'Pedido creado y calculado exitosamente', id: nuevoPedidoId });

    } catch (error) {
        await client.query('ROLLBACK'); // Si algo falla, deshacemos todo
        console.error('Error creando pedido:', error);
        res.status(500).json({ error: 'Error al procesar el pedido' });
    } finally {
        client.release();
    }
};

// Obtener Historial por Sucursal
const getPedidosBySucursal = async (req, res) => {
    const sucursalId = parseInt(req.params.sucursalId);
    try {
        // Consultamos la vista en lugar de la tabla plana
        const query = `
            SELECT * FROM vw_pedidos_resumen 
            WHERE sucursal_id = $1 
        `;
        const response = await db.query(query, [sucursalId]);
        res.status(200).json(response.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener historial' });
    }
};

module.exports = { createPedido, getPedidosBySucursal };