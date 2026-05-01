import React from 'react';
import { useNavigate } from 'react-router-dom';

function Success() {
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <div className="logo">הקמפוס 🎓</div>
      <div className="container" style={{textAlign: 'center'}}>
        <h1>פרטיך נקלטו בהצלחה!</h1>
        <p>ברוך הבא לקמפוס 🙂</p>
        <button className="primary-btn" onClick={() => navigate('/')}>חזרה לעמוד הכניסה</button>
      </div>
    </div>
  );
}

export default Success;