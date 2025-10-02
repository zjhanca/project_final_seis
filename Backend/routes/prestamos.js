const express = require('express');
const router = express.Router();
const prestamoController = require('../controllers/prestamoController');

// Rutas para préstamos
router.post('/', prestamoController.createPrestamo);
router.get('/', prestamoController.getPrestamos);
router.get('/:id', prestamoController.getPrestamoById);
router.put('/:id', prestamoController.updatePrestamo);
router.delete('/:id', prestamoController.deletePrestamo);

module.exports = router;