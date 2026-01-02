import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import quizService from '../services/quiz';
import '../App.css';
import './ReviewPage.css';

const ReviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reviewData: initialData, sessionId } = location.state || {};

  const [reviewData, setReviewData] = useState(initialData || []);
  const [loading, setLoading] = useState(!initialData && !!sessionId);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (initialData || !sessionId) return;
      try {
        setLoading(true);
        setError('');
        const data = await quizService.getReview(sessionId);
        setReviewData(data.history || []);
      } catch (err) {
        console.error('Load review failed', err);
        setError('Không tải được dữ liệu bài làm.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [initialData, sessionId]);

  const hasData = reviewData && reviewData.length > 0;

  return (
    <div className="app-container review-page">
      <div className="header">
        <div className="header-title">Adaptive Quiz Platform</div>
      </div>

      <div className="review-shell">
        <div className="review-actions">
          <button className="link-btn" onClick={() => navigate('/result')}>
            ⬅ Quay lại bảng điểm
          </button>
          {loading && <span className="pill pill-info">Đang tải...</span>}
          {error && <span className="pill pill-error">{error}</span>}
        </div>

        {!hasData && !loading && !error && (
          <div className="empty-card">
            <p>Không có dữ liệu để xem</p>
            <button className="primary-btn" onClick={() => navigate('/result')}>
              Quay lại bảng điểm
            </button>
          </div>
        )}

        {hasData && (
          <div className="review-card">
            <h2>Chi tiết bài làm</h2>
            <div className="review-list">
              {reviewData.map((item, index) => {
                const q = item.questionId;
                if (!q) {
                  return (
                    <div key={index} className="question-card muted">
                      <p>Không thể tải dữ liệu câu hỏi {index + 1}</p>
                    </div>
                  );
                }

                const cardClass = item.isCorrect ? 'question-card correct' : 'question-card wrong';

                return (
                  <div key={index} className={cardClass}>
                    <div className="question-meta">
                      <span className="meta-left">Câu {index + 1} · Độ khó {item.difficulty}/5</span>
                      <span className="meta-right">{item.isCorrect ? 'ĐÚNG' : 'SAI'}</span>
                    </div>
                    <p className="question-text">{q.content}</p>

                    <div className="options-grid">
                      {q.options && q.options.map((opt, optIndex) => {
                        const isUserSelected = item.selectedAnswerIds && item.selectedAnswerIds.includes(opt.id);
                        const isCorrectAnswer = q.correctAnswerIds && q.correctAnswerIds.includes(opt.id);

                        const state = isCorrectAnswer ? 'correct' : isUserSelected ? 'chosen' : 'neutral';

                        return (
                          <div key={opt.id} className={`option-chip ${state}`}>
                            <span className="opt-letter">{String.fromCharCode(65 + optIndex)}</span>
                            <span className="opt-text">{opt.text}</span>
                            {state === 'correct' && <span className="opt-badge">Đáp án đúng</span>}
                            {state === 'chosen' && !isCorrectAnswer && <span className="opt-badge error">Bạn chọn</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewPage;
