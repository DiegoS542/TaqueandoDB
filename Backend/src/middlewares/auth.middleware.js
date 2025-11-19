const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar el JWT en las peticiones protegidas.
 * Se espera que el token venga en el header 'Authorization' con el formato:
 * Bearer <token>
 */
const verifyToken = (req, res, next) => {
    // 1. Obtener el header de autorización
    const authHeader = req.headers['authorization'];

    // 2. Verificar si el header existe
    if (!authHeader) {
        return res.status(403).json({ error: 'Acceso denegado: No se proporcionó un token.' });
    }

    // 3. Extraer el token quitando la palabra "Bearer "
    // El formato estándar es "Bearer eyJhbGci..."
    // split(' ') separa en ['Bearer', 'token'] y tomamos el índice [1]
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'Acceso denegado: Formato de token incorrecto.' });
    }

    try {
        // 4. Verificar el token usando la clave secreta
        const secret = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secret);

        // 5. ¡Token Válido! Inyectamos los datos del usuario en la request (req)
        // Ahora, cualquier controlador que se ejecute después de esto
        // podrá acceder a req.user.usuario_id, req.user.rol, etc.
        req.user = decoded;

        // 6. Continuar con la siguiente función (el controlador o el siguiente middleware)
        next();

    } catch (error) {
        // Si el token expiró o la firma no coincide, jwt.verify lanza un error
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};

module.exports = verifyToken;