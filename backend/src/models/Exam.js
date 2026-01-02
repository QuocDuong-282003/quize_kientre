const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    category: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    tags: [{ type: String }],
    examDate: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Exam', ExamSchema);
