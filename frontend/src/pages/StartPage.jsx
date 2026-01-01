import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import quizService from '../services/quiz';
import LoginModal from '../components/login/LoginModal';
import '../App.css';
import './StartPage.css';

const StartPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState(null);
  const [guestWarning, setGuestWarning] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleStart = async () => {
    if (!user) {
      setGuestWarning(true);
      setTimeout(() => setGuestWarning(false), 3000);
    }

    setLoading(true);
    try {
      const data = await quizService.startQuiz(user?.userId || null);
      navigate('/quiz', {
        state: {
          sessionId: data.sessionId,
          question: data.question,
          userId: user?.userId || null
        }
      });
    } catch (error) {
      alert('Không thể kết nối đến server. Vui lòng thử lại!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <div className="app-container">
      <div className="header">
        <div className="header-title">Adaptive Quiz Platform</div>
        <div className="header-user-section">
          {user ? (
            <>
              <div className="user-info-container">
                <span className="user-icon">👤</span>
                <span className="user-email">{user.email}</span>
              </div>
              <button onClick={handleLogout} className="logout-button">
                Đăng Xuất
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="login-button"
            >
              Đăng Nhập
            </button>
          )}
        </div>
      </div>

      {guestWarning && (
        <div className="guest-warning">
          Bạn chưa đăng nhập. Lịch sử làm bài sẽ không được lưu!
        </div>
      )}

      <div className="main-content">
        <div className="start-screen">
          <div className="start-icon">🧠</div>
          <h1 className="start-title">Kiểm tra trình độ thích ứng</h1>
          <p className="start-subtitle">
            Hệ thống sẽ tự động điều chỉnh độ khó của câu hỏi<br />
            dựa trên khả năng của bạn để đánh giá chính xác nhất
          </p>
          {user && (
            <p className="saved-history-notice">
              Lịch sử làm bài sẽ được lưu lại
            </p>
          )}
          <button
            className="start-btn"
            onClick={handleStart}
            disabled={loading}
          >
            {loading ? ' Đang tải...' : ' Bắt đầu ngay'}
          </button>
        </div>
      </div>

      {showLoginModal && (
        <LoginModal
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
};

export default StartPage;

