import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const API = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
});

export const adminService = {
    // Get all questions
    getAllQuestions: async () => API.get('/api/admin/questions'),

    // Get single question
    getQuestion: async (id) => API.get(`/api/admin/questions/${id}`),

    // Create question
    createQuestion: async (questionData) => API.post('/api/admin/questions', questionData),

    // Update question
    updateQuestion: async (id, questionData) => API.put(`/api/admin/questions/${id}`, questionData),

    // Delete question
    deleteQuestion: async (id) => API.delete(`/api/admin/questions/${id}`)
};

export default adminService;
