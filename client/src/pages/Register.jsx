import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import imageCompression from 'browser-image-compression';

function Register({ setScreen }) {
  const [formData, setFormData] = useState({
    fullName: '', idNumber: '', email: '', password: '', age: '', gender: '',
    country: '', city: '', address: '', studyField: '', year: '',
    profileImage: null, studyApproval: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();
  const  handleInputChange = async (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      let file = files[0];

      if (file.type.startsWith('image/')) {
        const options = {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 1200,
          useWebWorker: true
        };
        try {
          file = await imageCompression(file, options);
        } catch (error) {
          console.error("Error compressing image:", error);
        }
      }
    }

    setFormData({ ...formData, [name]: files ? files[0] : value });

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const isPasswordStrong = (pass) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pass);
  };

  const validateRegister = () => {
    let tempErrors = {};
    if (!formData.fullName) tempErrors.fullName = "חובה להזין שם מלא";
    if (!formData.idNumber) {
      tempErrors.idNumber = "חובה להזין תעודת זהות";
    } else if (!/^\d+$/.test(formData.idNumber) || formData.idNumber.length !== 9) {
      tempErrors.idNumber = "תעודת זהות חייבת להכיל 9 ספרות בדיוק";
    }
    if (!formData.email) {
      tempErrors.email = "חובה להזין אימייל";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      tempErrors.email = "כתובת אימייל לא תקינה";
    }
    if (!formData.password) {
      tempErrors.password = "חובה להזין סיסמה";
    } else if (!isPasswordStrong(formData.password)) {
      tempErrors.password = "הסיסמה חייבת לכלול לפחות 8 תווים, אות גדולה, אות קטנה ומספר";
    }
    if (!formData.studyField) tempErrors.studyField = "חובה להזין תחום לימודים";
    if (!formData.studyApproval) tempErrors.studyApproval = "חובה להעלות אישור לימודים";
    if (formData.studyApproval && formData.studyApproval.size > 2 * 1024 * 1024) {tempErrors.studyApproval = "הקובץ גדול מדי (מקסימום 2MB)";}
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (validateRegister()) {
      try {
        setIsSubmitting(true);
        await signup(formData.email, formData.password, formData);
        setScreen('success');
      } catch (error) {
        console.error(error)
        setIsSubmitting(false);
        let message = "";

        switch (error.code) {
          case 'auth/email-already-in-use':
            message = "כתובת האימייל כבר תפוסה.";
            break;
          case 'auth/weak-password':
            message = "הסיסמה חלשה מדי.";
            break;
          case 'auth/network-request-failed':
            message = "בעיית תקשורת, בדקי את החיבור לאינטרנט.";
            break;
          default:
            message = "שגיאה: " + error.message;
        }
        setErrors({ server: message });
      }

    } else {
      window.scrollTo(0, 0);
    }
  };

  return (
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

        <label><span className="required">*</span>אימייל</label>
        <input type="email" name="email" className={errors.email ? 'input-error' : ''} onChange={handleInputChange} />
        {errors.email && <span className="error-msg">{errors.email}</span>}

        <label><span className="required">*</span>סיסמה</label>
        <input type="password" name="password" className={errors.password ? 'input-error' : ''} onChange={handleInputChange} />
        {errors.password && <span className="error-msg">{errors.password}</span>}

        <label>גיל</label>
        <input type="number" name="age" onChange={handleInputChange} />

        <label>מגדר</label>
        <select name="gender" onChange={handleInputChange}>
          <option value="">בחר/י מגדר</option>
          <option value="זכר">זכר</option>
          <option value="נקבה">נקבה</option>
        </select>

        <label>ארץ</label>
        <input type="text" name="country" onChange={handleInputChange} />

        <label>עיר</label>
        <input type="text" name="city" onChange={handleInputChange} />

        <label><span className="required">*</span>תחום לימודים</label>
        <input type="text" name="studyField" className={errors.studyField ? 'input-error' : ''} onChange={handleInputChange} />
        {errors.studyField && <span className="error-msg">{errors.studyField}</span>}

        {/*only image formats*/}
        <label>העלאת תמונת פרופיל</label>
        <input type="file" name="profileImage" accept="image/*" onChange={handleInputChange} />
        
        {/*pdf and image formats*/}
        <label><span className="required">*</span>אישור לימודים</label>
        <input type="file" name="studyApproval" accept=".pdf, image/*" className={errors.studyApproval ? 'input-error' : ''} onChange={handleInputChange} />
        {errors.studyApproval && <span className="error-msg">{errors.studyApproval}</span>}

        {errors.server && <div className="error-msg" style={{ textAlign: 'center', marginBottom: '10px' }}>{errors.server}</div>}
        <button className="primary-btn" onClick={handleFinalSubmit} disabled={isSubmitting}>{isSubmitting ? 'נרשם...' : 'סיום'}</button>
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <a onClick={() => setScreen('login')} style={{ cursor: 'pointer', color: '#6B7280' }}>ביטול</a>
        </div>
      </div>
    </div>
  );
}

export default Register;