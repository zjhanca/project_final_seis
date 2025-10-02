// src/services/emailService.js
import emailjs from '@emailjs/browser';

// Configuración de EmailJS
const EMAILJS_CONFIG = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
  fromName: import.meta.env.VITE_FROM_NAME || "Sistema de Recuperación",
  fromEmail: import.meta.env.VITE_FROM_EMAIL || "noreply@tuapp.com"
};

// Verificar si EmailJS está configurado
const isEmailJSConfigured = () => {
  const isValid = EMAILJS_CONFIG.serviceId &&
         EMAILJS_CONFIG.templateId &&
         EMAILJS_CONFIG.publicKey &&
         !EMAILJS_CONFIG.serviceId.includes('tu-service') &&
         !EMAILJS_CONFIG.templateId.includes('tu-template') &&
         !EMAILJS_CONFIG.publicKey.includes('tu-public');
  
  console.log('📧 EmailJS Configuración:', {
    serviceId: EMAILJS_CONFIG.serviceId ? '✅ Configurado' : '❌ Faltante',
    templateId: EMAILJS_CONFIG.templateId ? '✅ Configurado' : '❌ Faltante',
    publicKey: EMAILJS_CONFIG.publicKey ? '✅ Configurado' : '❌ Faltante',
    isValid: isValid
  });
  
  return isValid;
};

// Inicializar EmailJS solo si está configurado
if (isEmailJSConfigured()) {
  emailjs.init(EMAILJS_CONFIG.publicKey);
  console.log('✅ EmailJS inicializado correctamente');
} else {
  console.warn('⚠️ EmailJS no está configurado. Por favor configura las variables de entorno.');
}

/**
 * Genera un código de recuperación aleatorio de 6 dígitos
 */
const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Envía email de recuperación de contraseña usando EmailJS
 */
export const sendPasswordResetEmail = async (email) => {
  try {
    console.log("📧 Iniciando envío de email a:", email);

    // Validar email
    if (!email || !email.includes('@')) {
      throw new Error('Email inválido');
    }

    // VERIFICAR CONFIGURACIÓN OBLIGATORIA
    if (!isEmailJSConfigured()) {
      throw new Error('EmailJS no está configurado correctamente. Por favor configura las variables de entorno.');
    }

    // Generar código
    const resetCode = generateResetCode();

    // Guardar en localStorage para verificación posterior
    const resetData = {
      email,
      code: resetCode,
      timestamp: Date.now(),
      used: false
    };

    localStorage.setItem(`reset_${email}`, JSON.stringify(resetData));

    // CORREGIDO: Preparar parámetros del template
    const templateParams = {
      // Email de destino (DEBE ser el email del usuario)
      to_email: email,
      to_name: email.split('@')[0],
      
      // Información del usuario
      user_email: email,
      user_name: email.split('@')[0],
      
      // Código de recuperación
      reset_code: resetCode,
      code: resetCode,
      
      // Información del remitente (tu sistema)
      from_name: EMAILJS_CONFIG.fromName,
      from_email: EMAILJS_CONFIG.fromEmail,
      reply_to: EMAILJS_CONFIG.fromEmail,
      
      // Información adicional
      expiry_time: '15 minutos',
      app_name: 'Sistema de Recuperación',
      
      // Timestamp para referencia
      timestamp: new Date().toLocaleString('es-ES')
    };

    console.log("🚀 Enviando email con EmailJS a:", email);
    console.log("📋 Parámetros del template:", {
      to_email: templateParams.to_email,
      reset_code: templateParams.reset_code,
      from_name: templateParams.from_name
    });

    // ENVÍO REAL con EmailJS
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    );

    console.log("✅ Email enviado exitosamente. Status:", response.status);
    console.log("🎯 Email enviado correctamente a:", email);

    // IMPORTANTE: NO devolver el código en el mensaje
    return {
      success: true,
      message: `Código de recuperación enviado a ${email}. Revisa tu bandeja de entrada y spam.`,
      isSimulated: false,
      targetEmail: email // Para debugging
    };

  } catch (error) {
    console.error("❌ Error enviando email:", error);

    // Si EmailJS no está configurado, mostrar error claro
    if (!isEmailJSConfigured()) {
      return {
        success: false,
        message: 'EmailJS no está configurado. Por favor contacta al administrador.',
        isSimulated: false
      };
    }

    // Error específico de EmailJS
    let errorMessage = 'Error al enviar el email de recuperación';
    
    if (error.text) {
      errorMessage = `Error de EmailJS: ${error.text}`;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      message: errorMessage,
      isSimulated: false,
      error: error.text || error.message
    };
  }
};

/**
 * Verifica código de recuperación
 */
export const verifyResetCode = (email, code) => {
  const resetData = localStorage.getItem(`reset_${email}`);

  if (!resetData) {
    console.log('❌ No se encontró código para el email:', email);
    return false;
  }

  try {
    const data = JSON.parse(resetData);

    if (data.used) {
      console.log('❌ Código ya fue usado');
      return false;
    }

    // Verificar expiración (15 minutos)
    const now = Date.now();
    const fifteenMinutes = 15 * 60 * 1000;

    if (now - data.timestamp > fifteenMinutes) {
      console.log('❌ Código expirado');
      localStorage.removeItem(`reset_${email}`);
      return false;
    }

    const isValid = data.code === code;
    console.log('🔍 Verificación de código:', isValid ? '✅ Válido' : '❌ Inválido');
    
    return isValid;

  } catch (error) {
    console.error('❌ Error verificando código:', error);
    return false;
  }
};

/**
 * Marca código como usado
 */
export const markResetCodeAsUsed = (email) => {
  const resetData = localStorage.getItem(`reset_${email}`);

  if (resetData) {
    try {
      const data = JSON.parse(resetData);
      data.used = true;
      localStorage.setItem(`reset_${email}`, JSON.stringify(data));
      console.log('✅ Código marcado como usado');
    } catch (error) {
      console.error('❌ Error marcando código como usado:', error);
    }
  }
};

/**
 * Limpia código de recuperación
 */
export const clearResetCode = (email) => {
  localStorage.removeItem(`reset_${email}`);
  console.log('🧹 Código de recuperación limpiado para:', email);
};

/**
 * Función para probar la configuración de EmailJS
 */
export const testEmailJSConfiguration = async (testEmail) => {
  console.log('🧪 Probando configuración de EmailJS...');

  if (!isEmailJSConfigured()) {
    return { 
      success: false, 
      message: '❌ EmailJS no está configurado correctamente' 
    };
  }

  try {
    const testParams = {
      // IMPORTANTE: El email de prueba va al email especificado
      to_email: testEmail,
      to_name: testEmail.split('@')[0],
      
      user_email: testEmail,
      user_name: 'Usuario de Prueba',
      
      reset_code: '123456',
      code: '123456',
      
      from_name: 'Sistema de Prueba',
      from_email: EMAILJS_CONFIG.fromEmail,
      
      expiry_time: '15 minutos',
      app_name: 'Test EmailJS',
      timestamp: new Date().toLocaleString('es-ES')
    };

    console.log('🚀 Enviando email de prueba a:', testEmail);

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      testParams
    );

    console.log('✅ Email de prueba enviado exitosamente');

    return {
      success: true,
      message: '✅ Email de prueba enviado correctamente a ' + testEmail,
      response: response
    };

  } catch (error) {
    console.error('❌ Error en prueba de EmailJS:', error);
    return {
      success: false,
      message: `❌ Error en prueba: ${error.text || error.message}`,
      error: error
    };
  }
};