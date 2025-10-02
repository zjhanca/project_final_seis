const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// --- RUTAS CORREGIDAS ---
const authorRoutes = require('./controllers/authorController');
const userRoutes = require('./controllers/userController');
const libroRoutes = require('./controllers/libroController');
const prestamoRoutes = require('./controllers/prestamoController');
const authRoutes = require('./controllers/authController');
const devolucionesRoutes = require('./controllers/devolucionesController');
const configuracionRoutes = require('./controllers/configuracionController');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Middleware de diagnóstico
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// Activar el modo de depuración de Mongoose
mongoose.set('debug', true);

// --- USO DE RUTAS (SIN CAMBIOS) ---
app.use('/api/authors', authorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/libros', libroRoutes);
app.use('/api/prestamos', prestamoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/devoluciones', devolucionesRoutes);
app.use('/api/configuracion', configuracionRoutes);


// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

// Ruta de verificación de estado
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// **MANEJO 404 CORREGIDO - SIN EL PATRÓN '*' PROBLEMÁTICO**
app.use((req, res, next) => {
  res.status(404).json({ 
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method,
  });
});

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error('Error global:', error);
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
});

// Conexión a la base de datos y arranque del servidor
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI; // Usar la variable de entorno de Vercel

if (!MONGO_URI) {
  console.error('FATAL ERROR: MONGODB_URI no está definida.');
  process.exit(1);
}

mongoose.connect(MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    if (require.main === module) {
        app.listen(PORT, () => {
          console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    }
  })
  .catch(err => {
    console.error('❌ Error de conexión a MongoDB:', err.message);
    process.exit(1);
  });

// Exportar la app para Vercel (esto es crucial)
module.exports = app;