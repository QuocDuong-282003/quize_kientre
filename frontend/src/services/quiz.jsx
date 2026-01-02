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
    startQuiz: async (userId, examId) => {
        const response = await API.post('/api/quiz/start', { userId, examId });
        return response.data;
    },

    submitAnswer: async (sessionId, questionId, selectedAnswerIds, reason = null, finishEarly = false) => {
        const response = await API.post('/api/quiz/submit', {
            sessionId,
            questionId,
            selectedAnswerIds,
            reason,
            finishEarly
        });
        return response.data;
    },

    getReview: async (sessionId) => {
        const response = await API.get(`/api/quiz/review/${sessionId}`);
        return response.data;
    },

    getExams: async () => {
        const response = await API.get('/api/admin/exams');
        return response.data;
    },

    goBack: async (sessionId) => {
        const response = await API.post('/api/quiz/back', { sessionId });
        return response.data;
    }
};

export default quizService;
