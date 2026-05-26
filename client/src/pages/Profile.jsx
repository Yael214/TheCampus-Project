import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../hooks/useUserData';
import { doc, updateDoc } from "firebase/firestore";
import { db } from '../firebase/config';
import Loader from '../components/Loader';
import AddressInput from '../components/AddressInput.jsx'; 

function Profile() {
    const { currentUser } = useAuth();
    const targetUserId = currentUser?.uid;
    const { userData: cloudData, loading: dataLoading } = useUserData(targetUserId);

    const [tempData, setTempData] = useState({});
    const [tempLocation, setTempLocation] = useState(null); //save the new location
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [savedData, setSavedData] = useState(null);
    const [addressError, setAddressError] = useState(null); 

    const display = isEditing ? tempData : (savedData || cloudData);

    const handleStartEdit = () => {
        setTempData({ ...display });
        setTempLocation(display.location || null); 
        setAddressError(null);
        setIsEditing(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTempData(prev => ({ ...prev, [name]: value }));
    };

    // valid location edit
    const handleAddressTextChange = (text) => {
        setTempData(prev => ({ ...prev, address: text }));
        setTempLocation(null); 
        setAddressError(null);
    };

    
    const handleLocationSelected = ({ address, location: loc }) => {
        setTempData(prev => ({ ...prev, address }));
        setTempLocation(loc); // { geohash, lat, lng }
        setAddressError(null);
    };

    const handleSave = async () => {
        if (!targetUserId) return;

       
        if (tempData.address && !tempLocation) {
            setAddressError("יש לבחור כתובת חוקית מתוך הרשימה");
            return;
        }

        try {
            setLoading(true);
            
            // update firestore
            await updateDoc(doc(db, "users", targetUserId), {
                age: tempData.age || '',
                year: tempData.year || '',
                studyField: tempData.studyField || '',
                about: tempData.about || '',
                phone: tempData.phone || '', // שמירת הטלפון החדש
                address: tempData.address || '', // שמירת הכתובת החדשה בתור טקסט
                location: tempLocation || null // שמירת המפה הגיאוגרפית (powers nearby-users)
            });

            setSavedData({ 
                ...cloudData, 
                ...tempData, 
                location: tempLocation 
            });
            setIsEditing(false);
        } catch (error) {
            console.error("שגיאה בעדכון:", error);
            alert("שגיאה בעדכון הפרופיל.");
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading) return <Loader text="טוען פרופיל... 🎓" />;
    if (!cloudData) return (
        <div style={{ textAlign: 'center', padding: '60px', fontFamily: 'Heebo, sans-serif' }}>
            <h2>המשתמש לא נמצא</h2>
        </div>
    );

    return (
        <main className="flex-1 overflow-y-auto" dir="rtl" style={{ padding: '24px 32px', fontFamily: 'Heebo, sans-serif', backgroundColor: '#F0F2FA' }}>
            <div style={card}>

                <h2 style={{ color: '#2C3E7A', fontSize: '22px', fontWeight: '800', margin: '0 0 20px 0' }}>
                    הפרופיל שלי
                </h2>

                {/* about */}
                <div style={sectionTitle}>קצת על עצמי</div>
                <div style={{ marginTop: '10px' }}>
                    {isEditing ? (
                        <textarea
                            name="about"
                            value={tempData.about || ''}
                            onChange={handleInputChange}
                            placeholder="תחביבים, תחומי עניין, על מה תרצה/י לשתף..."
                            rows={3}
                            style={{ ...inputStyle, resize: 'vertical', width: '100%' }}
                        />
                    ) : (
                        <p style={{ color: display.about ? '#1A1A2E' : '#9CA3AF', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
                            {display.about || 'לחצ/י על עריכת פרופיל כדי לספר על עצמך...'}
                        </p>
                    )}
                </div>

                <div style={divider} />

                {/* details */}
                <div style={grid}>
                    <Field label="שם מלא" value={cloudData.fullName} />
                    <Field label="תעודת זהות" value={cloudData.idNumber} />
                    <Field label="אימייל" value={currentUser?.email} />
                    <Field label="מגדר" value={cloudData.gender} />
                </div>

                <div style={divider} />

                {/* Additional details  */}
                <div style={sectionTitle}>פרטים נוספים</div>
                <div style={{ ...grid, marginTop: '12px' }}>
                    <EditableField label="גיל" name="age" value={display.age} isEditing={isEditing} onChange={handleInputChange} />
                    <EditableField label="תחום לימודים" name="studyField" value={display.studyField} isEditing={isEditing} onChange={handleInputChange} />
                    <EditableField label="שנת לימודים" name="year" value={display.year} isEditing={isEditing} onChange={handleInputChange} />
                    
                    {/* phone */}
                    <EditableField label="מספר טלפון" name="phone" value={display.phone} isEditing={isEditing} onChange={handleInputChange} type="tel" />
                    
                    {/* address by Google Places */}
                    <div>
                        <label style={labelStyle}>כתובת</label>
                        {isEditing ? (
                            <AddressInput
                                name="address"
                                value={tempData.address}
                                className={inputStyle}
                                onTextChange={handleAddressTextChange}
                                onLocationSelected={handleLocationSelected}
                                error={addressError}
                            />
                        ) : (
                            <p style={contentStyle}>{display.address || '—'}</p>
                        )}
                    </div>
                </div>

                {/* Buttons */}
                <div style={{ marginTop: '28px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    {isEditing ? (
                        <>
                            <button onClick={handleSave} disabled={loading} style={primaryBtn}>
                                {loading ? 'שומר...' : 'שמור שינויים'}
                            </button>
                            <button onClick={() => setIsEditing(false)} style={secondaryBtn}>ביטול</button>
                        </>
                    ) : (
                        <button onClick={handleStartEdit} style={primaryBtn}>עריכת פרופיל</button>
                    )}
                </div>

            </div>
        </main>
    );
}

const Field = ({ label, value }) => (
    <div>
        <label style={labelStyle}>{label}</label>
        <p style={contentStyle}>{value || '—'}</p>
    </div>
);

const EditableField = ({ label, name, value, isEditing, onChange, type = "text" }) => (
    <div>
        <label style={labelStyle}>{label}</label>
        {isEditing ? (
            <input type={type} name={name} value={value || ''} onChange={onChange} style={inputStyle} />
        ) : (
            <p style={contentStyle}>{value || '—'}</p>
        )}
    </div>
);

const card = { background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' };
const grid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const divider = { height: '1px', backgroundColor: '#F3F4F6', margin: '20px 0' };
const sectionTitle = { fontSize: '13px', fontWeight: '700', color: '#6B7280' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '700', color: '#6B7280', marginBottom: '4px' };
const contentStyle = { fontSize: '15px', color: '#1A1A2E', fontWeight: '500', margin: 0 };
const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', fontFamily: 'Heebo, sans-serif', boxSizing: 'border-box' };
const primaryBtn = { backgroundColor: '#4F46E5', color: 'white', padding: '10px 28px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', fontFamily: 'Heebo, sans-serif' };
const secondaryBtn = { backgroundColor: 'white', color: '#4B5563', padding: '10px 28px', border: '1px solid #D1D5DB', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', fontFamily: 'Heebo, sans-serif' };

export default Profile;