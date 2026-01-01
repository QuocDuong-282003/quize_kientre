import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../App.css';
import './ResultPage.css';

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (location.state?.result) {
      setResult(location.state.result);
      localStorage.setItem('lastResult', JSON.stringify(location.state.result));
    } else {
      const saved = localStorage.getItem('lastResult');
      if (saved) {
        setResult(JSON.parse(saved));
      }
    }
  }, [location.state]);

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
        <div className="result-screen" style={{ paddingBottom: '150px', paddingLeft: '131px', paddingRight: '131px' }}>
          <h1 className="result-title">Hoàn thành xuất sắc!</h1>
          <div className="result-level">{result.level || 'Beginner'}</div>
          <p className="result-score">Điểm số: {result.score !== undefined && result.score !== null ? result.score : 0}/100</p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
            <button
              className="review-btn"
              onClick={() => navigate('/review', { state: { reviewData: result.reviewData || result.history || [] } })}
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
