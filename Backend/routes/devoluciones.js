// routes/devoluciones.js
const express = require('express');
const router = express.Router();
const devolucionController = require('../controllers/devolucionesController');
const auth = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(auth);

// Registrar devolución
router.post('/', devolucionController.registrarDevolucion);

// Obtener devoluciones
router.get('/', devolucionController.obtenerDevoluciones);

// Obtener devolución por ID
router.get('/:id', devolucionController.obtenerDevolucionPorId);

// Actualizar estado de multa
router.patch('/:id/multa', devolucionController.actualizarEstadoMulta);

module.exports = router;