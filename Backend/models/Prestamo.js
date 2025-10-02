const mongoose = require('mongoose');

const prestamoSchema = new mongoose.Schema({
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
    fechaPrestamo: { 
        type: Date, 
        required: true,
        default: Date.now 
    },
    fechaDevolucion: { 
        type: Date, 
        required: true 
    },
    estado: { 
        type: String, 
        enum: ['pendiente', 'en_prestamo', 'devuelto', 'retrasado', 'cancelado'], 
        default: 'pendiente' 
    },
    observaciones: {
        type: String,
        default: ''
    },
    renovaciones: {
        type: Number,
        default: 0,
        max: 3
    },
    multa: {
        type: Number,
        default: 0,
        min: 0
    },
    terminosAceptados: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// Middleware para actualizar la disponibilidad del libro
prestamoSchema.pre('save', async function(next) {
    if (this.isModified('estado')) {
        const Libro = mongoose.model('Libro');
        const libro = await Libro.findById(this.libro);
        
        if (libro) {
            if (this.estado === 'en_prestamo') {
                libro.disponibilidad = 'prestado';
            } else if (this.estado === 'devuelto') {
                libro.disponibilidad = 'disponible';
            }
            await libro.save();
        }
    }
    next();
});

module.exports = mongoose.model('Prestamo', prestamoSchema);