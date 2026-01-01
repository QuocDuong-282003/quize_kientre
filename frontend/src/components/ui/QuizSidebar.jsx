import React from 'react';
import './QuizSidebar.css';

const QuizSidebar = ({ progress, onSubmit, onEarlySubmit, timer, loading }) => {
    return (
        <div className="quiz-sidebar">
            <div className="timer-section">
                <div className="timer-label"> Thời gian</div>
                <div className="timer-value">{timer}</div>
            </div>

            <button
                onClick={onSubmit}
                disabled={loading}
                className={`submit-btn ${loading ? 'loading' : ''}`}
            >
                {loading ? ' Đang xử lý...' : '✓ Câu tiếp theo'}
            </button>

            {progress >= 1 && progress < 10 && (
                <button
                    onClick={onEarlySubmit}
                    disabled={loading}
                    className="early-submit-btn"
                    style={{
                        marginTop: '10px',
                        padding: '12px 20px',
                        background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                        boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        if (!loading) {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(255, 152, 0, 0.4)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 15px rgba(255, 152, 0, 0.3)';
                    }}
                >
                    Nộp bài sớm ({progress}/10)
                </button>
            )}

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
                    {/* <span className="info-icon">💡</span> */}
                    <span className="info-text">Độ khó tự động điều chỉnh</span>
                </div>
                <div className="info-item">
                    {/* <span className="info-icon">🎯</span> */}
                    <span className="info-text">10 câu hỏi</span>
                </div>
            </div>
        </div>
    );
};

export default QuizSidebar;