import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase/config';
import { sendPasswordResetEmail } from 'firebase/auth';

function Reset() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  // Core function to handle the password reset API request
  const sendResetRequest = async (targetEmail) => {
    if (!targetEmail) {
      setError('אנא הכנס/י כתובת אימייל');
      return;
    }

    try {
      setError('');
      setMessage('');
      setLoading(true);

      // Firebase core password reset logic
      await sendPasswordResetEmail(auth, targetEmail);
      
      setMessage('קישור לאיפוס הסיסמה נשלח לתיבת המייל שלך. בדוק/י גם בתיקיית הספאם.');
      setEmailSent(true);

    } catch (err) {
      console.error("Password reset error:", err);
      
      // Catch network connection issues or common Firebase Auth errors
      if (err.code === 'auth/network-request-failed') {
        setError('אירעה שגיאת רשת. אנא בדוק/י את החיבור לאינטרנט ונסה/י שוב.');
      } else if (err.code === 'auth/user-not-found') {
        setError('לא נמצא משתמש עם כתובת אימייל זו.');
      } else if (err.code === 'auth/invalid-email') {
        setError('כתובת האימייל אינה תקינה.');
      } else {
        setError('אירעה שגיאה בשליחת המייל. אנא נסה/י שוב מאוחר יותר.');
      }
    } finally {
      // Always release the loading state even if an error occurs
      setLoading(false);
    }
  };

  // Handles the initial form submission
  const handleFirstSubmit = (e) => {
    e.preventDefault();
    sendResetRequest(email);
  };

  // Handles the "Resend" button click safely without form events
  const handleResend = () => {
    sendResetRequest(email);
  };

  return (
    <div className="auth-page">
      <div className="logo" style={{ fontSize: '28px', justifyContent: 'flex-start', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
        הקמפוס 🎓
      </div>
      <div className="container" style={{ maxWidth: '500px' }}>
        <h1>איפוס סיסמה</h1>
        
        {/* Status and Error Alert Messages */}
        {error && <div className="alert alert-danger" style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}
        {message && <div className="alert alert-success" style={{ color: 'green', marginBottom: '15px', textAlign: 'center' }}>{message}</div>}

        {!emailSent ? (
          // Step 1: Initial Email Input Form
          <form onSubmit={handleFirstSubmit}>
            <label>הכנס/י כתובת מייל לקבלת קישור לאיפוס</label>
            <input 
              type="email" 
              placeholder="example@mail.com" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            
            <button 
              type="submit" 
              className="primary-btn" 
              disabled={loading}
              style={{ marginTop: '16px', width: '100%' }}
            >
              {loading ? 'שולח...' : 'שלח קישור לאיפוס סיסמה'}
            </button>
          </form>
        ) : (
          // Step 2: Confirmation UI and Resend Action
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ marginBottom: '15px' }}>המייל נשלח אל: <strong>{email}</strong></p>
            <p style={{ color: '#666', marginBottom: '10px' }}>לא קיבלת את המייל?</p>
            
            <button 
              type="button"
              className="primary-btn" 
              onClick={handleResend} 
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '12px', 
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '5px',
                backgroundColor: '#4A90E2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {loading ? 'שולח שוב...' : 'לא קיבלתי, שלח לי שוב'}
            </button>
          </div>
        )}

        {/* Navigation Link back to Login */}
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <Link to="/login" style={{ textDecoration: 'none', color: '#4A90E2', fontWeight: '500' }}>חזרה למסך התחברות</Link>
        </div>
      </div>
    </div>
  );
}

export default Reset;