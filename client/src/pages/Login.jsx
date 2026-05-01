import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const isPasswordStrong = (pass) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pass);
  };

  const validateLogin = (e) => {
    e.preventDefault();
    const password = e.target.password.value;

    if (!isPasswordStrong(password)) {
      setErrors({ loginPassword: "סיסמה לא תקינה (חייבת לכלול לפחות 8 תווים, אות גדולה ומספר)" });
    } else {
      setErrors({});
      navigate('/feed');
    }
  };

  return (
    <div className="auth-page">
      <div className="logo">הקמפוס 🎓</div>
      <div className="login-container">
        <form onSubmit={validateLogin}> 
          <h1>כניסה</h1>
          <label>שם משתמש</label>
          <input type="text" placeholder="הקלד/י שם משתמש" required />
          
          <label>סיסמה</label>
          <input 
            type="password" 
            name="password" 
            placeholder="הקלד/י סיסמה" 
            className={errors.loginPassword ? 'input-error' : ''} 
            required 
          />
          {errors.loginPassword && <span className="error-msg">{errors.loginPassword}</span>}

          <div className="forgot-password">
            <a onClick={() => navigate('/reset')}>לא זוכר את הסיסמה?</a>
          </div>
          
          <button className="primary-btn" type="submit">התחברות</button>
          
          <div className="secondary-text">
            סטודנט חדש? <a onClick={() => navigate('/register')}>צור חשבון</a>
          </div>
          
          <div className="guest-link">
            <a onClick={() => navigate('/feed')}>מצב אורח</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;