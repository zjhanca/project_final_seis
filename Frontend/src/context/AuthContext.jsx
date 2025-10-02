// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { sendPasswordResetEmail, verifyResetCode, markResetCodeAsUsed } from '../services/emailService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const setAuthToken = token => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
    localStorage.setItem('token', token);
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
    localStorage.removeItem('token');
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          if (decodedToken.exp * 1000 < Date.now()) {
            setAuthToken(null);
            setUser(null);
            setIsAuthenticated(false);
          } else {
            setAuthToken(token);
            const res = await axios.get('http://localhost:5000/api/auth');
            setUser(res.data);
            setIsAuthenticated(true);
          }
        } catch (error) {
          setAuthToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const register = async (formData) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      const { token } = res.data;
      setAuthToken(token);
      const userRes = await axios.get('http://localhost:5000/api/auth');
      setUser(userRes.data);
      setIsAuthenticated(true);
      setError('');
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error en el registro';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const login = async (formData) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      const { token } = res.data;
      setAuthToken(token);
      const userRes = await axios.get('http://localhost:5000/api/auth');
      setUser(userRes.data);
      setIsAuthenticated(true);
      setError('');
      return { success: true };
    } catch (err) {
      setAuthToken(null);
      setUser(null);
      setIsAuthenticated(false);
      const errorMessage = err.response?.data?.message || 'Error al iniciar sesión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // ✅ FUNCIÓN CORREGIDA - Sin setLoading problemático
  const updateUser = async (updatedData) => {
    try {
      console.log('🔄 Actualizando usuario en contexto:', updatedData);
      
      // Si viene un mensaje de éxito, solo mostrarlo
      if (updatedData.successMessage) {
        setSuccess(updatedData.successMessage);
        setTimeout(() => setSuccess(''), 3000);
        return user;
      }
      
      // Actualizar el estado del usuario
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      
      console.log('✅ Usuario actualizado en contexto:', updatedUser);
      
      // Mostrar mensaje de éxito
      setSuccess('Información actualizada correctamente');
      setTimeout(() => setSuccess(''), 3000);
      
      return updatedUser;
      
    } catch (err) {
      console.error('❌ Error en updateUser:', err);
      setError('Error al actualizar la información del usuario');
      throw err;
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const requestPasswordReset = async (email) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const result = await sendPasswordResetEmail(email);
      if (result.success) {
        setSuccess(result.message);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message || 'Error al enviar el código de recuperación');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email, code, newPassword) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const isValidCode = verifyResetCode(email, code);
      if (!isValidCode) {
        throw new Error('Código incorrecto o expirado');
      }
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.email === email);
      if (userIndex === -1) {
        throw new Error('Usuario no encontrado');
      }
      users[userIndex].password = newPassword;
      localStorage.setItem('users', JSON.stringify(users));
      markResetCodeAsUsed(email);
      setSuccess('Contraseña restablecida exitosamente. Redirigiendo al login...');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    success,
    register,
    login,
    logout,
    updateUser,
    clearMessages,
    requestPasswordReset,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};