const Question = require('../models/Question');
const Exam = require('../models/Exam');

class AdminService {
    // Get all questions
    async getAllQuestions() {
        return await Question.find()
            .select('-__v')
            .populate('examId', 'title code');
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
        const { title, content, options, correctAnswerIds, difficulty, examId, topic } = data;

        // Validation
        if (!content || !options || !correctAnswerIds || difficulty === undefined || !examId) {
            throw { status: 400, message: 'Missing required fields' };
        }
        if (options.length < 2 || options.length > 4) {
            throw { status: 400, message: 'Options must be 2-4 items' };
        }
        if (!Array.isArray(correctAnswerIds) || correctAnswerIds.length === 0 || correctAnswerIds.length > 3) {
            throw { status: 400, message: 'Correct answers must be 1-3 items' };
        }

        const exam = await Exam.findById(examId);
        if (!exam) {
            throw { status: 404, message: 'Exam not found' };
        }

        const question = new Question({
            title,
            content,
            options,
            correctAnswerIds,
            difficulty,
            examId,
            topic
        });

        await question.save();
        return question;
    }

    // Update question
    async updateQuestion(id, data) {
        const { title, content, options, correctAnswerIds, difficulty, examId, topic } = data;

        // Validation
        if (options && (options.length < 2 || options.length > 4)) {
            throw { status: 400, message: 'Options must be 2-4 items' };
        }
        if (correctAnswerIds && (!Array.isArray(correctAnswerIds) || correctAnswerIds.length === 0 || correctAnswerIds.length > 3)) {
            throw { status: 400, message: 'Correct answers must be 1-3 items' };
        }

        if (examId) {
            const exam = await Exam.findById(examId);
            if (!exam) {
                throw { status: 404, message: 'Exam not found' };
            }
        }

        const question = await Question.findByIdAndUpdate(
            id,
            { title, content, options, correctAnswerIds, difficulty, examId, topic },
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

    // Exams
    async listExams() {
        return await Exam.find().sort({ createdAt: -1 }).select('title code description category coverImage examDate tags');
    }

    async createExam(data) {
        const { title, code, description, category, coverImage, examDate, tags } = data;
        if (!title || !code) {
            throw { status: 400, message: 'Missing required fields' };
        }

        const exists = await Exam.findOne({ code });
        if (exists) {
            throw { status: 400, message: 'Exam code already exists' };
        }

        const exam = new Exam({ title, code, description, category, coverImage, examDate, tags });
        await exam.save();
        return exam;
    }
}

module.exports = new AdminService();
