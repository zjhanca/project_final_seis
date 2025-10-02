const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const configuracionController = require('../controllers/configuracionController');
const Configuracion = require('../models/Configuracion');

// @route   GET api/configuracion
// @desc    Obtener la configuración del usuario
// @access  Private
router.get('/', auth, configuracionController.obtenerConfiguracion);

// @route   PUT api/configuracion
// @desc    Actualizar la configuración del usuario
// @access  Private
router.put('/', auth, configuracionController.actualizarConfiguracion);

// @route   GET api/configuracion/debug/all
// @desc    Obtener todas las configuraciones (solo para debug)
// @access  Private
router.get('/debug/all', auth, async (req, res) => {
  try {
    const configuraciones = await Configuracion.find().populate('user', 'username email');
    res.json({
      count: configuraciones.length,
      configuraciones: configuraciones
    });
  } catch (error) {
    console.error('Error en debug:', error);
    res.status(500).json({ 
      message: 'Error en debug', 
      error: error.message 
    });
  }
});

module.exports = router;