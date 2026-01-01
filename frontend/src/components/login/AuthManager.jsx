import React, { useState } from 'react';
import LoginView from './views/LoginView';
import QuizManager from './QuizManager';

const AuthManager = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

    const handleLogin = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.reload();
    };

    if (!user) return <LoginView onLoginSuccess={handleLogin} />;

    return <QuizManager user={user} onLogout={handleLogout} />;
};

export default AuthManager;