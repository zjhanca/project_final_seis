// src/pages/ResetPassword.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import MessageAlert from "../components/Common/MessageAlert";
import { validateEmail, validatePassword, validatePasswordMatch, validateResetCode } from "../utils/validators";
import './Auth.css';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [validationErrors, setValidationErrors] = useState({});
  const { loading, error, success, resetPassword, clearMessages } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Validación en tiempo real
    const newErrors = { ...validationErrors };

    switch (name) {
      case 'email':
        const emailValidation = validateEmail(value);
        if (emailValidation.isValid) {
          delete newErrors.email;
        } else {
          newErrors.email = emailValidation.error;
        }
        break;
      case 'code':
        const codeValidation = validateResetCode(value);
        if (codeValidation.isValid) {
          delete newErrors.code;
        } else {
          newErrors.code = codeValidation.error;
        }
        break;
      case 'newPassword':
        const passwordValidation = validatePassword(value);
        if (passwordValidation.isValid) {
          delete newErrors.newPassword;
        } else {
          newErrors.newPassword = passwordValidation.error;
        }
        // Revalidar confirmación si existe
        if (formData.confirmPassword) {
          const matchValidation = validatePasswordMatch(value, formData.confirmPassword);
          if (matchValidation.isValid) {
            delete newErrors.confirmPassword;
          } else {
            newErrors.confirmPassword = matchValidation.error;
          }
        }
        break;
      case 'confirmPassword':
        const matchValidation = validatePasswordMatch(formData.newPassword, value);
        if (matchValidation.isValid) {
          delete newErrors.confirmPassword;
        } else {
          newErrors.confirmPassword = matchValidation.error;
        }
        break;
    }

    setValidationErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    // Validar todos los campos
    const errors = {};

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) errors.email = emailValidation.error;

    const codeValidation = validateResetCode(formData.code);
    if (!codeValidation.isValid) errors.code = codeValidation.error;

    const passwordValidation = validatePassword(formData.newPassword);
    if (!passwordValidation.isValid) errors.newPassword = passwordValidation.error;

    const matchValidation = validatePasswordMatch(formData.newPassword, formData.confirmPassword);
    if (!matchValidation.isValid) errors.confirmPassword = matchValidation.error;

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await resetPassword(formData.email, formData.code, formData.newPassword);

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      // Error ya manejado en el hook
    }
  };

  const hasValidationErrors = Object.keys(validationErrors).length > 0;
  const isFormValid = formData.email && formData.code && formData.newPassword && formData.confirmPassword && !hasValidationErrors;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Restablecer Contraseña</h1>
        <p className="auth-subtitle">
          Ingresa el código que recibiste por email y tu nueva contraseña.
        </p>

        {/* Mensajes */}
        <MessageAlert type="error" message={error} onClose={clearMessages} />
        <MessageAlert type="success" message={success} onClose={clearMessages} />

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="tu.email@ejemplo.com"
              disabled={loading}
              className={validationErrors.email ? 'input-error' : ''}
            />
            <MessageAlert type="error" message={validationErrors.email} />
          </div>

          <div className="form-group">
            <label htmlFor="code">Código de recuperación</label>
            <input
              type="text"
              id="code"
              name="code"
              required
              value={formData.code}
              onChange={handleChange}
              placeholder="Ingresa el código de 6 dígitos"
              disabled={loading}
              maxLength="6"
              className={validationErrors.code ? 'input-error' : ''}
            />
            <MessageAlert type="error" message={validationErrors.code} />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">Nueva contraseña</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              required
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              disabled={loading}
              minLength="6"
              className={validationErrors.newPassword ? 'input-error' : ''}
            />
            <MessageAlert type="error" message={validationErrors.newPassword} />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar nueva contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repite la contraseña"
              disabled={loading}
              minLength="6"
              className={validationErrors.confirmPassword ? 'input-error' : ''}
            />
            <MessageAlert type="error" message={validationErrors.confirmPassword} />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !isFormValid}
          >
            {loading ? (
              <>
                <LoadingSpinner small /> Restableciendo...
              </>
            ) : (
              "Restablecer contraseña"
            )}
          </button>
        </form>

        <div className="auth-links">
          <p>
            ¿No tienes un código? <Link to="/forgot-password">Solicitar código</Link>
          </p>
          <p>
            <Link to="/login">Volver al inicio de sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;