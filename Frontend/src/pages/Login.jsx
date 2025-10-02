import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaLock } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { login, isAuthenticated, error, clearMessages } = useAuth();
  const navigate = useNavigate();

  const { email, password } = formData;

  useEffect(() => {
    clearMessages();
  }, [clearMessages]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      // This basic validation can be enhanced
      return;
    }
    await login({ email, password });
  };

  return (
    <div className='login-container'>
      <div className='login-box'>
        <h2>Iniciar Sesión</h2>
        <form onSubmit={onSubmit}>
          <div className='input-group'>
            <FaUser className='icon' />
            <input
              type='email'
              name='email'
              placeholder='Correo Electrónico'
              value={email}
              onChange={onChange}
              required
            />
          </div>
          <div className='input-group'>
            <FaLock className='icon' />
            <input
              type='password'
              name='password'
              placeholder='Contraseña'
              value={password}
              onChange={onChange}
              required
            />
          </div>
          {error && <p className='error-message'>{error}</p>}
          <button type='submit' className='login-btn'>Acceder</button>
        </form>
        <div className='links'>
          <Link to='/forgot-password'>¿Olvidaste tu contraseña?</Link>
          <Link to='/register'>Crear una cuenta</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;