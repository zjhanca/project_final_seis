const Prestamo = require('../models/Prestamo');

// Crear un nuevo préstamo
exports.createPrestamo = async (req, res) => {
    try {
        const newPrestamo = new Prestamo(req.body);
        await newPrestamo.save();
        res.status(201).json({ message: 'Préstamo creado exitosamente', prestamo: newPrestamo });
    } catch (error) {
        res.status(400).json({ message: 'Error al crear el préstamo', error: error.message });
    }
};

// Obtener todos los préstamos
exports.getPrestamos = async (req, res) => {
    try {
        const prestamos = await Prestamo.find().populate('libro').populate('usuario');
        res.status(200).json(prestamos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los préstamos', error: error.message });
    }
};

// Obtener un préstamo por ID
exports.getPrestamoById = async (req, res) => {
    try {
        const prestamo = await Prestamo.findById(req.params.id).populate('libro').populate('usuario');
        if (!prestamo) {
            return res.status(404).json({ message: 'Préstamo no encontrado' });
        }
        res.status(200).json(prestamo);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el préstamo', error: error.message });
    }
};

// Actualizar un préstamo por ID
exports.updatePrestamo = async (req, res) => {
    try {
        const updatedPrestamo = await Prestamo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPrestamo) {
            return res.status(404).json({ message: 'Préstamo no encontrado' });
        }
        res.status(200).json({ message: 'Préstamo actualizado exitosamente', prestamo: updatedPrestamo });
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar el préstamo', error: error.message });
    }
};

// Eliminar un préstamo por ID
exports.deletePrestamo = async (req, res) => {
    try {
        const deletedPrestamo = await Prestamo.findByIdAndDelete(req.params.id);
        if (!deletedPrestamo) {
            return res.status(404).json({ message: 'Préstamo no encontrado' });
        }
        res.status(200).json({ message: 'Préstamo eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el préstamo', error: error.message });
    }
};