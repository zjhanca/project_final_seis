// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import MessageAlert from "../components/Common/MessageAlert";
import { validateEmail } from "../utils/validators";
import { emailExists } from "../utils/userHelpers";
import EmailJSConfig from "../components/EmailJSConfig";
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [isEmailJSConfigured, setIsEmailJSConfigured] = useState(false);
  const { loading, error, success, requestPasswordReset, clearMessages } = useAuth();

  // Verificar si EmailJS está configurado
  React.useEffect(() => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    const configured = serviceId && templateId && publicKey &&
                      serviceId !== 'tu-service-id' &&
                      templateId !== 'tu-template-id' &&
                      publicKey !== 'tu-public-key';

    setIsEmailJSConfigured(configured);
  }, []);

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    // Limpiar errores previos
    setEmailError("");
    clearMessages();

    // Validar email en tiempo real
    if (newEmail && !validateEmail(newEmail).isValid) {
      setEmailError(validateEmail(newEmail).message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Limpiar mensajes previos
    setEmailError("");
    clearMessages();

    // Validar email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.message);
      return;
    }

    // Verificar si el email existe antes de proceder
    if (!emailExists(email)) {
      setEmailError("No existe una cuenta asociada a este correo electrónico. ¿Necesitas registrarte?");
      return;
    }

    try {
      await requestPasswordReset(email);
    } catch (err) {
      // Error ya manejado en el hook
      console.error('Error en recuperación de contraseña:', err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">🔐 Recuperar Contraseña</h1>
        <p className="auth-subtitle">
          Ingresa tu correo electrónico y te enviaremos un código para restablecer tu contraseña.
        </p>

        {!isEmailJSConfigured && (
          <div className="alert alert-warning mb-3">
            <span>⚠️ EmailJS no está configurado. Se usará modo simulación.</span>
            <button
              type="button"
              className="btn btn-secondary ml-2"
              onClick={() => setShowConfig(!showConfig)}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
            >
              {showConfig ? 'Ocultar' : 'Configurar'}
            </button>
          </div>
        )}

        {showConfig && (
          <EmailJSConfig
            onConfigComplete={(configured) => {
              setIsEmailJSConfigured(configured);
              if (configured) {
                setShowConfig(false);
              }
            }}
          />
        )}

        {/* Mensajes */}
        <MessageAlert type="error" message={error} onClose={clearMessages} />
        <MessageAlert type="success" message={success} onClose={clearMessages} />
        <MessageAlert type="error" message={emailError} />

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={email}
              onChange={handleEmailChange}
              placeholder="tu.email@ejemplo.com"
              disabled={loading}
              className={emailError ? 'input-error' : ''}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !email || emailError}
          >
            {loading ? (
              <>
                <LoadingSpinner small /> Enviando...
              </>
            ) : (
              "Enviar Código de Recuperación"
            )}
          </button>
        </form>

        <div className="auth-links">
          <p>
            ¿Ya tienes un código? <Link to="/reset-password">Restablecer contraseña</Link>
          </p>
          <p>
            <Link to="/login">Volver al inicio de sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;