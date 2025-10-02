// src/utils/validators.js

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, message: 'El correo electrónico es requerido' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Por favor ingresa un correo electrónico válido' };
  }
  
  return { isValid: true };
};

export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: 'La contraseña es requerida' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'La contraseña debe tener al menos 6 caracteres' };
  }
  
  return { isValid: true };
};

export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Debes confirmar la contraseña' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Las contraseñas no coinciden' };
  }
  
  return { isValid: true };
};

export const validateResetCode = (code) => {
  if (!code) {
    return { isValid: false, error: 'El código es requerido' };
  }
  
  if (code.length !== 6) {
    return { isValid: false, error: 'El código debe tener 6 dígitos' };
  }
  
  if (!/^\d{6}$/.test(code)) {
    return { isValid: false, error: 'El código debe contener solo números' };
  }
  
  return { isValid: true };
};