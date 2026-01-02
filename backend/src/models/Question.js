const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    title: { type: String, default: '' },
    content: { type: String, required: true },
    options: [{ id: Number, text: String }],
    correctAnswerIds: [Number],
    difficulty: { type: Number, min: 1, max: 5 },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
    topic: { type: String, default: '' }
});

// Speed up lookups for adaptive sampling by exam/difficulty
QuestionSchema.index({ examId: 1, difficulty: 1 });
QuestionSchema.index({ difficulty: 1 });

module.exports = mongoose.model('Question', QuestionSchema);