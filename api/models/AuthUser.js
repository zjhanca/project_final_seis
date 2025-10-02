const mongoose = require('mongoose');

const authUserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor, introduce un email válido']
    },
    password: {
        type: String,
        required: true
    },
    rol: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    // Campos adicionales para el perfil
    name: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        default: 'Colombia'
    },
    birthDate: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AuthUser', authUserSchema);