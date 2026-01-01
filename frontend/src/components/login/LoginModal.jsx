import React, { useState, useRef } from 'react';
import authService from '../../services/auth';
import './LoginModal.css';

const LoginModal = ({ onLoginSuccess, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passwordInputRef = useRef(null);
    const confirmPasswordInputRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isLogin && password !== confirmPassword) {
            setError('Mật khẩu không trùng khớp!');
            return;
        }

        setLoading(true);

        try {
            const data = isLogin
                ? await authService.login(email, password)
                : await authService.register(email, password);

            if (data.success) {
                if (isLogin) {
                    onLoginSuccess(data);
                    onClose();
                } else {
                    alert(' Đăng ký thành công! Vui lòng đăng nhập.');
                    setIsLogin(true);
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const toggleLogin = () => {
        setIsLogin(!isLogin);
        setError('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    const handlePasswordToggle = (setShowPass, currentValue) => {
        setShowPass(!currentValue);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <button onClick={onClose} className="modal-close">
                    ✕
                </button>

                <h2 className="modal-title">
                    {isLogin ? ' Đăng Nhập' : ' Đăng Ký'}
                </h2>
                <p className="modal-subtitle">
                    {isLogin ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
                </p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            placeholder="Nhập email của bạn"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="auth-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Mật khẩu</label>
                        <div className="password-input-wrapper">
                            <input
                                ref={passwordInputRef}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Nhập mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="auth-input"
                                style={{ paddingRight: '45px' }}
                            />
                            <span
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowPassword(!showPassword);
                                }}
                                className="password-toggle-icon"
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setShowPassword(!showPassword);
                                    }
                                }}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </span>
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <label className="form-label">Nhập lại mật khẩu</label>
                            <div className="password-input-wrapper">
                                <input
                                    ref={confirmPasswordInputRef}
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Xác nhận mật khẩu"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="auth-input"
                                    style={{ paddingRight: '45px' }}
                                />
                                <span
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowConfirmPassword(!showConfirmPassword);
                                    }}
                                    className="password-toggle-icon"
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setShowConfirmPassword(!showConfirmPassword);
                                        }
                                    }}
                                >
                                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                </span>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="submit-button"
                    >
                        {loading
                            ? ' Đang xử lý...'
                            : isLogin
                                ? 'Đăng Nhập'
                                : 'Đăng Ký'}
                    </button>
                </form>

                <div className="toggle-mode">
                    <span>
                        {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                    </span>
                    <span onClick={toggleLogin} className="toggle-link">
                        {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
