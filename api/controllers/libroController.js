const Libro = require('../models/Libro');

// Crear un nuevo libro
exports.createLibro = async (req, res) => {
    try {
        const newLibro = new Libro(req.body);
        await newLibro.save();
        res.status(201).json({ message: 'Libro creado exitosamente', libro: newLibro });
    } catch (error) {
        res.status(400).json({ message: 'Error al crear el libro', error: error.message });
    }
};

// Obtener todos los libros
exports.getLibros = async (req, res) => {
    try {
        const libros = await Libro.find().populate('autor');
        res.status(200).json(libros);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los libros', error: error.message });
    }
};

// Obtener un libro por ID
exports.getLibroById = async (req, res) => {
    try {
        const libro = await Libro.findById(req.params.id).populate('autor');
        if (!libro) {
            return res.status(404).json({ message: 'Libro no encontrado' });
        }
        res.status(200).json(libro);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el libro', error: error.message });
    }
};

// Actualizar un libro por ID
exports.updateLibro = async (req, res) => {
    try {
        const updatedLibro = await Libro.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedLibro) {
            return res.status(404).json({ message: 'Libro no encontrado' });
        }
        res.status(200).json({ message: 'Libro actualizado exitosamente', libro: updatedLibro });
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar el libro', error: error.message });
    }
};

// Eliminar un libro por ID
exports.deleteLibro = async (req, res) => {
    try {
        const deletedLibro = await Libro.findByIdAndDelete(req.params.id);
        if (!deletedLibro) {
            return res.status(404).json({ message: 'Libro no encontrado' });
        }
        res.status(200).json({ message: 'Libro eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el libro', error: error.message });
    }
};