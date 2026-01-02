import React, { useState, useEffect } from 'react';
import adminService from '../services/admin';
import './AdminPage.css';

export default function AdminPage() {
    const [questions, setQuestions] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        content: '',
        options: [{ id: 1, text: '' }, { id: 2, text: '' }, { id: 3, text: '' }, { id: 4, text: '' }],
        correctAnswerIds: [],
        difficulty: 1
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch all questions
    useEffect(() => {
        loadQuestions();
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
                content: '',
                options: [{ id: 1, text: '' }, { id: 2, text: '' }, { id: 3, text: '' }, { id: 4, text: '' }],
                correctAnswerIds: [],
                difficulty: 1
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
            content: question.content,
            options: question.options,
            correctAnswerIds: [...question.correctAnswerIds],
            difficulty: question.difficulty
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
            content: '',
            options: [{ id: 1, text: '' }, { id: 2, text: '' }, { id: 3, text: '' }, { id: 4, text: '' }],
            correctAnswerIds: [],
            difficulty: 1
        });
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
        </div>
    );
}
