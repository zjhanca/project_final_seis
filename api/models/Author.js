const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    nacionalidad: { type: String, required: true },
    generos: [{ type: String, required: true }],
    biografia: { type: String, required: true, minlength: 50 },
    fotografia: { type: String, required: true },
    obras: [{ type: String }],
    premios: { type: String },
    idioma: { type: String, required: true },
    redes: { type: String }
});

module.exports = mongoose.model('Author', authorSchema);