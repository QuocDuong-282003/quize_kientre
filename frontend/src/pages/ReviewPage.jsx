import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../App.css';

const ReviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reviewData } = location.state || {};

  console.log('ReviewPage received:', location.state);
  console.log('ReviewData:', reviewData);

  if (!reviewData || reviewData.length === 0) {
    return (
      <div className="app-container">
        <div className="header">
          <div className="header-title">Adaptive Quiz Platform</div>
        </div>
        <div className="main-content" style={{ padding: '40px', overflow: 'auto', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '18px', color: '#718096', marginBottom: '20px' }}>Không có dữ liệu để xem</p>
            <button
              onClick={() => navigate('/result')}
              style={{ padding: '10px 20px', background: '#29b6f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              ⬅ Quay lại bảng điểm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="header">
        <div className="header-title">Adaptive Quiz Platform</div>
      </div>
      <div className="main-content" style={{ padding: '40px', overflow: 'auto', flexDirection: 'column', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style>{`.main-content::-webkit-scrollbar { display: none; }`}</style>
        <button
          onClick={() => navigate('/result')}
          style={{ marginBottom: '20px', padding: '10px 20px', background: '#29b6f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', alignSelf: 'flex-start' }}
        >
          ⬅ Quay lại bảng điểm
        </button>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#2d3748' }}>Chi tiết bài làm</h2>

        {reviewData.map((item, index) => {
          const q = item.questionId;

          if (!q) {
            return (
              <div key={index} style={{ padding: '20px', marginBottom: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
                <p>Không thể tải dữ liệu câu hỏi {index + 1}</p>
              </div>
            );
          }

          return (
            <div
              key={index}
              style={{
                border: `2px solid ${item.isCorrect ? '#28a745' : '#dc3545'}`,
                padding: '20px',
                marginBottom: '20px',
                borderRadius: '8px',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ fontWeight: 'bold', color: '#004a99' }}>Câu {101 + index} (Độ khó: {item.difficulty}/5)</span>
                <span style={{ fontWeight: 'bold', color: item.isCorrect ? 'green' : 'red' }}>
                  {item.isCorrect ? ' ĐÚNG' : ' SAI'}
                </span>
              </div>
              <p style={{ fontSize: '18px', marginBottom: '15px', color: '#2d3748' }}>
                <strong>Câu hỏi:</strong> {q.content}
              </p>
              <div style={{ marginTop: '15px' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#2d3748' }}>Các lựa chọn:</p>
                {q.options && q.options.map((opt, optIndex) => {
                  const isUserSelected = item.selectedAnswerIds && item.selectedAnswerIds.includes(opt.id);
                  const isCorrectAnswer = q.correctAnswerIds && q.correctAnswerIds.includes(opt.id);

                  let bgColor = '#fff';
                  let borderColor = '#e0e0e0';
                  let label = '';

                  if (isCorrectAnswer) {
                    bgColor = '#d4edda';
                    borderColor = '#28a745';
                    label = ' ✓ (Đáp án đúng)';
                  }
                  if (isUserSelected && !isCorrectAnswer) {
                    bgColor = '#f8d7da';
                    borderColor = '#dc3545';
                    label = ' ✗ (Bạn chọn sai)';
                  }

                  return (
                    <div key={opt.id} style={{
                      padding: '12px',
                      margin: '8px 0',
                      border: `2px solid ${borderColor}`,
                      backgroundColor: bgColor,
                      borderRadius: '6px',
                      color: '#2d3748'
                    }}>
                      <strong>{String.fromCharCode(65 + optIndex)}.</strong> {opt.text}
                      <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewPage;
