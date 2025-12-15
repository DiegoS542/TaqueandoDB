const db = require('../config/db');

// Crear Pedido (Transacción Completa + Llamada a Cursor)
const createPedido = async (req, res) => {
    const { sucursal_id, items } = req.body; 

    // Validación básica
    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'El pedido no puede estar vacío' });
    }

    try {
        // CONVERTIMOS EL ARRAY DE JS A UN STRING JSON
        const jsonItems = JSON.stringify(items);

        await db.query('CALL sp_crear_pedido_completo($1, $2)', [sucursal_id, jsonItems]);
        
        res.status(201).json({ message: 'Pedido procesado exitosamente por la Base de Datos' });

    } catch (error) {
        console.error('Error al crear pedido:', error);
        res.status(500).json({ error: 'Error interno al procesar el pedido' });
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

// Obtener Detalle de un Pedido
const getDetallePedido = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        // Consultamos la vista filtrando por el ID del pedido
        const query = `
            SELECT * FROM vw_pedido_detalle_completo 
            WHERE pedido_id = $1 
            ORDER BY insumo_nombre ASC
        `;
        
        const response = await db.query(query, [id]);
        res.status(200).json(response.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener detalles del pedido' });
    }
};

//Eliminar Pedido
const deletePedido = async (req, res) => {
    const id = parseInt(req.params.id);
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN'); // Iniciamos operación segura

        //Borrar los detalles de este pedido
        await client.query('DELETE FROM detalle_pedidos WHERE pedido_id = $1', [id]);

        //Ahora sí, borrar el pedido
        const result = await client.query('DELETE FROM pedidos WHERE pedido_id = $1', [id]);

        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        await client.query('COMMIT'); // Guardamos cambios
        res.status(200).json({ message: 'Pedido eliminado correctamente' });

    } catch (error) {
        await client.query('ROLLBACK'); // Si falla, deshacemos todo
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el pedido' });
    } finally {
        client.release();
    }
};

const updatePedido = async (req, res) => {
    const id = parseInt(req.params.id);
    const { items } = req.body; 

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'El pedido no puede quedar vacío' });
    }

    try {
        const itemsJson = JSON.stringify(items);

        await db.query('CALL sp_editar_pedido($1, $2)', [id, itemsJson]);

        res.status(200).json({ message: 'Pedido actualizado correctamente via SP' });

    } catch (error) {
        console.error('Error al actualizar pedido:', error);
        res.status(500).json({ error: 'Error interno al actualizar el pedido' });
    }
};

// Obtener KPIs del Dashboard
const getDashboardStats = async (req, res) => {
    try {
        // Consultamos la vista que acabamos de crear
        const response = await db.query('SELECT * FROM vw_dashboard_kpis');
        
        // La vista siempre devuelve 1 sola fila
        res.status(200).json(response.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
};

module.exports = { createPedido, getPedidosBySucursal, getDetallePedido, deletePedido, updatePedido, getDashboardStats };