import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Reset() {
  const navigate = useNavigate();
  const [codeSent, setCodeSent] = useState(false);

  return (
    <div className="auth-page">
      <div className="logo">הקמפוס 🎓</div>
      <div className="container">
        <h1>איפוס סיסמה</h1>
        <label>הכנס/י כתובת מייל לקבלת קוד אימות</label>
        <input type="email" placeholder="example@mail.com" />
        {!codeSent && (
          <button className="primary-btn" onClick={() => setCodeSent(true)}>שלח קוד אימות</button>
        )}
        <label style={{marginTop: '16px'}}>הכנס/י את קוד האימות שהתקבל</label>
        <input type="text" placeholder="הקלד/י את הקוד" />
        <button className="primary-btn" onClick={() => navigate('/')}>סיום</button>
      </div>
    </div>
  );
}

export default Reset;