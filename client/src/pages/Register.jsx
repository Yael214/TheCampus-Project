import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '', idNumber: '', age: '', gender: '', country: '', city: '',
    address: '', studyField: '', year: '', profileImage: null, studyApproval: null
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateRegister = () => {
    let tempErrors = {};
    if (!formData.fullName) tempErrors.fullName = "חובה להזין שם מלא";
    if (!formData.studyField) tempErrors.studyField = "חובה להזין תחום לימודים";
    
    if (!formData.idNumber) {
      tempErrors.idNumber = "חובה להזין תעודת זהות";
    } else if (!/^\d+$/.test(formData.idNumber) || formData.idNumber.length !== 9) {
      tempErrors.idNumber = "תעודת זהות חייבת להכיל 9 ספרות בדיוק";
    }

    if (!formData.studyApproval) tempErrors.studyApproval = "חובה להעלות אישור לימודים";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (validateRegister()) {
      navigate('/success');
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

        <label>העלאת תמונת פרופיל</label>
        <input type="file" name="profileImage" accept="image/*" onChange={handleInputChange} />

        <label><span className="required">*</span>אישור לימודים</label>
        <input type="file" name="studyApproval" className={errors.studyApproval ? 'input-error' : ''} onChange={handleInputChange} />
        {errors.studyApproval && <span className="error-msg">{errors.studyApproval}</span>}

        <button className="primary-btn" onClick={handleFinalSubmit}>סיום</button>
        <div style={{textAlign: 'center', marginTop: '10px'}}>
          <a onClick={() => navigate('/')} style={{cursor:'pointer', color:'#6B7280'}}>ביטול</a>
        </div>
      </div>
    </div>
  );
}

export default Register;