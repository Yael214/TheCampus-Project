import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {useImageHandler} from '../hooks/useImageHandler';
import AddressInput from '../components/AddressInput.jsx';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    fullName: '', idNumber: '', email: '', password: '', age: '', gender: '',
    isDiscoverable: false,
    address: '', studyField: '', year: '', phone: '',
    profileImage: null, studyApproval: null
  });
  const navigate = useNavigate();
  // Location object from the picked Google place: { geohash, lat, lng }. Stays null until the
  // user actually selects an address from the dropdown - free-typed text is not a valid location.
  const [location, setLocation] = useState(null);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();
  const { validateImage } = useImageHandler();

  // Called by AddressInput on every keystroke. We update the displayed text but clear the
  // saved location, because once the user starts typing again the previous selection is stale.
  const handleAddressTextChange = (text) => {
    setFormData(prev => ({ ...prev, address: text }));
    setLocation(null);
    if (errors.address) {
      setErrors(prev => ({ ...prev, address: null }));
    }
  };

  // Called by AddressInput when the user picks a valid place from the dropdown.
  const handleLocationSelected = ({ address, location: loc }) => {
    setFormData(prev => ({ ...prev, address }));
    setLocation(loc);
    if (errors.address) {
      setErrors(prev => ({ ...prev, address: null }));
    }
  };

  const handleInputChange = async (e) => {
    const { name, value, files, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;

    // Handling file inputs (Profile Image or Study Approval)
    if (files && files[0]) {
      let file = files[0];

      if (name === 'profileImage') {
        if (!validateImage(file)) {
          alert("Please select a valid image file (png, jpg, jpeg, webp).");
          return;
        }
      }

      finalValue = file;
    }

    // Save the input value (text or file) to the form data state
    setFormData(prev => ({ ...prev, [name]: finalValue }));

    // Reset the field error if it exists when the user changes the input
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
    // The address is only valid if the user actually picked a place from the dropdown
    // (so we have a real location object with geohash + coordinates).
    if (!location) {
      tempErrors.address = formData.address
        ? "יש לבחור כתובת חוקית מתוך הרשימה"
        : "חובה להזין כתובת";
    }
    if (!formData.phone) {
      tempErrors.phone = "חובה להזין מספר פלאפון";
    } else if (!/^0\d{9}$/.test(formData.phone)) {
      tempErrors.phone = "מספר פלאפון לא תקין (לדוגמה: 0501234567)";
    }
    if (!formData.studyField) tempErrors.studyField = "חובה להזין תחום לימודים";
    if (!formData.year) tempErrors.year = "חובה להזין שנת לימודים";
    if (!formData.studyApproval) {tempErrors.studyApproval = "חובה להעלות אישור לימודים";}
    else {
      if (formData.studyApproval.type !== "application/pdf")  {tempErrors.studyApproval = "ניתן להעלות רק קובץ PDF";}
      else if (formData.studyApproval && formData.studyApproval.size > 2 * 1024 * 1024) {tempErrors.studyApproval = "הקובץ גדול מדי (מקסימום 2MB)";}}
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (validateRegister()) {
      try {
        setIsSubmitting(true);
        // Send the form data plus the location object (geohash + coordinates) to signup.
        const submitData = {
          ...formData,
          location, // { geohash, lat, lng }
        };
        await signup(formData.email, formData.password, submitData);
        navigate('/success');
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
      <div className="logo" style={{ fontSize: '28px', justifyContent: 'flex-start', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>הקמפוס 🎓</div>
      <div className="container" style={{ maxWidth: '500px' }}>
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

        <label><span className="required">*</span>מספר פלאפון</label>
        <input type="tel" name="phone" className={errors.phone ? 'input-error' : ''} onChange={handleInputChange} placeholder="לדוגמה: 0501234567" />
        {errors.phone && <span className="error-msg">{errors.phone}</span>}

        <label>מגדר</label>
        <select name="gender" onChange={handleInputChange}>
          <option value="">בחר/י מגדר</option>
          <option value="זכר">זכר</option>
          <option value="נקבה">נקבה</option>
        </select>
          
        <label><span className="required">*</span>כתובת</label>
        <AddressInput
          name="address"
          value={formData.address}
          className={errors.address ? 'input-error' : ''}
          onTextChange={handleAddressTextChange}
          onLocationSelected={handleLocationSelected}
          error={errors.address}
        />
            
        <div style={{ width: '100%', marginBottom: '15px', direction: 'rtl', textAlign: 'right', display: 'block' }}>
          <div style={{ textAlign: 'right', width: '100%', display: 'block' }}>
            <input 
              type="checkbox" 
              name="isDiscoverable" 
              id="isDiscoverable" 
              checked={formData.isDiscoverable} 
              onChange={handleInputChange} 
              style={{ cursor: 'pointer', margin: '0 0 0 8px', display: 'inline-block', width: 'auto', verticalAlign: 'middle' }}
            />
            <label htmlFor="isDiscoverable" style={{ margin: 0, padding: 0, cursor: 'pointer', display: 'inline-block', width: 'auto', fontWeight: 'normal', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
              אישור שיתוף הכתובת שלי
            </label>
          </div>
          <small style={{ display: 'block', color: '#666', marginTop: '5px', fontSize: '12px', paddingRight: '22px', textAlign: 'right' }}>
            ניתן לשנות הגדרה זו בכל עת בעמוד חיפוש שותפים
          </small>
        </div>
        

        <label><span className="required">*</span>תחום לימודים</label>
        <input type="text" name="studyField" className={errors.studyField ? 'input-error' : ''} onChange={handleInputChange} />
        {errors.studyField && <span className="error-msg">{errors.studyField}</span>}

        <label><span className="required">*</span>שנת לימודים</label>
        <input type="text" name="year" className={errors.year ? 'input-error' : ''} onChange={handleInputChange} />
        {errors.year && <span className="error-msg">{errors.year}</span>}

        {/*only image formats*/}
        <label>העלאת תמונת פרופיל</label>
        <input type="file" name="profileImage" accept="image/*" onChange={handleInputChange} />

        {/*pdf and image formats*/}
        <label><span className="required">*</span>אישור לימודים</label>
        <input type="file" name="studyApproval" accept=".pdf" className={errors.studyApproval ? 'input-error' : ''} onChange={handleInputChange} />
        {errors.studyApproval && <span className="error-msg">{errors.studyApproval}</span>}

        {errors.server && <div className="error-msg" style={{ textAlign: 'center', marginBottom: '10px' }}>{errors.server}</div>}
        <button className="primary-btn" onClick={handleFinalSubmit} disabled={isSubmitting}>{isSubmitting ? 'נרשם...' : 'סיום'}</button>
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <Link to='/login' style={{ cursor: 'pointer', color: '#6B7280' }}>ביטול</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
