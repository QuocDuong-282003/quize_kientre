import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const API = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

export const authService = {
    login: async (email, password) => {
        const response = await API.post('/api/auth/login', { email, password });
        return response.data;
    },

    register: async (email, password) => {
        const response = await API.post('/api/auth/register', { email, password });
        return response.data;
    }
};

export default authService;
