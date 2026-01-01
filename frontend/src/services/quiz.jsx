import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const API = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Quiz service functions
export const quizService = {
    startQuiz: async (userId) => {
        try {
            const response = await API.post('/api/quiz/start', { userId });
            return response.data;
        } catch (error) {
            console.error('Start quiz error:', error.response?.data || error.message);
            throw error;
        }
    },

    submitAnswer: async (sessionId, questionId, selectedAnswerIds, reason = null) => {
        try {
            const response = await API.post('/api/quiz/submit', {
                sessionId,
                questionId,
                selectedAnswerIds,
                reason
            });
            return response.data;
        } catch (error) {
            console.error('Submit answer error:', error.response?.data || error.message);
            // Trả về error message từ backend nếu có
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw error;
        }
    },

    getReview: async (sessionId) => {
        try {
            const response = await API.get(`/api/quiz/review/${sessionId}`);
            return response.data;
        } catch (error) {
            console.error('Get review error:', error.response?.data || error.message);
            throw error;
        }
    }
};

export default quizService;
