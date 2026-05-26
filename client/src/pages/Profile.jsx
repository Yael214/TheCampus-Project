import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../hooks/useUserData';
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, storage } from '../firebase/config';
import { ref, deleteObject } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import AddressInput from '../components/AddressInput';

function Profile() {
    const { currentUser } = useAuth();
    const targetUserId = currentUser?.uid;
    const { userData: cloudData, loading: dataLoading } = useUserData(targetUserId);
    const navigate = useNavigate();

    const [tempData, setTempData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [savedData, setSavedData] = useState(null);

    // Address-specific state for edit mode
    const [addressLocation, setAddressLocation] = useState(null);
    const [addressError, setAddressError] = useState('');

    // Delete account state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [deleteSuccess, setDeleteSuccess] = useState(false);

    const display = isEditing ? tempData : (savedData || cloudData);

    const handleStartEdit = () => {
        setTempData({ ...display });
        setAddressLocation((savedData || cloudData)?.location || null);
        setAddressError('');
        setIsEditing(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTempData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressTextChange = (text) => {
        setTempData(prev => ({ ...prev, address: text }));
        setAddressLocation(null);
        if (addressError) setAddressError('');
    };

    const handleLocationSelected = ({ address, location }) => {
        setTempData(prev => ({ ...prev, address }));
        setAddressLocation(location);
        if (addressError) setAddressError('');
    };

    const handleSave = async () => {
        if (!targetUserId) return;

        if (tempData.address && !addressLocation) {
            setAddressError('יש לבחור כתובת חוקית מתוך הרשימה');
            return;
        }

        try {
            setLoading(true);
            const updates = {
                age: tempData.age || '',
                year: tempData.year || '',
                studyField: tempData.studyField || '',
                about: tempData.about || '',
                phone: tempData.phone || '',
                address: tempData.address || '',
            };
            if (addressLocation) {
                updates.location = addressLocation;
            }
            await updateDoc(doc(db, "users", targetUserId), updates);
            setSavedData({ ...cloudData, ...tempData, ...(addressLocation ? { location: addressLocation } : {}) });
            setIsEditing(false);
        } catch (error) {
            console.error("שגיאה בעדכון:", error);
            alert("שגיאה בעדכון הפרופיל.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setAddressError('');
    };

    const handleDeleteAccount = async () => {
        if (!currentUser || !cloudData) return;
        setDeleteLoading(true);
        setDeleteError('');
        try {
            // מחיקת קבצים מ-Storage לפי הקישורים האמיתיים שמאוחסנים ב-Firestore
            const fileUrls = [cloudData.profileImage, cloudData.studyApproval].filter(Boolean);
            await Promise.allSettled(
                fileUrls.map(url => deleteObject(ref(storage, url)))
            );

            // מחיקת document מ-Firestore (כולל כל פרטי המשתמש)
            await deleteDoc(doc(db, "users", currentUser.uid));

            // מחיקת חשבון מ-Firebase Auth (אחרון — כי לאחר מכן אין הרשאות)
            await currentUser.delete();

            setDeleteSuccess(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (error) {
            if (error.code === 'auth/requires-recent-login') {
                setDeleteError('לצורך אבטחה, יש להתנתק ולהתחבר מחדש לפני מחיקת החשבון.');
            } else {
                setDeleteError('אירעה שגיאה במחיקת החשבון. נסה/י שוב.');
                console.error(error);
            }
        } finally {
            setDeleteLoading(false);
            setShowDeleteConfirm(false);
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
                        <p style={{ color: display?.about ? '#1A1A2E' : '#9CA3AF', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
                            {display?.about || 'לחצ/י על עריכת פרופיל כדי לספר על עצמך...'}
                        </p>
                    )}
                </div>

                <div style={divider} />

                {/* Permanent details */}
                <div style={grid}>
                    <Field label="שם מלא" value={cloudData.fullName} />
                    <Field label="תעודת זהות" value={cloudData.idNumber} />
                    <Field label="אימייל" value={currentUser?.email} />
                    <Field label="מגדר" value={cloudData.gender} />
                </div>

                <div style={divider} />

                {/* Additional details */}
                <div style={sectionTitle}>פרטים נוספים</div>
                <div style={{ ...grid, marginTop: '12px' }}>
                    <EditableField label="גיל" name="age" value={display?.age} isEditing={isEditing} onChange={handleInputChange} />
                    <EditableField label="תחום לימודים" name="studyField" value={display?.studyField} isEditing={isEditing} onChange={handleInputChange} />
                    <EditableField label="שנת לימודים" name="year" value={display?.year} isEditing={isEditing} onChange={handleInputChange} />
                    <EditableField label="טלפון" name="phone" value={display?.phone} isEditing={isEditing} onChange={handleInputChange} />
                </div>

                <div style={divider} />

                {/* Address */}
                <div style={sectionTitle}>כתובת</div>
                <div style={{ marginTop: '12px' }}>
                    {isEditing ? (
                        <AddressInput
                            name="address"
                            value={tempData.address || ''}
                            onTextChange={handleAddressTextChange}
                            onLocationSelected={handleLocationSelected}
                            error={addressError}
                        />
                    ) : (
                        <p style={{ color: display?.address ? '#1A1A2E' : '#9CA3AF', fontSize: '15px', margin: 0 }}>
                            {display?.address || '—'}
                        </p>
                    )}
                </div>

                {/* Buttons */}
                <div style={{ marginTop: '28px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {isEditing ? (
                        <>
                            <button onClick={handleSave} disabled={loading} style={primaryBtn}>
                                {loading ? 'שומר...' : 'שמור שינויים'}
                            </button>
                            <button onClick={handleCancel} style={{ ...secondaryBtn, marginRight: '12px' }}>ביטול</button>
                        </>
                    ) : (
                        <>
                            <button onClick={handleStartEdit} style={primaryBtn}>עריכת פרופיל</button>
                            <button
                                onClick={() => { setShowDeleteConfirm(true); setDeleteError(''); }}
                                style={{ ...deleteBtn, position: 'absolute', left: 0 }}
                            >
                                מחיקת חשבון
                            </button>
                        </>
                    )}
                </div>

                {deleteError && (
                    <p style={{ color: '#DC2626', fontSize: '13px', textAlign: 'center', marginTop: '10px' }}>{deleteError}</p>
                )}

            </div>

            {/* Popup הצלחה */}
            {deleteSuccess && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '32px', maxWidth: '400px', width: '90%', textAlign: 'center', fontFamily: 'Heebo, sans-serif' }} dir="rtl">
                        <div style={{ fontSize: '36px', marginBottom: '12px' }}>✅</div>
                        <h3 style={{ color: '#1A1A2E', fontSize: '18px', fontWeight: '800', margin: '0 0 8px 0' }}>חשבונך נמחק בהצלחה</h3>
                        <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>מועבר/ת לדף הכניסה...</p>
                    </div>
                </div>
            )}

            {/* Popup אישור מחיקה */}
            {showDeleteConfirm && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '32px', maxWidth: '400px', width: '90%', textAlign: 'center', fontFamily: 'Heebo, sans-serif' }} dir="rtl">
                        <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚠️</div>
                        <h3 style={{ color: '#1A1A2E', fontSize: '18px', fontWeight: '800', margin: '0 0 12px 0' }}>מחיקת חשבון לצמיתות</h3>
                        <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                            האם את/ה בטוח/ה? פעולה זו תמחק את החשבון שלך לצמיתות ולא ניתן לשחזרה.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteLoading}
                                style={{ backgroundColor: '#DC2626', color: 'white', padding: '10px 24px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', fontFamily: 'Heebo, sans-serif' }}
                            >
                                {deleteLoading ? 'מוחק...' : 'כן, מחק את החשבון'}
                            </button>
                            <button
                                onClick={() => { setShowDeleteConfirm(false); setDeleteError(''); }}
                                style={secondaryBtn}
                            >
                                ביטול
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </main>
    );
}

const Field = ({ label, value }) => (
    <div>
        <label style={labelStyle}>{label}</label>
        <p style={contentStyle}>{value || '—'}</p>
    </div>
);

const EditableField = ({ label, name, value, isEditing, onChange }) => (
    <div>
        <label style={labelStyle}>{label}</label>
        {isEditing ? (
            <input name={name} value={value || ''} onChange={onChange} style={inputStyle} />
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
const deleteBtn = { backgroundColor: '#FEF2F2', color: '#DC2626', padding: '8px 18px', border: '1px solid #FECACA', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', fontFamily: 'Heebo, sans-serif' };

export default Profile;
