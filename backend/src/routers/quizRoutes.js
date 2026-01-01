const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

router.post('/start', quizController.startQuiz);
router.post('/submit', quizController.submitAnswer);
router.get('/review/:sessionId', quizController.getReview);

module.exports = router;