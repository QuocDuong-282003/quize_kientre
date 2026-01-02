const adminService = require('../services/adminService');

class AdminController {
    // Get all questions
    async getAllQuestions(req, res) {
        try {
            const questions = await adminService.getAllQuestions();
            res.json(questions);
        } catch (err) {
            const status = err.status || 500;
            res.status(status).json({ error: err.message });
        }
    }

    // Get single question
    async getQuestionById(req, res) {
        try {
            const question = await adminService.getQuestionById(req.params.id);
            res.json(question);
        } catch (err) {
            const status = err.status || 500;
            res.status(status).json({ error: err.message });
        }
    }

    // Create new question
    async createQuestion(req, res) {
        try {
            const question = await adminService.createQuestion(req.body);
            res.status(201).json({ message: 'Question created', question });
        } catch (err) {
            const status = err.status || 500;
            res.status(status).json({ error: err.message });
        }
    }

    // Update question
    async updateQuestion(req, res) {
        try {
            const question = await adminService.updateQuestion(req.params.id, req.body);
            res.json({ message: 'Question updated', question });
        } catch (err) {
            const status = err.status || 500;
            res.status(status).json({ error: err.message });
        }
    }

    // Delete question
    async deleteQuestion(req, res) {
        try {
            const question = await adminService.deleteQuestion(req.params.id);
            res.json({ message: 'Question deleted', question });
        } catch (err) {
            const status = err.status || 500;
            res.status(status).json({ error: err.message });
        }
    }

    // Exams
    async getExams(req, res) {
        try {
            const exams = await adminService.listExams();
            res.json(exams);
        } catch (err) {
            const status = err.status || 500;
            res.status(status).json({ error: err.message });
        }
    }

    async createExam(req, res) {
        try {
            const exam = await adminService.createExam(req.body);
            res.status(201).json({ message: 'Exam created', exam });
        } catch (err) {
            const status = err.status || 500;
            res.status(status).json({ error: err.message });
        }
    }
}

module.exports = new AdminController();
