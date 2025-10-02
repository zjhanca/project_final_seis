import axios from 'axios';

// Crea una instancia de axios
const clienteAxios = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api'
});

export default clienteAxios;