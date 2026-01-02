const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Get all questions
router.get('/questions', adminController.getAllQuestions);

// Get single question
router.get('/questions/:id', adminController.getQuestionById);

// Create new question
router.post('/questions', adminController.createQuestion);

// Update question
router.put('/questions/:id', adminController.updateQuestion);

// Delete question
router.delete('/questions/:id', adminController.deleteQuestion);

// Exams
router.get('/exams', adminController.getExams);
router.post('/exams', adminController.createExam);

module.exports = router;
