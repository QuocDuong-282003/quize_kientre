const Question = require('../models/Question');

class AdminService {
    // Get all questions
    async getAllQuestions() {
        return await Question.find().select('-__v');
    }

    // Get single question by ID
    async getQuestionById(id) {
        const question = await Question.findById(id);
        if (!question) {
            throw { status: 404, message: 'Question not found' };
        }
        return question;
    }

    // Create new question
    async createQuestion(data) {
        const { content, options, correctAnswerIds, difficulty } = data;

        // Validation
        if (!content || !options || !correctAnswerIds || difficulty === undefined) {
            throw { status: 400, message: 'Missing required fields' };
        }
        if (options.length < 2 || options.length > 4) {
            throw { status: 400, message: 'Options must be 2-4 items' };
        }
        if (!Array.isArray(correctAnswerIds) || correctAnswerIds.length === 0 || correctAnswerIds.length > 3) {
            throw { status: 400, message: 'Correct answers must be 1-3 items' };
        }

        const question = new Question({
            content,
            options,
            correctAnswerIds,
            difficulty
        });

        await question.save();
        return question;
    }

    // Update question
    async updateQuestion(id, data) {
        const { content, options, correctAnswerIds, difficulty } = data;

        // Validation
        if (options && (options.length < 2 || options.length > 4)) {
            throw { status: 400, message: 'Options must be 2-4 items' };
        }
        if (correctAnswerIds && (!Array.isArray(correctAnswerIds) || correctAnswerIds.length === 0 || correctAnswerIds.length > 3)) {
            throw { status: 400, message: 'Correct answers must be 1-3 items' };
        }

        const question = await Question.findByIdAndUpdate(
            id,
            { content, options, correctAnswerIds, difficulty },
            { new: true }
        );

        if (!question) {
            throw { status: 404, message: 'Question not found' };
        }
        return question;
    }

    // Delete question
    async deleteQuestion(id) {
        const question = await Question.findByIdAndDelete(id);
        if (!question) {
            throw { status: 404, message: 'Question not found' };
        }
        return question;
    }
}

module.exports = new AdminService();
