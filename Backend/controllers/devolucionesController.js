// controllers/devolucionController.js
const Devolucion = require('../models/Devoluciones');
const Prestamo = require('../models/Prestamo');
const Libro = require('../models/Libro');

// Registrar una devolución
exports.registrarDevolucion = async (req, res) => {
  try {
    const { prestamoId, estadoLibro, observaciones, multaPagada } = req.body;

    // Buscar el préstamo
    const prestamo = await Prestamo.findById(prestamoId)
      .populate('libro')
      .populate('usuario');

    if (!prestamo) {
      return res.status(404).json({ message: 'Préstamo no encontrado' });
    }

    if (prestamo.estado === 'devuelto') {
      return res.status(400).json({ message: 'Este préstamo ya fue devuelto' });
    }

    // Calcular días de retraso
    const fechaActual = new Date();
    const fechaDevolucionEsperada = new Date(prestamo.fechaDevolucion);
    const diasRetraso = Math.max(0, Math.floor((fechaActual - fechaDevolucionEsperada) / (1000 * 60 * 60 * 24)));

    // Calcular multa (ejemplo: $100 por día de retraso)
    const multaCalculada = diasRetraso * 100;

    // Crear registro de devolución
    const devolucion = new Devolucion({
      prestamo: prestamoId,
      libro: prestamo.libro._id,
      usuario: prestamo.usuario._id,
      fechaPrestamoOriginal: prestamo.fechaPrestamo,
      fechaDevolucionEsperada: prestamo.fechaDevolucion,
      diasRetraso,
      multaCalculada,
      estadoLibro: estadoLibro || 'bueno',
      observaciones: observaciones || '',
      multaPagada: multaPagada || false,
      creadoPor: req.userId
    });

    await devolucion.save();

    // Actualizar el préstamo a estado "devuelto"
    prestamo.estado = 'devuelto';
    prestamo.multa = multaCalculada;
    await prestamo.save();

    // Actualizar la disponibilidad del libro
    await Libro.findByIdAndUpdate(prestamo.libro._id, {
      disponibilidad: 'disponible'
    });

    // Populate para devolver datos completos
    const devolucionCompleta = await Devolucion.findById(devolucion._id)
      .populate('prestamo')
      .populate('libro')
      .populate('usuario')
      .populate('creadoPor');

    res.status(201).json({
      message: 'Devolución registrada exitosamente',
      devolucion: devolucionCompleta
    });

  } catch (error) {
    console.error('Error al registrar devolución:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener todas las devoluciones
exports.obtenerDevoluciones = async (req, res) => {
  try {
    const { page = 1, limit = 10, usuario, libro, fechaInicio, fechaFin } = req.query;

    const query = {};
    
    if (usuario) {
      query['usuario'] = usuario;
    }
    
    if (libro) {
      query['libro'] = libro;
    }
    
    if (fechaInicio && fechaFin) {
      query.fechaDevolucion = {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin)
      };
    }

    const devoluciones = await Devolucion.find(query)
      .populate('prestamo')
      .populate('libro')
      .populate('usuario')
      .populate('creadoPor')
      .sort({ fechaDevolucion: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Devolucion.countDocuments(query);

    res.json({
      devoluciones,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error al obtener devoluciones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener una devolución por ID
exports.obtenerDevolucionPorId = async (req, res) => {
  try {
    const devolucion = await Devolucion.findById(req.params.id)
      .populate('prestamo')
      .populate('libro')
      .populate('usuario')
      .populate('creadoPor');

    if (!devolucion) {
      return res.status(404).json({ message: 'Devolución no encontrada' });
    }

    res.json(devolucion);
  } catch (error) {
    console.error('Error al obtener devolución:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar estado de multa
exports.actualizarEstadoMulta = async (req, res) => {
  try {
    const { multaPagada } = req.body;

    const devolucion = await Devolucion.findByIdAndUpdate(
      req.params.id,
      { multaPagada },
      { new: true }
    ).populate('prestamo')
     .populate('libro')
     .populate('usuario');

    if (!devolucion) {
      return res.status(404).json({ message: 'Devolución no encontrada' });
    }

    // Actualizar también la multa en el préstamo
    await Prestamo.findByIdAndUpdate(devolucion.prestamo._id, {
      multa: devolucion.multaCalculada
    });

    res.json({
      message: 'Estado de multa actualizado',
      devolucion
    });
  } catch (error) {
    console.error('Error al actualizar multa:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};