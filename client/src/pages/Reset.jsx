import React, { useState } from 'react';

function Reset({ setScreen }) {
  const [codeSent, setCodeSent] = useState(false);

  return (
    <div className="auth-page">
      <div className="logo" style={{ fontSize: '28px', justifyContent: 'flex-start', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>הקמפוס 🎓</div>
      <div className="container" style={{ maxWidth: '500px' }}>
        <h1>איפוס סיסמה</h1>
        <label>הכנס/י כתובת מייל לקבלת קוד אימות</label>
        <input type="email" placeholder="example@mail.com" />
        
        {!codeSent && (
          <button className="primary-btn" onClick={() => setCodeSent(true)}>שלח קוד אימות</button>
        )}
        
        <label style={{marginTop: '16px'}}>הכנס/י את קוד האימות שהתקבל</label>
        <input type="text" placeholder="הקלד/י את הקוד" />
        
        <button className="primary-btn" onClick={() => { setScreen('login'); setCodeSent(false); }}>
          סיום
        </button>
      </div>
    </div>
  );
}

export default Reset;