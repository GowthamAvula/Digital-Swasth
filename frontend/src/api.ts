import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

console.log('📡 API Initialized with Base URL:', api.defaults.baseURL);

export default api;
