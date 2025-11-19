const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Función para manejar el login
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // 1. Buscar usuario
        const query = 'SELECT * FROM usuarios WHERE username = $1';
        const result = await db.query(query, [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = result.rows[0];

        // 2. Comparar contraseña
        // const isMatch = await bcrypt.compare(password, user.password);
        const isMatch = (password === user.password); //TEXTO PLANO

        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // 3. Generar Token
        const payload = {
            usuario_id: user.usuario_id,
            username: user.username,
            nombre: user.nombre,
            rol: user.rol,
            sucursal_id: user.sucursal_id
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

        res.json({ token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

module.exports = { login };