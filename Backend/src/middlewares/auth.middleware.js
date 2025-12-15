const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res
      .status(401)
      .json({ msg: "Acceso denegado. No se proporcionó un token." });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res
      .status(401)
      .json({ msg: "Formato de token inválido. Debe ser Bearer <token>." });
  }

  const token = parts[1];

  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET no está definido en el entorno.");
      return res
        .status(500)
        .json({
          msg: "Error de configuración del servidor (clave secreta faltante).",
        });
    }

    const decoded = jwt.verify(token, secret);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ msg: "Token no válido o expirado." });
  }
};

module.exports = verifyToken;
