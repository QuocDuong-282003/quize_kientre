import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import quizService from '../services/quiz';
import LoginModal from '../components/login/LoginModal';
import '../App.css';
import './StartPage.css';

const StartPage = () => {
  const navigate = useNavigate();
  const [loadingExamId, setLoadingExamId] = useState(null);
  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(true);
  const [examError, setExamError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState(null);
  const [guestWarning, setGuestWarning] = useState(false);

  const fetchExams = useCallback(async () => {
    try {
      setExamsLoading(true);
      const data = await quizService.getExams();
      setExams(data || []);
      setExamError('');
    } catch (err) {
      console.error(err);
      setExamError('Không tải được danh sách khóa thi');
    } finally {
      setExamsLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleStartExam = async (exam) => {
    if (loadingExamId && loadingExamId !== exam._id) return; // tránh song song nhiều yêu cầu

    if (!user) {
      setGuestWarning(true);
      setTimeout(() => setGuestWarning(false), 3000);
    }

    setLoadingExamId(exam._id);
    try {
      const data = await quizService.startQuiz(user?.userId || null, exam._id);
      navigate('/quiz', {
        state: {
          sessionId: data.sessionId,
          question: data.question,
          userId: user?.userId || null,
          examId: exam._id,
          examTitle: exam.title
        }
      });
    } catch (error) {
      alert('Không thể kết nối đến server. Vui lòng thử lại!');
      console.error(error);
      setLoadingExamId(null);
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

      <div className="main-content start-page-layout">
        <div className="exam-grid-shell">
          {examsLoading ? (
            <div className="exam-empty">Đang tải danh sách...</div>
          ) : exams.length === 0 ? (
            <div className="exam-empty-panel-full">
              <div className="exam-empty-content">
                <h2>Danh sách khóa thi</h2>
                <p>Không có khóa thi. Vui lòng tải lại hoặc vào trang Admin để thêm.</p>
              </div>
              <div className="exam-empty-actions-center">
                <button type="button" className="exam-btn-reload" onClick={fetchExams} disabled={examsLoading}>
                  {examsLoading ? 'Đang tải...' : 'Tải lại'}
                </button>
              </div>
              {examError && <p className="exam-error">{examError}</p>}
            </div>
          ) : (
            <div className="exam-grid">
              {exams.map((exam) => (
                <div key={exam._id} className="exam-card" onClick={() => handleStartExam(exam)} style={{ cursor: 'pointer' }}>
                  <div className="exam-cover" aria-hidden>
                    <div className="exam-icon">{exam.coverImage || ''}</div>
                    <div className="exam-title-large">{exam.title}</div>
                    <div className="exam-year">{new Date(exam.examDate).getFullYear()}</div>
                  </div>
                  <div className="exam-body">
                    <p className="exam-description">{exam.description || 'Bộ đề đánh giá nhanh với câu hỏi phân tầng độ khó.'}</p>

                    <div className="exam-stats">
                      <div className="stat-item">
                        <span className="stat-icon">?</span>
                        <span className="stat-value">{exam.questionCount || 10}</span>
                      </div>
                      {/* <div className="stat-item">
                        <span className="stat-icon">⏱</span>
                        <span className="stat-value">{exam.duration || 30} phút</span>
                      </div> */}
                    </div>
                    <div className="exam-tags">
                      {exam.tags && exam.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="tag">{tag}</span>
                      ))}
                    </div>

                    <button
                      className="exam-btn-start"
                      type="button"
                      disabled={loadingExamId === exam._id}
                    >
                      {loadingExamId === exam._id ? 'Đang tải...' : 'Vào ôn thi'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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

