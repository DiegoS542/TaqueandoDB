const db = require('../config/db');

// 1. Obtener todas las sucursales
const getSucursales = async (req, res) => {
    try {
        const response = await db.query('SELECT * FROM sucursales ORDER BY sucursal_id ASC');
        res.status(200).json(response.rows);
    } catch (error) {
        console.error('Error al obtener sucursales:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// 2. Obtener una sucursal por ID
const getSucursalById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const response = await db.query('SELECT * FROM sucursales WHERE sucursal_id = $1', [id]);
        if (response.rows.length === 0) {
            return res.status(404).json({ error: 'Sucursal no encontrada' });
        }
        res.status(200).json(response.rows[0]);
    } catch (error) {
        console.error('Error al obtener sucursal:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// 3. Crear una nueva sucursal
const createSucursal = async (req, res) => {
    const { nombre } = req.body;
    
    // Validación básica
    if (!nombre) {
        return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    try {
        const response = await db.query(
            'INSERT INTO sucursales (nombre) VALUES ($1) RETURNING *', 
            [nombre]
        );
        res.status(201).json({
            message: 'Sucursal creada exitosamente',
            body: response.rows[0]
        });
    } catch (error) {
        console.error('Error al crear sucursal:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// 4. Actualizar una sucursal
const updateSucursal = async (req, res) => {
    const id = parseInt(req.params.id);
    const { nombre } = req.body;

    try {
        const response = await db.query(
            'UPDATE sucursales SET nombre = $1 WHERE sucursal_id = $2 RETURNING *',
            [nombre, id]
        );

        if (response.rows.length === 0) {
            return res.status(404).json({ error: 'Sucursal no encontrada' });
        }

        res.status(200).json({
            message: 'Sucursal actualizada',
            body: response.rows[0]
        });
    } catch (error) {
        console.error('Error al actualizar sucursal:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// 5. Eliminar una sucursal
const deleteSucursal = async (req, res) => {
    const id = parseInt(req.params.id);
    
    try {
        // Nota: Esto fallará si la sucursal tiene datos vinculados (ventas, usuarios, etc.)
        // por la integridad referencial (Foreign Keys). Eso es bueno.
        const response = await db.query('DELETE FROM sucursales WHERE sucursal_id = $1 RETURNING *', [id]);

        if (response.rowCount === 0) {
            return res.status(404).json({ error: 'Sucursal no encontrada' });
        }

        res.status(200).json({ message: `Sucursal ${id} eliminada correctamente` });
    } catch (error) {
        console.error('Error al eliminar sucursal:', error);
        // Manejo específico para error de llave foránea (código 23503 en Postgres)
        if (error.code === '23503') {
            return res.status(400).json({ error: 'No se puede eliminar: Esta sucursal tiene datos asociados.' });
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    getSucursales,
    getSucursalById,
    createSucursal,
    updateSucursal,
    deleteSucursal
};