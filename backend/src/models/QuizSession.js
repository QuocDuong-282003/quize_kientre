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
    currentDifficulty: { type: Number, default: 3 },
    nextQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    currentQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    isFinished: { type: Boolean, default: false },
    finalScore: { type: Number, default: 0 },
    estimatedLevel: { type: String, default: "" },
    startTime: { type: Date, default: Date.now },

    hasTabSwitch: { type: Boolean, default: false },
    suspiciousActivity: { type: Boolean, default: false },
    ipAddress: { type: String }, // Optional: track IP
    userAgent: { type: String }  // Optional: track browser
});

module.exports = mongoose.model('QuizSession', QuizSessionSchema);