import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import quizService from '../services/quiz';
import '../App.css';
import './QuizPage.css';

const computeResultFallback = (payload) => {
  if (!payload) return null;

  // Prefer existing values
  if (payload.score !== undefined && payload.level) return payload;

  const history = payload.reviewData || payload.history || [];
  if (!history.length) return payload;

  const totalDifficulty = history.reduce((sum, item) => sum + (item.difficulty || 0), 0);
  const earnedDifficulty = history.reduce((sum, item) => sum + (item.isCorrect ? (item.difficulty || 0) : 0), 0);
  const score = totalDifficulty > 0 ? Math.round((earnedDifficulty / totalDifficulty) * 100) : 0;

  let level = 'Beginner';
  if (score >= 80) level = 'Advanced';
  else if (score >= 55) level = 'Intermediate';

  return {
    ...payload,
    score,
    level,
  };
};

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    if (location.state?.result) {
      const normalized = computeResultFallback(location.state.result);
      setResult(normalized);
      localStorage.setItem('lastResult', JSON.stringify(normalized));
    } else {
      const saved = localStorage.getItem('lastResult');
      if (saved) {
        const parsed = JSON.parse(saved);
        setResult(computeResultFallback(parsed));
      }
    }
  }, [location.state]);

  useEffect(() => {
    const fetchReview = async () => {
      if (!result || (result.reviewData && result.reviewData.length) || !result.sessionId) return;
      try {
        setLoadingReview(true);
        setReviewError('');
        const data = await quizService.getReview(result.sessionId);
        const merged = { ...result, reviewData: data.history, score: result.score ?? data.score, level: result.level ?? data.level };
        setResult(merged);
        localStorage.setItem('lastResult', JSON.stringify(merged));
      } catch (err) {
        console.error('Fetch review failed', err);
        setReviewError('Không tải được chi tiết bài làm.');
      } finally {
        setLoadingReview(false);
      }
    };

    fetchReview();
  }, [result]);

  if (!result) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p>Không có dữ liệu kết quả</p>
          <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '10px 20px', background: '#29b6f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {location.state?.warning && (
        <div className="result-warning">
          {/* <div className="result-warning-icon">🚨</div> */}
          {location.state.warning}
        </div>
      )}

      <div className="header">
        <div className="header-title">Adaptive Quiz Platform</div>
      </div>
      <div className="main-content">
        <div className="result-screen">
          <h1 className="result-title">Hoàn thành xuất sắc!</h1>
          <div className="result-level">{result.level}</div>
          <p className="result-score">Điểm số: {result.score}/100</p>
          {(result.reason === 'finish_early' || result.reason === 'tab_switch' || result.reason === 'mouse_leave_violation') && (
            <div className="result-note">Điểm được tính theo các câu đã làm trước khi bài bị nộp.</div>
          )}
          {reviewError && <div className="result-note" style={{ color: '#b00020' }}>{reviewError}</div>}
          {loadingReview && <div className="result-note">Đang tải chi tiết bài làm...</div>}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
            <button
              className="review-btn"
              onClick={() => navigate('/review', { state: { reviewData: result.reviewData || result.history || [], sessionId: result.sessionId } })}
              style={{ background: '#17a2b8', color: '#fff', padding: '16px 40px', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
            >
              Xem chi tiết đáp án
            </button>
            <button
              className="restart-btn"
              onClick={() => {
                localStorage.removeItem('lastResult');
                navigate('/');
              }}
            >
              Làm bài kiểm tra mới
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
