// db.js
const { Pool } = require('pg');
require('dotenv').config();

// --- INICIO DE LA PRUEBA DE DIAGNÓSTICO ---
console.log('--- Verificando variables de entorno ---');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_DATABASE:', process.env.DB_DATABASE);
// Por seguridad, solo imprimimos si la contraseña "existe" o no
console.log('DB_PASSWORD (existe?):', !!process.env.DB_PASSWORD); 
console.log(process.env.DB_PASSWORD);
console.log('-----------------------------------------');
// --- FIN DE LA PRUEBA ---

// Lee las variables separadas del .env
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: false
  },
  family: 4
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool: pool
};