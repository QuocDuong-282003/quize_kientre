import React, { useState } from 'react';
import axios from 'axios';

const LoginView = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            onLoginSuccess(res.data);
        } catch (err) { alert("Lỗi đăng nhập"); }
    };

    return (
        <div className="login-screen">
            <div className="login-box">
                <h2>Đăng nhập / Đăng ký</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="auth-input"
                    />
                    <input
                        type="password"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="auth-input"
                    />
                    <button type="submit">VÀO THI</button>
                </form>
            </div>
        </div>
    );
};
export default LoginView;