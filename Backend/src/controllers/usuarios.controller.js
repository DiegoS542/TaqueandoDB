const db = require('../config/db');
const bcrypt = require('bcryptjs'); 

// 1. Obtener todos los usuarios
const getUsuarios = async (req, res) => {
    try {
        // Hacemos un LEFT JOIN para traer el nombre de la sucursal si existe
        const query = `
            SELECT u.usuario_id, u.username, u.email, u.nombre, u.rol, u.sucursal_id, s.nombre as nombre_sucursal 
            FROM usuarios u
            LEFT JOIN sucursales s ON u.sucursal_id = s.sucursal_id
            ORDER BY u.usuario_id ASC
        `;
        const response = await db.query(query);
        res.status(200).json(response.rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// 2. Crear Usuario
const createUsuario = async (req, res) => {
    const { username, email, password, nombre, rol, sucursal_id } = req.body;

    // Validaciones básicas
    if (!username || !email || !password || !nombre || !rol) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Validación de lógica de negocio: Gerente necesita sucursal
    let finalSucursalId = null;
    if (rol === 'gerente') {
        if (!sucursal_id) {
            return res.status(400).json({ error: 'Un gerente debe tener asignada una sucursal' });
        }
        finalSucursalId = sucursal_id;
    }

    try {
        // Hashear contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = `
            INSERT INTO usuarios (username, email, password, nombre, rol, sucursal_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING usuario_id, username, email, nombre, rol, sucursal_id
        `;
        
        const response = await db.query(query, [username, email, hashedPassword, nombre, rol, finalSucursalId]);
        
        res.status(201).json({
            message: 'Usuario creado exitosamente',
            body: response.rows[0]
        });

    } catch (error) {
        console.error('Error al crear usuario:', error);
        // Código de error de Postgres para "Unique violation" (email o username duplicado)
        if (error.code === '23505') {
            return res.status(400).json({ error: 'El usuario o correo ya existe' });
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// 3. Actualizar Usuario
const updateUsuario = async (req, res) => {
    const id = parseInt(req.params.id);
    const { username, email, password, nombre, rol, sucursal_id } = req.body;

    try {
        // Lógica de sucursal
        let finalSucursalId = null;
        if (rol === 'gerente') {
             if (!sucursal_id) return res.status(400).json({ error: 'Un gerente debe tener asignada una sucursal' });
             finalSucursalId = sucursal_id;
        }

        let query = '';
        let params = [];

        // Si envían password, la actualizamos (hasheada)
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            query = `UPDATE usuarios SET username=$1, email=$2, password=$3, nombre=$4, rol=$5, sucursal_id=$6 WHERE usuario_id=$7 RETURNING *`;
            params = [username, email, hashedPassword, nombre, rol, finalSucursalId, id];
        } else {
            // Si NO envían password, mantenemos la que tiene
            query = `UPDATE usuarios SET username=$1, email=$2, nombre=$3, rol=$4, sucursal_id=$5 WHERE usuario_id=$6 RETURNING *`;
            params = [username, email, nombre, rol, finalSucursalId, id];
        }

        const response = await db.query(query, params);

        if (response.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.status(200).json({
            message: 'Usuario actualizado',
            body: response.rows[0]
        });

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'El usuario o correo ya existe' });
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// 4. Eliminar Usuario
const deleteUsuario = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const response = await db.query('DELETE FROM usuarios WHERE usuario_id = $1 RETURNING *', [id]);
        if (response.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.status(200).json({ message: `Usuario eliminado correctamente` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { getUsuarios, createUsuario, updateUsuario, deleteUsuario };