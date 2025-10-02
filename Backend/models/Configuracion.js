const mongoose = require('mongoose');

const configuracionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuthUser', // Cambiado de 'User' a 'AuthUser'
    required: true,
    unique: true
  },
  notificaciones: {
    type: Boolean,
    default: true
  },
  tema: {
    type: String,
    enum: ['claro', 'oscuro'],
    default: 'claro'
  },
  idioma: {
    type: String,
    default: 'es'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Configuracion', configuracionSchema);