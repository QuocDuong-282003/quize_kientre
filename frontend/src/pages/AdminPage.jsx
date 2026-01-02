import React, { useState, useEffect } from 'react';
import adminService from '../services/admin';
import './AdminPage.css';

export default function AdminPage() {
    const [questions, setQuestions] = useState([]);
    const [exams, setExams] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        options: [{ id: 1, text: '' }, { id: 2, text: '' }, { id: 3, text: '' }, { id: 4, text: '' }],
        correctAnswerIds: [],
        difficulty: 1,
        examId: '',
        topic: ''
    });
    const [loading, setLoading] = useState(true);
    const [examLoading, setExamLoading] = useState(true);
    const [error, setError] = useState('');
    const [examError, setExamError] = useState('');
    const [examForm, setExamForm] = useState({ title: '', code: '', description: '', category: '' });

    // Fetch all questions
    useEffect(() => {
        loadQuestions();
        loadExams();
    }, []);

    const loadQuestions = async () => {
        try {
            setLoading(true);
            const res = await adminService.getAllQuestions();
            setQuestions(res.data);
            setError('');
        } catch (err) {
            setError('Lỗi load câu hỏi: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const loadExams = async () => {
        try {
            setExamLoading(true);
            const res = await adminService.listExams();
            setExams(res.data || []);
            setExamError('');
        } catch (err) {
            setExamError('Lỗi tải khóa thi: ' + (err.response?.data?.error || err.message));
        } finally {
            setExamLoading(false);
        }
    };

    // Handle option change
    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index].text = value;
        setFormData({ ...formData, options: newOptions });
    };

    // Handle correct answer selection
    const handleCorrectAnswerChange = (id) => {
        setFormData(prev => ({
            ...prev,
            correctAnswerIds: prev.correctAnswerIds.includes(id)
                ? prev.correctAnswerIds.filter(aid => aid !== id)
                : [...prev.correctAnswerIds, id].slice(0, 3) // Max 3 correct answers
        }));
    };

    // Create or update question
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            setError('Vui lòng nhập tiêu đề câu hỏi');
            return;
        }
        if (!formData.examId) {
            setError('Vui lòng chọn khóa thi cho câu hỏi');
            return;
        }
        if (!formData.content.trim()) {
            setError('Vui lòng nhập nội dung câu hỏi');
            return;
        }
        if (formData.options.some(opt => !opt.text.trim())) {
            setError('Vui lòng nhập đầy đủ tất cả đáp án');
            return;
        }
        if (formData.correctAnswerIds.length === 0) {
            setError('Vui lòng chọn ít nhất 1 đáp án đúng');
            return;
        }

        try {
            if (editingId) {
                await adminService.updateQuestion(editingId, formData);
                setError('');
                alert(' Cập nhật câu hỏi thành công');
            } else {
                await adminService.createQuestion(formData);
                setError('');
                alert(' Tạo câu hỏi thành công');
            }

            setFormData({
                title: '',
                content: '',
                options: [{ id: 1, text: '' }, { id: 2, text: '' }, { id: 3, text: '' }, { id: 4, text: '' }],
                correctAnswerIds: [],
                difficulty: 1,
                examId: '',
                topic: ''
            });
            setShowForm(false);
            setEditingId(null);
            loadQuestions();
        } catch (err) {
            setError('Lỗi: ' + (err.response?.data?.error || err.message));
        }
    };

    // Edit question
    const handleEdit = (question) => {
        setEditingId(question._id);
        setFormData({
            title: question.title || '',
            content: question.content,
            options: question.options,
            correctAnswerIds: [...question.correctAnswerIds],
            difficulty: question.difficulty,
            examId: question.examId?._id || question.examId || '',
            topic: question.topic || ''
        });
        setShowForm(true);
    };

    // Delete question
    const handleDelete = async (id) => {
        if (!window.confirm('Chắc chắn xóa câu hỏi này?')) return;

        try {
            await adminService.deleteQuestion(id);
            setError('');
            alert(' Xóa câu hỏi thành công');
            loadQuestions();
        } catch (err) {
            setError('Lỗi xóa: ' + (err.response?.data?.error || err.message));
        }
    };

    // Cancel edit
    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            title: '',
            content: '',
            options: [{ id: 1, text: '' }, { id: 2, text: '' }, { id: 3, text: '' }, { id: 4, text: '' }],
            correctAnswerIds: [],
            difficulty: 1,
            examId: '',
            topic: ''
        });
    };

    const handleCreateExam = async () => {
        if (!examForm.title || !examForm.code) {
            setExamError('Nhập tối thiểu tiêu đề và mã khóa thi');
            return;
        }
        try {
            setExamLoading(true);
            await adminService.createExam(examForm);
            setExamForm({ title: '', code: '', description: '', category: '' });
            loadExams();
        } catch (err) {
            setExamError('Lỗi tạo khóa thi: ' + (err.response?.data?.error || err.message));
        } finally {
            setExamLoading(false);
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1> Quản Lý Câu Hỏi Quiz</h1>
                <button
                    className="btn-add-question"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? ' Hủy' : ' Thêm Câu Hỏi'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Form Thêm/Sửa */}
            {showForm && (
                <div className="question-form-container">
                    <h2>{editingId ? ' Sửa Câu Hỏi' : ' Thêm Câu Hỏi Mới'}</h2>
                    <form onSubmit={handleSubmit}>
                        {/* Question title */}
                        <div className="form-group">
                            <label> Tiêu đề *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ví dụ: C cơ bản - Con trỏ"
                            />
                        </div>

                        {/* Exam selection */}
                        <div className="form-group">
                            <label> Khóa thi *</label>
                            <div className="exam-row">
                                <select
                                    value={formData.examId}
                                    onChange={(e) => setFormData({ ...formData, examId: e.target.value })}
                                >
                                    <option value="">-- Chọn khóa thi --</option>
                                    {exams.map(ex => (
                                        <option key={ex._id} value={ex._id}>{ex.title} ({ex.code})</option>
                                    ))}
                                </select>
                                <button type="button" className="pill-btn" onClick={loadExams} disabled={examLoading}>
                                    Làm mới
                                </button>
                            </div>
                            {examError && <div className="inline-error">{examError}</div>}
                        </div>

                        {/* Content */}
                        <div className="form-group">
                            <label> Nội Dung Câu Hỏi *</label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Nhập câu hỏi..."
                                rows="3"
                            />
                        </div>

                        {/* Topic */}
                        <div className="form-group">
                            <label> Chủ đề / Môn *</label>
                            <input
                                type="text"
                                value={formData.topic}
                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                placeholder="Lập trình C, Node.js, Phỏng vấn, Mạng..."
                            />
                        </div>

                        {/* Difficulty */}
                        <div className="form-group">
                            <label> Độ Khó *</label>
                            <select
                                value={formData.difficulty}
                                onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                            >
                                <option value={1}>1 - Cơ Bản</option>
                                <option value={2}>2 - Trung Bình</option>
                                <option value={3}>3 - Nâng Cao</option>
                                <option value={4}>4 - Khó</option>
                                <option value={5}>5 - Cực Khó</option>
                            </select>
                        </div>

                        {/* Options */}
                        <div className="form-group">
                            <label> Đáp Án (A, B, C, D) *</label>
                            <div className="admin-options-container">
                                {formData.options.map((option, idx) => (
                                    <div key={idx} className="admin-option-row">
                                        <span className="admin-option-label">{String.fromCharCode(65 + idx)}</span>
                                        <input
                                            type="text"
                                            value={option.text}
                                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                                            placeholder={`Đáp án ${String.fromCharCode(65 + idx)}`}
                                        />
                                        <label className="admin-checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.correctAnswerIds.includes(option.id)}
                                                onChange={() => handleCorrectAnswerChange(option.id)}
                                                disabled={
                                                    formData.correctAnswerIds.length >= 3 &&
                                                    !formData.correctAnswerIds.includes(option.id)
                                                }
                                            />
                                            <span>Đáp án đúng</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <small>* Có thể chọn 1-3 đáp án đúng</small>
                        </div>

                        {/* Correct Answers Display */}
                        <div className="admin-correct-answers-display">
                            <strong> Đáp án đúng: </strong>
                            {formData.correctAnswerIds.length > 0 ? (
                                formData.correctAnswerIds
                                    .map(id => String.fromCharCode(64 + id))
                                    .join(', ')
                            ) : (
                                <span style={{ color: '#e74c3c' }}>Chưa chọn</span>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="form-buttons">
                            <button type="submit" className="btn-submit">
                                {editingId ? 'Cập Nhật' : 'Tạo Mới'}
                            </button>
                            <button type="button" className="btn-cancel" onClick={handleCancel}>
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Questions List */}
            <div className="questions-list">
                {loading ? (
                    <p className="loading">Đang tải câu hỏi...</p>
                ) : questions.length === 0 ? (
                    <p className="empty">Không có câu hỏi nào</p>
                ) : (
                    <div className="admin-questions-grid">
                        {questions.map((question, idx) => (
                            <div key={question._id} className="admin-question-card">
                                <div className="admin-question-number">#{idx + 1}</div>
                                <div className="admin-difficulty-badge" data-level={question.difficulty}>
                                    Level {question.difficulty}
                                </div>
                                <div className="admin-question-meta">
                                    <span className="pill-soft">{question.examId?.title || 'Chưa gán khóa thi'}</span>
                                    {question.topic && <span className="pill-soft dark">{question.topic}</span>}
                                </div>
                                {question.title && <p className="admin-question-title">{question.title}</p>}
                                <p className="admin-question-content">{question.content}</p>

                                <div className="admin-options-display">
                                    {question.options.map((option, oidx) => (
                                        <div
                                            key={option.id}
                                            className={`admin-option-item ${question.correctAnswerIds.includes(option.id) ? 'admin-correct' : ''
                                                }`}
                                        >
                                            <span className="admin-option-key">{String.fromCharCode(65 + oidx)}</span>
                                            <span className="admin-option-text">{option.text}</span>
                                            {question.correctAnswerIds.includes(option.id) && (
                                                <span className="admin-correct-badge">✓</span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="admin-question-actions">
                                    <button
                                        className="btn-edit"
                                        onClick={() => handleEdit(question)}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDelete(question._id)}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick exam creator */}
            <div className="exam-form-container">
                <h2>Tạo khóa thi nhanh</h2>
                <div className="exam-form-grid">
                    <input
                        type="text"
                        placeholder="Tiêu đề (ví dụ: Lập trình C)"
                        value={examForm.title}
                        onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Mã (ví dụ: C-BASIC)"
                        value={examForm.code}
                        onChange={(e) => setExamForm({ ...examForm, code: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Danh mục (tùy chọn)"
                        value={examForm.category}
                        onChange={(e) => setExamForm({ ...examForm, category: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Mô tả ngắn"
                        value={examForm.description}
                        onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                    />
                    <button type="button" className="btn-submit" onClick={handleCreateExam} disabled={examLoading}>
                        {examLoading ? 'Đang lưu...' : 'Tạo khóa thi'}
                    </button>
                </div>
            </div>
        </div>
    );
}
