const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

router.get('/questions/:examId', quizController.getQuestionsByExam);
router.post('/start', quizController.startQuiz);
router.post('/submit', quizController.submitAnswer);
router.post('/back', quizController.goBack);
router.get('/review/:sessionId', quizController.getReview);

module.exports = router;