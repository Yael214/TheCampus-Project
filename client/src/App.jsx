import React, { useState } from 'react';
import './App.css';

function App() {
  // ניהול מסכים
  const [screen, setScreen] = useState('login');
  const [codeSent, setCodeSent] = useState(false);

  // נתוני הטופס - הוספנו אימייל וסיסמה
  const [formData, setFormData] = useState({
    fullName: '', idNumber: '', email: '', password: '', age: '', gender: '', 
    country: '', city: '', address: '', studyField: '', year: '', 
    profileImage: null, studyApproval: null
  });

  // ניהול שגיאות
  const [errors, setErrors] = useState({});

  // פונקציה לעדכון נתונים בזמן אמת
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
    
    // ניקוי שגיאה ברגע שמתחילים להקליד
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // בדיקת סיסמה חזקה (משמשת עכשיו רק לרישום)
  const isPasswordStrong = (pass) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pass);
  };

  // --- לוגיקת כניסה (Login) - הוסרה בדיקת התקינות, רק מעביר הלאה ---
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // כאן בעתיד נשלח את המייל והסיסמה לפיירבייס שיבדוק אם הם קיימים במערכת
    setScreen('feed');
  };

  // --- לוגיקת רישום (Register) - כאן בודקים הכל ---
  const validateRegister = () => {
    let tempErrors = {};
    
    if (!formData.fullName) tempErrors.fullName = "חובה להזין שם מלא";
    
    if (!formData.idNumber) {
      tempErrors.idNumber = "חובה להזין תעודת זהות";
    } else if (!/^\d+$/.test(formData.idNumber) || formData.idNumber.length !== 9) {
      tempErrors.idNumber = "תעודת זהות חייבת להכיל 9 ספרות בדיוק";
    }

    // בדיקת אימייל
    if (!formData.email) {
      tempErrors.email = "חובה להזין אימייל";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      tempErrors.email = "כתובת אימייל לא תקינה";
    }

    // בדיקת סיסמה
    if (!formData.password) {
      tempErrors.password = "חובה להזין סיסמה";
    } else if (!isPasswordStrong(formData.password)) {
      tempErrors.password = "הסיסמה חייבת לכלול לפחות 8 תווים, אות גדולה ומספר";
    }

    if (!formData.studyField) tempErrors.studyField = "חובה להזין תחום לימודים";
    if (!formData.studyApproval) tempErrors.studyApproval = "חובה להעלות אישור לימודים";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (validateRegister()) {
      setScreen('success');
    } else {
      window.scrollTo(0, 0); 
    }
  };

  return (
    <div className="App">
      
      {/* מסך 1 — כניסה */}
      {screen === 'login' && (
        <div className="auth-page">
          <div className="logo">הקמפוס 🎓</div>
          <div className="login-container">
            <form onSubmit={handleLoginSubmit}> 
              <h1>כניסה</h1>
              <label>שם משתמש (אימייל)</label>
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
      )}

      {/* מסך 3 — יצירת חשבון */}
      {screen === 'register' && (
        <div className="auth-page">
          <div className="logo">הקמפוס 🎓</div>
          <div className="container">
            <h1>יצירת חשבון</h1>
            
            <label><span className="required">*</span>שם מלא</label>
            <input type="text" name="fullName" className={errors.fullName ? 'input-error' : ''} onChange={handleInputChange} />
            {errors.fullName && <span className="error-msg">{errors.fullName}</span>}

            <label><span className="required">*</span>תעודת זהות</label>
            <input type="text" name="idNumber" maxLength="9" className={errors.idNumber ? 'input-error' : ''} onChange={handleInputChange} />
            {errors.idNumber && <span className="error-msg">{errors.idNumber}</span>}

            {/* --- שדות חדשים: אימייל וסיסמה --- */}
            <label><span className="required">*</span>אימייל</label>
            <input type="email" name="email" className={errors.email ? 'input-error' : ''} onChange={handleInputChange} />
            {errors.email && <span className="error-msg">{errors.email}</span>}

            <label><span className="required">*</span>סיסמה</label>
            <input type="password" name="password" className={errors.password ? 'input-error' : ''} onChange={handleInputChange} />
            {errors.password && <span className="error-msg">{errors.password}</span>}
            {/* ---------------------------------- */}

            <label>גיל</label>
            <input type="number" name="age" onChange={handleInputChange} />

            <label><span className="required">*</span>מגדר</label>
            <select name="gender" onChange={handleInputChange}>
              <option value="">בחר/י מגדר</option>
              <option value="זכר">זכר</option>
              <option value="נקבה">נקבה</option>
            </select>

            <label><span className="required">*</span>ארץ</label>
            <input type="text" name="country" onChange={handleInputChange} />
            
            <label><span className="required">*</span>עיר</label>
            <input type="text" name="city" onChange={handleInputChange} />

            <label><span className="required">*</span>תחום לימודים</label>
            <input type="text" name="studyField" className={errors.studyField ? 'input-error' : ''} onChange={handleInputChange} />
            {errors.studyField && <span className="error-msg">{errors.studyField}</span>}

            <label>העלאת תמונת פרופיל</label>
            <input type="file" name="profileImage" accept="image/*" onChange={handleInputChange} />

            <label><span className="required">*</span>אישור לימודים</label>
            <input type="file" name="studyApproval" className={errors.studyApproval ? 'input-error' : ''} onChange={handleInputChange} />
            {errors.studyApproval && <span className="error-msg">{errors.studyApproval}</span>}

            <button className="primary-btn" onClick={handleFinalSubmit}>סיום</button>
            <div style={{textAlign: 'center', marginTop: '10px'}}>
              <a onClick={() => setScreen('login')} style={{cursor:'pointer', color:'#6B7280'}}>ביטול</a>
            </div>
          </div>
        </div>
      )}
      
      {/* מסך איפוס סיסמה */}
      {screen === 'reset' && (
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
            <button className="primary-btn" onClick={() => {setScreen('login'); setCodeSent(false);}}>סיום</button>
          </div>
        </div>
      )}

      {/* מסך 4 — הצלחה */}
      {screen === 'success' && (
        <div className="auth-page">
          <div className="logo">הקמפוס 🎓</div>
          <div className="container" style={{textAlign: 'center'}}>
            <h1>פרטיך נקלטו בהצלחה!</h1>
            <p>ברוך הבא לקמפוס 🙂</p>
            <button className="primary-btn" onClick={() => setScreen('login')}>חזרה לעמוד הכניסה</button>
          </div>
        </div>
      )}

      {/* מסך 5 — הפיד */}
      {screen === 'feed' && (
        <div className="ss2">
          <div className="topbar">
            <div className="logo">הקמפוס 🎓</div>
            <div className="search-box"><input placeholder="חיפוש..." /></div>
          </div>
          <div className="main-content" style={{padding: '20px'}}>
            <h2>הפיד שלי</h2>
            <button className="primary-btn" style={{width: '150px'}} onClick={() => setScreen('login')}>התנתקות</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;