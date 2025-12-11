const db = require('../config/db');

// Obtener todos
const getProveedores = async (req, res) => {
    try {
        const response = await db.query('SELECT * FROM proveedores ORDER BY nombre_empresa ASC');
        res.status(200).json(response.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener proveedores' });
    }
};

// Crear
const createProveedor = async (req, res) => {
    const { nombre_empresa, contacto } = req.body;
    if (!nombre_empresa) return res.status(400).json({ error: 'El nombre es obligatorio' });

    try {
        const query = 'INSERT INTO proveedores (nombre_empresa, contacto) VALUES ($1, $2) RETURNING *';
        const response = await db.query(query, [nombre_empresa, contacto]);
        res.status(201).json({ message: 'Proveedor creado', body: response.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear proveedor' });
    }
};

// Actualizar
const updateProveedor = async (req, res) => {
    const id = parseInt(req.params.id);
    const { nombre_empresa, contacto } = req.body;

    try {
        const query = 'UPDATE proveedores SET nombre_empresa = $1, contacto = $2 WHERE proveedor_id = $3 RETURNING *';
        const response = await db.query(query, [nombre_empresa, contacto, id]);
        
        if (response.rows.length === 0) return res.status(404).json({ error: 'Proveedor no encontrado' });
        
        res.status(200).json({ message: 'Proveedor actualizado', body: response.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno' });
    }
};

// Eliminar
const deleteProveedor = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        // OJO: Esto fallará si el proveedor ya tiene insumos asignados (por la FK). 
        // Es el comportamiento correcto para mantener integridad.
        const response = await db.query('DELETE FROM proveedores WHERE proveedor_id = $1 RETURNING *', [id]);
        
        if (response.rows.length === 0) return res.status(404).json({ error: 'Proveedor no encontrado' });
        
        res.status(200).json({ message: 'Proveedor eliminado' });
    } catch (error) {
        console.error(error);
        if (error.code === '23503') {
            return res.status(400).json({ error: 'No se puede eliminar: Este proveedor surte insumos activos.' });
        }
        res.status(500).json({ error: 'Error interno' });
    }
};

module.exports = { getProveedores, createProveedor, updateProveedor, deleteProveedor };