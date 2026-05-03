import React from 'react';

function Login({ setScreen }) {
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // כאן בעתיד נשלח את המייל והסיסמה לפיירבייס שיבדוק אם הם קיימים במערכת
    setScreen('feed');
  };

  return (
    <div className="auth-page">
      <div className="logo">הקמפוס 🎓</div>
      <div className="login-container">
        <form onSubmit={handleLoginSubmit}>
          <h1>כניסה</h1>
          <label>אימייל</label>
          <input type="email" placeholder="הקלד/י אימייל" required />
          
          <label>סיסמה</label>
          <input type="password" placeholder="הקלד/י סיסמה" required />

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