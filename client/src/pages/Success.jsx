import React from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';

function Success() {
  const navigate = useNavigate();
  return (
    <div className="auth-page">
      <div className="logo" style={{ fontSize: '28px', justifyContent: 'flex-start', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>הקמפוס 🎓</div>
      <div className="container" style={{ textAlign: 'center', maxWidth: '500px' }}>
        <h1>פרטיך נקלטו בהצלחה!</h1>
        <p>ברוך הבא לקמפוס 🙂</p>
        <button className="primary-btn" onClick={() => navigate('/login')}>
          חזרה לעמוד הכניסה
        </button>
      </div>
    </div>
  );
}

export default Success;