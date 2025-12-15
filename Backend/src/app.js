const express = require('express');
const cors = require('cors');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const sucursalesRoutes = require('./routes/sucursales.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const proveedoresRoutes = require('./routes/proveedores.routes');

// --- RUTAS NUEVAS AGREGADAS ---
const ventasRoutes = require('./routes/ventas.routes'); 
const productosRoutes = require('./routes/productos.routes'); 

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Usar rutas
app.use('/api/auth', authRoutes); // Todo lo de authRoutes empieza con /api/auth
app.use('/api/sucursales', sucursalesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/proveedores', proveedoresRoutes);

// --- REGISTRO DE NUEVAS RUTAS ---
app.use('/api/ventas', ventasRoutes);       // Habilita: POST /api/ventas, GET /api/ventas
app.use('/api/productos', productosRoutes); // Habilita: GET /api/productos/venta

module.exports = app;