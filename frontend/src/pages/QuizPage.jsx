import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import quizService from '../services/quiz';
import QuizContent from '../components/ui/QuizContent';
import QuizSidebar from '../components/ui/QuizSidebar';
import '../App.css';
import './QuizPage.css';

const QuizPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionId, question: initialQuestion, userId } = location.state || {};

  const [question, setQuestion] = useState(initialQuestion);
  const [selectedIds, setSelectedIds] = useState([]);
  const [progress, setProgress] = useState(0);
  const [timer, setTimer] = useState("00:00");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  // Timer
  useEffect(() => {
    let sec = 0;
    const interval = setInterval(() => {
      sec++;
      const m = Math.floor(sec / 60).toString().padStart(2, '0');
      const s = (sec % 60).toString().padStart(2, '0');
      setTimer(`${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden && !isSubmitting && sessionId) {
        console.warn(' User switched tab - Auto submitting quiz');
        setIsSubmitting(true);

        setWarningMessage(' Phát hiện chuyển tab! Bài thi sẽ bị nộp sau 3 giây...');
        setShowWarning(true);

        await new Promise(resolve => setTimeout(resolve, 3000));

        try {
          const data = await quizService.submitAnswer(
            sessionId,
            question._id,
            selectedIds,
            'tab_switch'
          );

          navigate('/result', {
            state: {
              result: data,
              warning: 'Bài thi đã bị nộp do bạn chuyển sang tab khác!'
            }
          });
        } catch (error) {
          console.error('Auto submit failed:', error);
          alert(' Phát hiện gian lận! Bài thi sẽ bị nộp.');
          navigate('/');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sessionId, question, selectedIds, isSubmitting, navigate]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Bạn có chắc muốn rời khỏi? Bài thi sẽ bị hủy!';
      return 'Bạn có chắc muốn rời khỏi? Bài thi sẽ bị hủy!';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const handleMouseLeave = () => {
      if (isSubmitting) return;

      const newCount = warningCount + 1;
      setWarningCount(newCount);

      if (newCount === 1) {
        setWarningMessage('CẢNH BÁO: Không di chuyển chuột ra khỏi màn hình!');
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 4000);
      } else if (newCount === 2) {
        setWarningMessage(' CẢNH BÁO LẦN 2: Vi phạm lần nữa sẽ bị nộp bài!');
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 5000);
      } else if (newCount >= 3) {
        setWarningMessage(' VI PHẠM LẦN 3: Bài thi sẽ bị nộp ngay!');
        setShowWarning(true);
        setIsSubmitting(true);

        setTimeout(async () => {
          try {
            const data = await quizService.submitAnswer(
              sessionId,
              question._id,
              selectedIds,
              'mouse_leave_violation'
            );

            navigate('/result', {
              state: {
                result: data,
                warning: 'Bài thi đã bị nộp do di chuyển chuột ra ngoài quá 3 lần!'
              }
            });
          } catch (error) {
            console.error('Auto submit failed:', error);
            navigate('/');
          }
        }, 2000);
      }

      console.warn(` Mouse left window - Warning count: ${newCount}`);
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [warningCount, sessionId, question, selectedIds, isSubmitting, navigate]);

  const handleNext = async () => {
    if (selectedIds.length === 0) {
      alert(" Vui lòng chọn ít nhất một đáp án trước khi tiếp tục!");
      return;
    }

    setLoading(true);
    try {
      const data = await quizService.submitAnswer(
        sessionId,
        question._id,
        selectedIds
      );

      if (data.isFinished) {
        navigate('/result', { state: { result: data } });
      } else {
        setQuestion(data.nextQuestion);
        setProgress(data.progress);
        setSelectedIds([]);
      }
    } catch (error) {
      alert(" Có lỗi xảy ra. Vui lòng thử lại!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishEarly = async () => {
    if (isSubmitting) return;

    const confirmFinish = window.confirm('Bạn chắc chắn muốn nộp bài sớm?');
    if (!confirmFinish) return;

    setIsSubmitting(true);
    try {
      const data = await quizService.submitAnswer(
        sessionId,
        question._id,
        selectedIds,
        'user_finish_early',
        true
      );

      navigate('/result', {
        state: {
          result: data,
          warning: 'Bạn đã nộp bài sớm.'
        }
      });
    } catch (error) {
      console.error('Finish early failed:', error);
      alert('Nộp bài sớm thất bại, vui lòng thử lại.');
      setIsSubmitting(false);
    }
  };

  if (!question) return <div>Đang tải...</div>;

  return (
    <div className="app-container">
      {showWarning && (
        <div className={`warning-banner level-${Math.min(warningCount, 3)}`}>
          {/* <div className="warning-icon">
            {warningCount >= 3 ? '🚫' : warningCount === 2 ? '🚨' : '⚠️'}
          </div> */}
          <div>{warningMessage}</div>
          {warningCount < 3 && (
            <div className="warning-counter">
              Số lần vi phạm: {warningCount}/3
            </div>
          )}
        </div>
      )}

      <div className="header">
        <div className="header-title">Adaptive Quiz Platform</div>
        <button className="exit-btn" onClick={() => navigate('/')}>
          Thoát
        </button>
      </div>

      <div className="main-content">
        <QuizContent
          question={question}
          progress={progress}
          selectedIds={selectedIds}
          onSelect={setSelectedIds}
          loading={loading || isSubmitting}
        />
        <QuizSidebar
          progress={progress}
          timer={timer}
          onSubmit={handleNext}
          onFinishEarly={handleFinishEarly}
          loading={loading || isSubmitting}
        />
      </div>

      {/* Hiển thị số lần vi phạm  */}
      {warningCount > 0 && (
        <div className={`violation-badge ${warningCount >= 2 ? 'high' : 'low'}`}>
          Vi phạm: {warningCount}/3
        </div>
      )}
    </div>
  );
};

export default QuizPage;
