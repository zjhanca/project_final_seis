// models/Devolucion.js
const mongoose = require('mongoose');

const devolucionSchema = new mongoose.Schema({
  prestamo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prestamo',
    required: true
  },
  libro: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Libro',
    required: true
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fechaDevolucion: {
    type: Date,
    default: Date.now,
    required: true
  },
  fechaPrestamoOriginal: {
    type: Date,
    required: true
  },
  fechaDevolucionEsperada: {
    type: Date,
    required: true
  },
  diasRetraso: {
    type: Number,
    default: 0
  },
  multaCalculada: {
    type: Number,
    default: 0
  },
  estadoLibro: {
    type: String,
    enum: ['bueno', 'danado_leve', 'danado_grave', 'perdido'],
    default: 'bueno'
  },
  observaciones: {
    type: String,
    default: ''
  },
  multaPagada: {
    type: Boolean,
    default: false
  },
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Devolucion', devolucionSchema);