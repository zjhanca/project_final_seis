import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Shield, Bell, Save, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';

const Configuracion = () => {
  const { user, updateUser, loading: authLoading, success, error } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Estado para datos personales
  const [personalData, setPersonalData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    pais: 'Colombia',
    fechaNacimiento: ''
  });

  // Estado para configuración de seguridad
  const [securityData, setSecurityData] = useState({
    passwordActual: '',
    passwordNueva: '',
    confirmarPassword: '',
    autenticacionDosFactor: true
  });

  // Estado para la configuración de la aplicación
  const [configuracionData, setConfiguracionData] = useState({
    notificaciones: true,
    tema: 'claro',
    idioma: 'es'
  });

  // Cargar configuración desde el backend
  useEffect(() => {
    const cargarConfiguracion = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        console.log('🔄 Cargando configuración desde backend...');
        const response = await axios.get('/api/configuracion', {
          headers: { 'x-auth-token': token }
        });

        console.log('✅ Configuración recibida:', response.data);

        if (response.data && response.data.configuracion) {
          const config = response.data.configuracion;
          setConfiguracionData({
            notificaciones: config.notificaciones ?? true,
            tema: config.tema || 'claro',
            idioma: config.idioma || 'es'
          });
        }
      } catch (error) {
        console.error('❌ Error al cargar configuración:', error);
      }
    };

    cargarConfiguracion();
  }, []);

  // Cargar datos del usuario cuando el componente se monta
  useEffect(() => {
    if (user) {
      const nameParts = user.name ? user.name.split(' ') : ['', ''];
      setPersonalData({
        nombre: nameParts[0] || '',
        apellido: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        telefono: user.phone || '',
        direccion: user.address || '',
        ciudad: user.city || '',
        pais: user.country || 'Colombia',
        fechaNacimiento: user.birthDate ? user.birthDate.split('T')[0] : ''
      });
    }
  }, [user]);

  const handlePersonalChange = (field, value) => {
    setPersonalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSecurityChange = (field, value) => {
    setSecurityData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfigChange = (field, value) => {
    setConfiguracionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError('');
      setSaved(false);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setSaveError('No se encontró token de autenticación');
        setIsSaving(false);
        return;
      }

      // Guardar según la pestaña activa
      if (activeTab === 'personal') {
        const updatedUserData = {
          name: `${personalData.nombre} ${personalData.apellido}`.trim(),
          phone: personalData.telefono,
          address: personalData.direccion,
          city: personalData.ciudad,
          country: personalData.pais,
          birthDate: personalData.fechaNacimiento
        };

        console.log('📤 DATOS PERSONALES A ENVIAR:', updatedUserData);

        const response = await axios.put('/api/auth/profile', updatedUserData, {
          headers: { 'x-auth-token': token }
        });

        console.log('✅ Respuesta actualización perfil:', response.data);
        
        // Recargar el usuario para actualizar el contexto
        const userResponse = await axios.get('/api/auth', {
          headers: { 'x-auth-token': token }
        });
        
        if (updateUser && typeof updateUser === 'function') {
          await updateUser(userResponse.data);
        }

        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }

      if (activeTab === 'notificaciones') {
        const dataToSend = {
          notificaciones: configuracionData.notificaciones,
          tema: configuracionData.tema,
          idioma: configuracionData.idioma
        };
        
        console.log('📤 CONFIGURACIÓN A ENVIAR:', dataToSend);

        const response = await axios.put('/api/configuracion', dataToSend, {
          headers: { 'x-auth-token': token }
        });

        console.log('✅ Respuesta del servidor:', response.data);
        
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }

      if (activeTab === 'seguridad') {
        if (securityData.passwordNueva && securityData.passwordNueva !== securityData.confirmarPassword) {
          setSaveError('Las contraseñas no coinciden');
          setIsSaving(false);
          return;
        }

        if (securityData.passwordNueva) {
          if (securityData.passwordNueva.length < 6) {
            setSaveError('La nueva contraseña debe tener al menos 6 caracteres');
            setIsSaving(false);
            return;
          }

          const response = await axios.put('/api/auth/change-password', {
            currentPassword: securityData.passwordActual,
            newPassword: securityData.passwordNueva
          }, {
            headers: { 'x-auth-token': token }
          });

          console.log('✅ Respuesta cambio de contraseña:', response.data);
          
          // Limpiar campos de contraseña
          setSecurityData({
            passwordActual: '',
            passwordNueva: '',
            confirmarPassword: '',
            autenticacionDosFactor: securityData.autenticacionDosFactor
          });

          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        } else {
          setSaveError('Debes ingresar una nueva contraseña');
          setIsSaving(false);
          return;
        }
      }

    } catch (error) {
      console.error('❌ ERROR AL GUARDAR:', error.response || error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.msg || 
                          error.response?.data?.error ||
                          'Error al guardar los cambios';
      setSaveError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Datos Personales', icon: User },
    { id: 'seguridad', label: 'Seguridad', icon: Shield },
    { id: 'notificaciones', label: 'Preferencias', icon: Bell }
  ];

  if (!user && !authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">Debes iniciar sesión para acceder a la configuración</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  const renderPersonalTab = () => (
    <div className="config-form">
      <div className="form-grid">
        <div className="config-form-group">
          <label>Nombre</label>
          <input
            type="text"
            value={personalData.nombre}
            onChange={(e) => handlePersonalChange('nombre', e.target.value)}
            className="config-input"
          />
        </div>
        <div className="config-form-group">
          <label>Apellido</label>
          <input
            type="text"
            value={personalData.apellido}
            onChange={(e) => handlePersonalChange('apellido', e.target.value)}
            className="config-input"
          />
        </div>
      </div>

      <div className="form-grid">
        <div className="config-form-group">
          <label>
            <Mail className="inline-icon" />
            Email
          </label>
          <input
            type="email"
            value={personalData.email}
            className="config-input"
            disabled
            title="El email no se puede modificar"
          />
        </div>
        <div className="config-form-group">
          <label>
            <Phone className="inline-icon" />
            Teléfono
          </label>
          <input
            type="tel"
            value={personalData.telefono}
            onChange={(e) => handlePersonalChange('telefono', e.target.value)}
            className="config-input"
          />
        </div>
      </div>

      <div className="config-form-group">
        <label>
          <MapPin className="inline-icon" />
          Dirección
        </label>
        <input
          type="text"
          value={personalData.direccion}
          onChange={(e) => handlePersonalChange('direccion', e.target.value)}
          className="config-input"
        />
      </div>

      <div className="form-grid">
        <div className="config-form-group">
          <label>Ciudad</label>
          <input
            type="text"
            value={personalData.ciudad}
            onChange={(e) => handlePersonalChange('ciudad', e.target.value)}
            className="config-input"
          />
        </div>
        <div className="config-form-group">
          <label>País</label>
          <select
            value={personalData.pais}
            onChange={(e) => handlePersonalChange('pais', e.target.value)}
            className="config-input"
          >
            <option value="Colombia">Colombia</option>
          </select>
        </div>
        <div className="config-form-group">
          <label>Fecha de Nacimiento</label>
          <input
            type="date"
            value={personalData.fechaNacimiento}
            onChange={(e) => handlePersonalChange('fechaNacimiento', e.target.value)}
            className="config-input"
          />
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="config-form">
      <div className="config-form-group">
        <label>Contraseña Actual</label>
        <div className="password-container">
          <input
            type={showPassword ? "text" : "password"}
            value={securityData.passwordActual}
            onChange={(e) => handleSecurityChange('passwordActual', e.target.value)}
            className="config-input"
            placeholder="Ingresa tu contraseña actual"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="toggle-password"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="form-grid">
        <div className="config-form-group">
          <label>Nueva Contraseña</label>
          <input
            type="password"
            value={securityData.passwordNueva}
            onChange={(e) => handleSecurityChange('passwordNueva', e.target.value)}
            className="config-input"
            placeholder="Mínimo 6 caracteres"
          />
        </div>
        <div className="config-form-group">
          <label>Confirmar Contraseña</label>
          <input
            type="password"
            value={securityData.confirmarPassword}
            onChange={(e) => handleSecurityChange('confirmarPassword', e.target.value)}
            className="config-input"
            placeholder="Repite la nueva contraseña"
          />
        </div>
      </div>

      <div className="toggle-group">
        <div className="toggle-item">
          <div className="toggle-info">
            <h4>Autenticación de Dos Factores</h4>
            <p>Añade una capa extra de seguridad a tu cuenta (Próximamente)</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={securityData.autenticacionDosFactor}
              onChange={(e) => handleSecurityChange('autenticacionDosFactor', e.target.checked)}
              disabled
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="config-form">
      <div className="form-grid">
        <div className="config-form-group">
          <label>Tema de la Aplicación</label>
          <select
            value={configuracionData.tema}
            onChange={(e) => handleConfigChange('tema', e.target.value)}
            className="config-input"
          >
            <option value="claro">Claro</option>
            <option value="oscuro">Oscuro</option>
          </select>
        </div>
        <div className="config-form-group">
          <label>Idioma</label>
          <select
            value={configuracionData.idioma}
            onChange={(e) => handleConfigChange('idioma', e.target.value)}
            className="config-input"
          >
            <option value="es">Español</option>
            <option value="en">Inglés</option>
          </select>
        </div>
      </div>

      <hr className="my-6 border-gray-200" />

      <div className="toggle-group">
        <div className="toggle-item">
          <div className="toggle-info">
            <h4>Notificaciones por Email</h4>
            <p>Recibe actualizaciones importantes por correo</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={configuracionData.notificaciones}
              onChange={(e) => handleConfigChange('notificaciones', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="configuracion-page">
      <div className="configuracion-container">
        <div className="configuracion-header">
          <div className="configuracion-header-content">
            <div className="flex items-center mb-2">
              <button
                onClick={() => navigate(-1)}
                className="back-button"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1>Configuración</h1>
            </div>
            <p>Gestiona tu información personal y preferencias de la aplicación</p>
          </div>
          <div className="configuracion-user-info">
            <p>Sesión iniciada como</p>
            <p className="user-name">{user?.name || user?.username || 'Usuario'}</p>
          </div>
        </div>

        <div className="configuracion-layout">
          <div className="configuracion-tabs">
            <nav>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    <Icon className="tab-icon" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="configuracion-panel">
            <div className="panel-header">
              <h2>
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h2>
            </div>
            
            {activeTab === 'personal' && renderPersonalTab()}
            {activeTab === 'seguridad' && renderSecurityTab()}
            {activeTab === 'notificaciones' && renderNotificationsTab()}

            <div className="config-actions">
              {saved && (
                <span className="save-status success">
                  <span className="status-indicator success"></span>
                  Cambios guardados correctamente
                </span>
              )}
              {saveError && (
                <span className="save-status error">
                  <span className="status-indicator error"></span>
                  {saveError}
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving || authLoading}
                className="btn-save"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;