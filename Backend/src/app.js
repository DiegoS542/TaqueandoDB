const express = require("express");
const cors = require("cors");

// Importar rutas
const authRoutes = require("./routes/auth.routes");
const sucursalesRoutes = require("./routes/sucursales.routes");
const usuariosRoutes = require("./routes/usuarios.routes");
const proveedoresRoutes = require("./routes/proveedores.routes");
const inventarioRoutes = require("./routes/inventario.routes");
const insumosRoutes = require("./routes/insumos.routes");
// const ventasRoutes = require('./routes/ventas.routes'); // Futuro...

const app = express();

app.use(
  cors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options(/.*/, cors());

// Middlewares globales
app.use(express.json());

// Usar rutas
app.use("/api/auth", authRoutes); // Todo lo de authRoutes empieza con /api/auth
app.use("/api/sucursales", sucursalesRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/proveedores", proveedoresRoutes);
app.use("/api/inventario", inventarioRoutes);
app.use("/api/insumos", insumosRoutes);
// app.use('/api/ventas', ventasRoutes);

module.exports = app;
