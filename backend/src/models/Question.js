const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    content: { type: String, required: true },
    options: [{ id: Number, text: String }],
    correctAnswerIds: [Number],
    difficulty: { type: Number, min: 1, max: 5 }
});

module.exports = mongoose.model('Question', QuestionSchema);