const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    tipoIdentificacion: {
        type: String,
        required: true,
        enum: ['cedula', 'pasaporte', 'tarjeta_identidad']
    },
    identificacion: {
        type: String,
        required: true,
        unique: true
    },
    nombre: {
        type: String,
        required: true
    },
    apellido: {
        type: String,
        required: true
    },
    telefono: {
        type: String,
        required: true
    },
    direccion: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    rol: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
}, {
    timestamps: true // Agrega createdAt y updatedAt automáticamente
});

module.exports = mongoose.model('User', userSchema);