const AuthUser = require('../models/AuthUser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registrar un nuevo usuario
exports.register = async (req, res) => {
    console.log('--- Inicia el proceso de registro ---');
    const { username, email, password } = req.body;
    console.log('Datos recibidos:', { username, email, password: '***' });

    try {
        console.log('Paso 1: Verificando si el email ya existe...');
        let user = await AuthUser.findOne({ email });
        if (user) {
            console.log('Error: El correo electrónico ya está registrado.');
            return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
        }
        console.log('Email no encontrado, continuando...');

        console.log('Paso 2: Verificando si el nombre de usuario ya está en uso...');
        user = await AuthUser.findOne({ username });
        if (user) {
            console.log('Error: El nombre de usuario ya está en uso.');
            return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
        }
        console.log('Nombre de usuario no encontrado, continuando...');

        console.log('Paso 3: Creando una nueva instancia de usuario...');
        user = new AuthUser({
            username,
            email,
            password,
        });
        console.log('Instancia creada.');

        console.log('Paso 4: Hasheando la contraseña...');
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        console.log('Contraseña hasheada.');

        console.log('Paso 5: Intentando guardar el usuario en la base de datos...');
        await user.save();
        console.log('¡Éxito! Usuario guardado en la base de datos.');

        console.log('Paso 5.1: Verificando si el usuario se guardó correctamente...');
        try {
            const savedUser = await AuthUser.findById(user.id);
            if (savedUser) {
                console.log('¡Verificación exitosa! Usuario encontrado en la base de datos:', savedUser);
            } else {
                console.error('¡Error de verificación! No se pudo encontrar al usuario guardado en la base de datos.');
            }
        } catch (verificationError) {
            console.error('Error durante la verificación:', verificationError);
        }

        console.log('Paso 6: Creando el token JWT...');
        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1h' },
            (err, token) => {
                if (err) {
                    console.error('Error al firmar el token JWT:', err);
                    throw err;
                }
                console.log('Token JWT creado y enviado.');
                res.status(201).json({ token });
            }
        );
    } catch (error) {
        console.error('--- ERROR CATASTRÓFICO EN EL BLOQUE TRY-CATCH ---');
        console.error('Objeto de error completo:', error);
        res.status(500).send('Error en el servidor. Revisa la consola del backend para más detalles.');
    }
};

// Iniciar sesión
exports.login = async (req, res) => {
    console.log('--- Inicia el proceso de login ---');
    const { email, password } = req.body;
    console.log('Datos recibidos:', { email, password: '***' });

    try {
        console.log('Paso 1: Buscando usuario por email...');
        const user = await AuthUser.findOne({ email });
        if (!user) {
            console.log('Error: Usuario no encontrado con ese email.');
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }
        console.log('Usuario encontrado:', user.username);

        console.log('Paso 2: Comparando contraseñas...');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Error: La contraseña no coincide.');
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }
        console.log('¡Contraseña correcta!');

        console.log('Paso 3: Creando el token JWT...');
        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error en el servidor');
    }
};

// Obtener el usuario autenticado
exports.getLoggedInUser = async (req, res) => {
    try {
        const user = await AuthUser.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error en el servidor');
    }
};

// NUEVA FUNCIÓN: Actualizar perfil del usuario
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, phone, address, city, country, birthDate } = req.body;

        console.log('ACTUALIZAR PERFIL - User ID:', userId);
        console.log('ACTUALIZAR PERFIL - Datos recibidos:', req.body);

        // Buscar el usuario
        let user = await AuthUser.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'Usuario no encontrado' 
            });
        }

        // Actualizar solo los campos que vienen en el request
        if (name !== undefined) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;
        if (city !== undefined) user.city = city;
        if (country !== undefined) user.country = country;
        if (birthDate !== undefined) user.birthDate = birthDate;

        await user.save();

        console.log('PERFIL ACTUALIZADO:', user);

        // Devolver usuario sin contraseña
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            success: true,
            message: 'Perfil actualizado correctamente',
            user: userResponse
        });

    } catch (error) {
        console.error('ERROR en updateProfile:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al actualizar el perfil',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
        });
    }
};

// NUEVA FUNCIÓN: Cambiar contraseña
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        console.log('CAMBIAR CONTRASEÑA - User ID:', userId);

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                success: false,
                message: 'Se requiere la contraseña actual y la nueva contraseña' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false,
                message: 'La nueva contraseña debe tener al menos 6 caracteres' 
            });
        }

        const user = await AuthUser.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'Usuario no encontrado' 
            });
        }

        // Verificar contraseña actual
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false,
                message: 'La contraseña actual es incorrecta' 
            });
        }

        // Hashear nueva contraseña
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        console.log('CONTRASEÑA CAMBIADA exitosamente');

        res.json({
            success: true,
            message: 'Contraseña cambiada correctamente'
        });

    } catch (error) {
        console.error('ERROR en changePassword:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al cambiar la contraseña',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
        });
    }
};