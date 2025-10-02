const Author = require('../models/Author');

// Crear un nuevo autor
exports.createAuthor = async (req, res) => {
    try {
        const newAuthor = new Author(req.body);
        await newAuthor.save();
        res.status(201).json({ message: 'Autor creado exitosamente', author: newAuthor });
    } catch (error) {
        res.status(400).json({ message: 'Error al crear el autor', error: error.message });
    }
};

// Obtener todos los autores
exports.getAuthors = async (req, res) => {
    try {
        const authors = await Author.find();
        res.status(200).json(authors);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los autores', error: error.message });
    }
};

// Obtener un autor por ID
exports.getAuthorById = async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        if (!author) {
            return res.status(404).json({ message: 'Autor no encontrado' });
        }
        res.status(200).json(author);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el autor', error: error.message });
    }
};

// Actualizar un autor por ID
exports.updateAuthor = async (req, res) => {
    try {
        const updatedAuthor = await Author.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedAuthor) {
            return res.status(404).json({ message: 'Autor no encontrado' });
        }
        res.status(200).json({ message: 'Autor actualizado exitosamente', author: updatedAuthor });
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar el autor', error: error.message });
    }
};

// Eliminar un autor por ID
exports.deleteAuthor = async (req, res) => {
    try {
        const deletedAuthor = await Author.findByIdAndDelete(req.params.id);
        if (!deletedAuthor) {
            return res.status(404).json({ message: 'Autor no encontrado' });
        }
        res.status(200).json({ message: 'Autor eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el autor', error: error.message });
    }
};