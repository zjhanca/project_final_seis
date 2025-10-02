const express = require('express');
const router = express.Router();
const libroController = require('../controllers/libroController');

// Rutas para libros
router.post('/', libroController.createLibro);
router.get('/', libroController.getLibros);
router.get('/:id', libroController.getLibroById);
router.put('/:id', libroController.updateLibro);
router.delete('/:id', libroController.deleteLibro);

module.exports = router;