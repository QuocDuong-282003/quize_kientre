import React from 'react';
import './QuizSidebar.css';

const QuizSidebar = ({ progress, onSubmit, onFinishEarly, onFinishFinal, quizFinished, timer, loading }) => {
    return (
        <div className="quiz-sidebar">
            <div className="timer-section">
                <div className="timer-label"> Thời gian</div>
                <div className="timer-value">{timer}</div>
            </div>

            <div className="sidebar-actions">
                <button
                    onClick={onSubmit}
                    disabled={loading || quizFinished}
                    className={`submit-btn ${loading || quizFinished ? 'loading' : ''}`}
                >
                    {quizFinished ? 'Đã hoàn thành' : (loading ? ' Đang xử lý...' : '✓ Câu tiếp theo')}
                </button>

                {quizFinished ? (
                    <button
                        onClick={onFinishFinal}
                        disabled={loading}
                        className="finish-btn final"
                        title="Nộp bài sau khi đã hoàn thành 10 câu"
                    >
                        ✓ Nộp bài
                    </button>
                ) : (
                    <button
                        onClick={onFinishEarly}
                        disabled={loading}
                        className="finish-btn"
                        title="Nộp bài ngay với các câu đã làm"
                    >
                        ⚑ Nộp bài sớm
                    </button>
                )}
            </div>

            <div className="progress-section">
                <div className="progress-header">
                    <span> Tiến độ</span>
                    <span className="progress-count">{progress}/10</span>
                </div>

                <div className="progress-bar-container">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${(progress / 10) * 100}%` }}
                    >
                        <span className="progress-percentage">
                            {Math.round((progress / 10) * 100)}%
                        </span>
                    </div>
                </div>

                <div className="questions-grid">
                    {[...Array(10)].map((_, i) => (
                        <div
                            key={i}
                            className={`question-dot ${i < progress ? 'completed' :
                                i === progress ? 'current' : 'pending'
                                }`}
                            title={`Câu ${i + 1}`}
                        >
                            {i < progress ? '✓' : i + 1}
                        </div>
                    ))}
                </div>
            </div>

            <div className="info-section">
                <div className="info-item">
                    <span className="info-text">Độ khó tự động điều chỉnh</span>
                </div>
                <div className="info-item">
                    <span className="info-text">10 câu hỏi</span>
                </div>
            </div>
        </div>
    );
};

export default QuizSidebar;