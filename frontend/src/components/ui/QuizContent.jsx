import React from 'react';
import './QuizContent.css';

const QuizContent = ({ question, progress, onSelect, selectedIds, loading }) => {
    if (!question) {
        return (
            <div className="quiz-content">
                <div className="loading-spinner"> Đang tải câu hỏi...</div>
            </div>
        );
    }
    const handleCheckboxChange = (optionId) => {
        if (loading) return;

        if (selectedIds.includes(optionId)) {
            onSelect(selectedIds.filter(id => id !== optionId));
        } else {
            if (selectedIds.length >= 3) {
                return;
            }
            onSelect([...selectedIds, optionId]);
        }
    };

    return (
        <div className="quiz-content">
            <div className="quiz-header">
                <div className="difficulty-badge">
                    <span>Độ khó: {question.difficulty}/5</span>
                </div>
                <div className="progress-text">
                    Câu hỏi {progress + 1}/10
                </div>
            </div>

            <div className="question-container">
                <div className="question-number">
                    {progress + 1}
                </div>
                <div className="question-content">
                    <h2 className="question-text">{question.content}</h2>

                    {question.correctAnswerIds && question.correctAnswerIds.length > 1 && (
                        <div className="multiple-answer-hint">
                            Có thể chọn nhiều đáp án
                        </div>
                    )}

                    {selectedIds.length > 0 && (
                        <div className="selection-info">
                            ✓ Đã chọn {selectedIds.length} đáp án {selectedIds.length === 3 ? '(tối đa)' : ''}
                        </div>
                    )}

                    <div className="options-container">
                        {question.options.map((opt, index) => {
                            const isSelected = selectedIds.includes(opt.id);
                            const isDisabled = !isSelected && selectedIds.length >= 3;

                            return (
                                <label
                                    key={opt.id}
                                    className={`option-label ${isSelected ? 'selected' : ''} ${loading || isDisabled ? 'disabled' : ''
                                        }`}
                                    title={isDisabled ? 'Tối đa 3 đáp án' : ''}
                                >
                                    <input
                                        type="checkbox"
                                        name={`answer-${opt.id}`}
                                        checked={isSelected}
                                        onChange={() => handleCheckboxChange(opt.id)}
                                        disabled={loading || isDisabled}
                                        className="option-checkbox"
                                    />
                                    <div className="option-content">
                                        <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                                        <span className="option-text">{opt.text}</span>
                                        {isSelected && <span className="check-icon">✓</span>}
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizContent;