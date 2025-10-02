const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authorRoutes = require('./routes/authors');
const userRoutes = require('./routes/users');
const libroRoutes = require('./routes/libros');
const prestamoRoutes = require('./routes/prestamos');
const authRoutes = require('./routes/authRoutes');
const devolucionesRoutes = require('./routes/devoluciones');
const configuracionRoutes = require('./routes/configuracionRoutes');

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

// Rutas
app.use('/api/authors', authorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/libros', libroRoutes);
app.use('/api/prestamos', prestamoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/devoluciones', devolucionesRoutes);
app.use('/api/configuracion', require('./routes/configuracionRoutes'));


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
    availableRoutes: [
      'GET /api/authors',
      'GET /api/authors/:id', 
      'POST /api/authors',
      'PUT /api/authors/:id',
      'DELETE /api/authors/:id',
      'GET /api/users',
      'GET /api/users/:id',
      'POST /api/users',
      'PUT /api/users/:id', 
      'DELETE /api/users/:id',
      'GET /api/libros',
      'GET /api/libros/:id',
      'POST /api/libros',
      'PUT /api/libros/:id',
      'DELETE /api/libros/:id',
      'GET /api/prestamos',
      'GET /api/prestamos/:id',
      'POST /api/prestamos',
      'PUT /api/prestamos/:id',
      'DELETE /api/prestamos/:id',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth',
      'GET /api/test',
      'GET /api/health',
      'GET /api/configuracion',
      'PUT /api/configuracion',
      'GET /api/devoluciones',
      'GET /api/devoluciones/:id',
      'POST /api/devoluciones',
      'PATCH /api/devoluciones/:id/multa'
    ]
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
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/biblioteca';

mongoose.connect(MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    // Este bloque solo se ejecutará si el archivo es llamado directamente con 'node index.js'
    // Vercel no lo ejecutará, solo importará 'app'.
    if (require.main === module) {
        app.listen(PORT, () => {
          console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    }
  })
  .catch(err => {
    console.error('❌ Error de conexión a MongoDB:', err.message);
    console.log('💡 Asegúrate de que MongoDB esté ejecutándose');
    process.exit(1);
  });

// Exportar la app para Vercel (esto es crucial)
module.exports = app;