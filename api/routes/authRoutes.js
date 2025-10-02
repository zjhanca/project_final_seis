const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    getLoggedInUser, 
    updateProfile, 
    changePassword 
} = require('../controllers/authController');
const auth = require('../middleware/auth');

// @route   GET api/auth
// @desc    Get logged in user
// @access  Private
router.get('/', auth, getLoggedInUser);

// @route   POST api/auth/register
// @desc    Registrar un nuevo usuario
// @access  Public
router.post('/register', register);

// @route   POST api/auth/login
// @desc    Iniciar sesión
// @access  Public
router.post('/login', login);

// @route   PUT api/auth/profile
// @desc    Actualizar perfil del usuario
// @access  Private
router.put('/profile', auth, updateProfile);

// @route   PUT api/auth/change-password
// @desc    Cambiar contraseña del usuario
// @access  Private
router.put('/change-password', auth, changePassword);

module.exports = router;