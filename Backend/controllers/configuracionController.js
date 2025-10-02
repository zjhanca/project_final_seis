const Configuracion = require('../models/Configuracion');
const AuthUser = require('../models/AuthUser');

// Obtener la configuración de un usuario
exports.obtenerConfiguracion = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('OBTENER CONFIG - User ID:', userId);

    // Verificar que el usuario existe
    const usuarioExiste = await AuthUser.findById(userId);
    if (!usuarioExiste) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuario no encontrado' 
      });
    }

    // Busca la configuración. Si no existe, la crea con valores por defecto.
    const configuracion = await Configuracion.findOneAndUpdate(
      { user: userId },
      { 
        $setOnInsert: { 
          user: userId, 
          notificaciones: true, 
          tema: 'claro', 
          idioma: 'es' 
        } 
      },
      { 
        new: true, 
        upsert: true, 
        setDefaultsOnInsert: true 
      }
    ).populate('user', 'username email');

    console.log('OBTENER CONFIG - Configuración encontrada o creada:', configuracion);
    
    res.json({
      success: true,
      configuracion: configuracion
    });

  } catch (error) {
    console.error('ERROR en obtenerConfiguracion:', error);
    res.status(500).json({ 
      success: false,
      message: 'Hubo un error en el servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

// Actualizar la configuración de un usuario
exports.actualizarConfiguracion = async (req, res) => {
  try {
    const userId = req.user.id;
    const datosParaActualizar = req.body;

    console.log('ACTUALIZAR CONFIG - User ID:', userId);
    console.log('ACTUALIZAR CONFIG - Body recibido:', datosParaActualizar);

    // Validar campos permitidos
    const camposPermitidos = ['notificaciones', 'tema', 'idioma'];
    const datosFiltrados = {};
    
    camposPermitidos.forEach(campo => {
      if (datosParaActualizar[campo] !== undefined) {
        datosFiltrados[campo] = datosParaActualizar[campo];
      }
    });

    console.log('ACTUALIZAR CONFIG - Datos filtrados:', datosFiltrados);

    // Verificar que el usuario existe
    const usuarioExiste = await AuthUser.findById(userId);
    if (!usuarioExiste) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuario no encontrado' 
      });
    }

    // Busca y actualiza la configuración
    const configuracionActualizada = await Configuracion.findOneAndUpdate(
      { user: userId },
      { $set: datosFiltrados },
      { 
        new: true, 
        upsert: true, 
        setDefaultsOnInsert: true,
        runValidators: true 
      }
    ).populate('user', 'username email');

    console.log('ACTUALIZAR CONFIG - Configuración guardada:', configuracionActualizada);
    
    res.json({
      success: true,
      message: 'Configuración actualizada correctamente',
      configuracion: configuracionActualizada
    });
    
  } catch (error) {
    console.error('ERROR en actualizarConfiguracion:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: 'Datos de configuración inválidos',
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Hubo un error en el servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};