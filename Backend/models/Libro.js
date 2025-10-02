const mongoose = require('mongoose');

const libroSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    autor: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
    isbn: { type: String, unique: true, required: true },
    editorial: { type: String, required: true },
    año_publicacion: { type: Number, required: true },
    genero: { type: String, required: true },
    paginas: { type: Number, required: true },
    idioma: { type: String, required: true },
    sinopsis: { type: String, required: true },
    portada: { type: String }, // URL de la imagen de portada
    disponibilidad: { 
        type: String, 
        enum: ['disponible', 'prestado', 'reservado', 'mantenimiento'], 
        default: 'disponible' 
    }
}, {
    timestamps: true // Agrega createdAt y updatedAt automáticamente
});

module.exports = mongoose.model('Libro', libroSchema);