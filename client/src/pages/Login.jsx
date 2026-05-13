import React from 'react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';


function Login({ setScreen }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      setScreen('feed');
    } catch (error) {
      console.error("Login failed:", error);
      alert("התחברות נכשלה. אנא בדוק את הפרטים ונסה שוב.");
    }

  };

  return (
    <div className="auth-page">
      <div className="logo">הקמפוס 🎓</div>
      <div className="login-container">
        <form onSubmit={handleLoginSubmit}>
          <h1>כניסה</h1>
          <label>אימייל</label>
          <input type="email" placeholder="הקלד/י אימייל" required value={email} onChange={(e) => setEmail(e.target.value)} />

          <label>סיסמה</label>
          <input type="password" placeholder="הקלד/י סיסמה" required value={password} onChange={(e) => setPassword(e.target.value)} />

          <div className="forgot-password">
            <a onClick={() => setScreen('reset')}>לא זוכר את הסיסמה?</a>
          </div>

          <button className="primary-btn" type="submit">התחברות</button>

          <div className="secondary-text">
            סטודנט חדש? <a onClick={() => setScreen('register')}>צור חשבון</a>
          </div>

          <div className="guest-link">
            <a onClick={() => setScreen('feed')}>מצב אורח</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;