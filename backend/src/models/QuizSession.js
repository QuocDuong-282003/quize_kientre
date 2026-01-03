const mongoose = require('mongoose');

const QuizSessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    history: [{
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        selectedAnswerIds: [Number],
        isCorrect: Boolean,
        difficulty: Number,
        timestamp: { type: Date, default: Date.now }
    }],
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
    currentDifficulty: { type: Number, default: 3 },
    nextQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    currentQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    isFinished: { type: Boolean, default: false },
    finalScore: { type: Number, default: 0 },
    estimatedLevel: { type: String, default: "" },
    startTime: { type: Date, default: Date.now },

    lastActivity: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 1000 * 60 * 60 * 6) },

    hasTabSwitch: { type: Boolean, default: false },
    suspiciousActivity: { type: Boolean, default: false },
    ipAddress: { type: String },
    userAgent: { type: String }
}, { timestamps: true });

QuizSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
QuizSessionSchema.index({ userId: 1, examId: 1, isFinished: 1 });
QuizSessionSchema.index({ currentQuestionId: 1 });

module.exports = mongoose.model('QuizSession', QuizSessionSchema);