// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import MessageAlert from "../components/Common/MessageAlert";
import axios from 'axios';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      const { username, email, password } = formData;

      axios.post('http://localhost:5000/api/auth/register', {
        username,
        email,
        password,
      });

      setSuccess("¡Registro exitoso! Redirigiendo al login...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Error en el registro. Inténtalo de nuevo.");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Crear Cuenta</h1>
        <p className="auth-subtitle">Únete a nuestra plataforma para comenzar</p>

        <MessageAlert type="error" message={error} onClose={() => setError("")} />
        <MessageAlert type="success" message={success} onClose={() => setSuccess("")} />
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Nombre de usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
          
          <button type="submit" className="btn btn-primary">Registrarse</button>
        </form>

        <div className="auth-links">
          <p>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;