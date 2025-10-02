import axios from 'axios';

// Configurar URL base del backend
axios.defaults.baseURL = 'http://localhost:5000';

// Interceptor para agregar el token automáticamente a todas las peticiones
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Error en request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
axios.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`❌ ${error.response.status} ${error.config?.url}`);
      console.error('Error data:', error.response.data);
    } else {
      console.error('❌ Error de red:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axios;