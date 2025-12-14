const db = require('../config/db');

// Obtener Insumos
const getInsumos = async (req, res) => {
    try {
        const query = 'SELECT * FROM vw_insumos_detalle ORDER BY nombre ASC';
        
        const response = await db.query(query);
        res.status(200).json(response.rows);
        
    } catch (error) {
        console.error('Error al obtener insumos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Crear Insumo
const createInsumo = async (req, res) => {
    const { nombre, unidad_medida, proveedores } = req.body;

    if (!nombre || !unidad_medida) {
        return res.status(400).json({ error: 'Nombre y unidad son obligatorios' });
    }

    const client = await db.pool.connect(); // Cliente exclusivo para transacción

    try {
        await client.query('BEGIN'); // Inicia

        //Insertar Insumo
        const insertInsumoQuery = `INSERT INTO insumos (nombre, unidad_medida) VALUES ($1, $2) RETURNING insumo_id`;
        const insumoRes = await client.query(insertInsumoQuery, [nombre, unidad_medida]);
        const nuevoId = insumoRes.rows[0].insumo_id;

        //Insertar Proveedores (Si aplica)
        if (proveedores && proveedores.length > 0) {
            for (const prov of proveedores) {
                await client.query(
                    `INSERT INTO insumo_proveedor (insumo_id, proveedor_id, precio_compra) VALUES ($1, $2, $3)`,
                    [nuevoId, prov.proveedor_id, prov.precio_compra]
                );
            }
        }

        await client.query('COMMIT'); // Guarda todo
        res.status(201).json({ message: 'Insumo creado correctamente' });

    } catch (error) {
        await client.query('ROLLBACK'); // Deshace todo si falla
        console.error('Error transaction create:', error);
        res.status(500).json({ error: 'Error al crear insumo: ' + error.message });
    } finally {
        client.release(); // Libera la conexión
    }
};

// Actualizar Insumo
const updateInsumo = async (req, res) => {
    const id = parseInt(req.params.id);
    const { nombre, unidad_medida, proveedores } = req.body;

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // A. Actualizar datos básicos
        const updateQuery = `UPDATE insumos SET nombre = $1, unidad_medida = $2 WHERE insumo_id = $3 RETURNING *`;
        const result = await client.query(updateQuery, [nombre, unidad_medida, id]);

        if (result.rows.length === 0) {
            throw new Error('Insumo no encontrado');
        }

        // B. Actualizar Relaciones: Borramos todas las anteriores y ponemos las nuevas
        await client.query(`DELETE FROM insumo_proveedor WHERE insumo_id = $1`, [id]);

        if (proveedores && proveedores.length > 0) {
            for (const prov of proveedores) {
                await client.query(
                    `INSERT INTO insumo_proveedor (insumo_id, proveedor_id, precio_compra) VALUES ($1, $2, $3)`,
                    [id, prov.proveedor_id, prov.precio_compra]
                );
            }
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Insumo actualizado' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error transaction update:', error);
        
        if (error.message === 'Insumo no encontrado') {
            return res.status(404).json({ error: 'Insumo no encontrado' });
        }
        res.status(500).json({ error: 'Error al actualizar' });
    } finally {
        client.release();
    }
};

// Eliminar Insumo
const deleteInsumo = async (req, res) => {
    const id = parseInt(req.params.id);
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // Borrar relaciones primero
        await client.query(`DELETE FROM insumo_proveedor WHERE insumo_id = $1`, [id]);

        // Borrar insumo
        const result = await client.query(`DELETE FROM insumos WHERE insumo_id = $1 RETURNING *`, [id]);

        if (result.rows.length === 0) {
            throw new Error('Insumo no encontrado');
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Insumo eliminado' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        if (error.message === 'Insumo no encontrado') {
            return res.status(404).json({ error: 'Insumo no encontrado' });
        }
        if (error.code === '23503') {
            return res.status(400).json({ error: 'No se puede eliminar: Este insumo se usa en productos/recetas.' });
        }
        res.status(500).json({ error: 'Error al eliminar' });
    } finally {
        client.release();
    }
};

module.exports = { getInsumos, createInsumo, updateInsumo, deleteInsumo };