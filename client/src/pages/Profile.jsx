import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from "firebase/firestore";
import { useForums } from '../hooks/useForums';
import { db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import AddressInput from '../components/AddressInput.jsx'; 

function Profile() {
    // Get unified currentUser from context (includes auth + Firestore data)
    const { currentUser, loading: authLoading, deleteAccountComplete } = useAuth();
    const targetUserId = currentUser?.uid;
    const navigate = useNavigate();

    // Central subscription tracking hook built by Shani
    const { forums, isLoading: forumsLoading, toggleFollowForum } = useForums(targetUserId);
    const followedForums = currentUser?.followedForums || {};
    
    const [tempData, setTempData] = useState({});
    const [tempLocation, setTempLocation] = useState(null); 
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [savedData, setSavedData] = useState(null);
    const [addressError, setAddressError] = useState(null); 

    // Account deletion workflow states
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [profileErrors, setProfileErrors] = useState({});

    const display = isEditing ? tempData : (savedData || currentUser);

    const handleStartEdit = () => {
        const currentData = savedData || currentUser || {};
        setTempData({ ...currentData });
        setTempLocation(currentData.location || null); 
        setAddressError(null);
        setProfileErrors({});
        setIsEditing(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTempData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressTextChange = (text) => {
        setTempData(prev => ({ ...prev, address: text }));
        setTempLocation(null); 
        setAddressError(null);
    };

    const handleLocationSelected = ({ address, location: loc }) => {
        setTempData(prev => ({ ...prev, address }));
        setTempLocation(loc); 
        setAddressError(null);
    };

    const handleSave = async () => {
        if (!targetUserId) return;
        
        let tempErrors = {};
        
        setProfileErrors({});
        setAddressError(null);

        const studyFieldVal = (tempData.studyField || '').toString().trim();
        const yearVal = (tempData.year || '').toString().trim();
        const phoneVal = (tempData.phone || '').toString().trim();
        const addressVal = (tempData.address || '').toString().trim();
    
        if (!studyFieldVal) {
            tempErrors.studyField = "חובה להזין תחום לימודים";
        }
        
        if (!yearVal) {
            tempErrors.year = "חובה להזין שנת לימודים";
        }

        if (!phoneVal) {
            tempErrors.phone = "חובה להזין מספר טלפון";
        } else if (!/^05\d{8}$/.test(phoneVal)) {
            tempErrors.phone = "מספר טלפון חייב להכיל 10 ספרות בדיוק ולהתחיל ב-05";
        }

        if (!addressVal) {
            tempErrors.address = "חובה להזין כתובת";
        } else if (!tempLocation) {
            tempErrors.address = "יש לבחור כתובת חוקית מתוך הרשימה";
        }

        if (Object.keys(tempErrors).length > 0) {
            setProfileErrors(tempErrors);
            if (tempErrors.address) setAddressError(tempErrors.address);
            return;
        }

        try {
            setLoading(true);
            
            await updateDoc(doc(db, "users", targetUserId), {
                age: tempData.age || '',
                year: tempData.year || '',
                studyField: tempData.studyField || '',
                about: tempData.about || '',
                phone: tempData.phone || '', 
                address: tempData.address || '', 
                location: tempLocation || null
            });

            setSavedData({ 
                ...currentUser, 
                ...tempData, 
                location: tempLocation 
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile baseline document:", error);
            alert("שגיאה בעדכון הפרופיל.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleteLoading(true);
        setDeleteError('');
        
        try {
            // Call centralized deletion function from context
            // Execution order: verify session → delete storage → delete firestore → delete auth
            await deleteAccountComplete();
            
            setDeleteSuccess(true);
            // Redirect to login after success
            setTimeout(() => navigate('/login'), 2500);
        } catch (error) {
            console.error("Error executing account deletion:", error);
            
            // Handle specific Firebase auth errors early detection
            if (error.code === 'auth/requires-recent-login') {
                setDeleteError('מטעמי אבטחה, יש להתחבר מחדש לחשבון לפני ביצוע המחיקה.');
            } else {
                setDeleteError('אירעה שגיאה בעת מחיקת חשבונך. אנא נסה שוב.');
            }
            setShowDeleteConfirm(false); 
        } finally {
            setDeleteLoading(false);
        }
    };

    if (authLoading) return <Loader text="טוען פרופיל... 🎓" />;
    if (!currentUser) return (
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

                {/* About Section */}
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

                {/* Core User Details */}
                <div style={grid}>
                    <Field label="שם מלא" value={currentUser.fullName} />
                    <Field label="תעודת זהות" value={currentUser.idNumber} />
                    <Field label="אימייל" value={currentUser?.email} />
                    <Field label="מגדר" value={currentUser.gender} />
                </div>

                <div style={divider} />

                {/* Additional Profile Parameters */}
                <div style={sectionTitle}>פרטים נוספים</div>
                <div style={{ ...grid, marginTop: '12px' }}>
                    <EditableField label="גיל" name="age" value={display.age} isEditing={isEditing} onChange={handleInputChange} />
                    <EditableField label="תחום לימודים" name="studyField" value={display.studyField} isEditing={isEditing} onChange={handleInputChange} error={profileErrors.studyField} />
                    <EditableField label="שנת לימודים" name="year" value={display.year} isEditing={isEditing} onChange={handleInputChange} error={profileErrors.year} />
                    <EditableField label="מספר טלפון" name="phone" value={display.phone} isEditing={isEditing} onChange={handleInputChange} type="tel" error={profileErrors.phone} />
                    
                    {/* Address Autocomplete Selection Block */}
                    <div>
                        <label style={labelStyle}>כתובת</label>
                        {isEditing ? (
                            <AddressInput
                                name="address"
                                value={tempData.address}
                                className={inputStyle}
                                onTextChange={handleAddressTextChange}
                                onLocationSelected={handleLocationSelected}
                                error={profileErrors.address || addressError}
                            />
                        ) : (
                            <p style={contentStyle}>{display.address || '—'}</p>
                        )}
                    </div>
                </div>

                <div style={divider} />
                
                {/* Unified Courses Catalog Subsection built by Shani */}
                <div style={sectionTitle}>הפורומים שלי</div>
                <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 16px 0' }}>
                    סמנ/י את הפורומים שברצונך לעקוב אחריהם בפיד:
                </p>

                {forumsLoading ? (
                    <p style={contentStyle}>טוען פורומים...</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {forums.map((forum) => {
                            const isFollowing = followedForums[forum.id] !== undefined;
                            return (
                                <div key={forum.id} style={forumRowStyle}>
                                    <input
                                        type="checkbox"
                                        id={forum.id}
                                        checked={isFollowing}
                                        onChange={() => toggleFollowForum(forum.id, forum.forumName || forum.id, isFollowing)}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <div style={{ marginRight: '12px', textAlign: 'right' }}>
                                        <label htmlFor={forum.id} style={{ fontWeight: '700', color: '#1A1A2E', fontSize: '14px', cursor: 'pointer' }}>
                                            {forum.forumName || forum.id}
                                        </label>
                                        <p style={{ color: '#6B7280', fontSize: '13px', margin: '2px 0 0 0' }}>
                                            {forum.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Form Action Controls Section */}
                <div style={{ marginTop: '36px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
                    {isEditing ? (
                        <>
                            <button onClick={handleSave} disabled={loading} style={primaryBtn}>
                                {loading ? 'שומר...' : 'שמור שינויים'}
                            </button>
                            <button onClick={() => setIsEditing(false)} style={secondaryBtn}>ביטול</button>
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
                    <p style={{ color: '#DC2626', fontSize: '13px', textAlign: 'center', marginTop: '16px', fontWeight: '600' }}>
                        {deleteError}
                    </p>
                )}

            </div>

            {/* Deletion Confirmation Modal Dialog */}
            {showDeleteConfirm && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justify: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '32px', maxWidth: '400px', width: '90%', textAlign: 'center', fontFamily: 'Heebo, sans-serif', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1001 }} dir="rtl">
                        <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚠️</div>
                        <h3 style={{ color: '#1A1A2E', fontSize: '18px', fontWeight: '800', margin: '0 0 12px 0' }}>מחיקת חשבון לצמיתות</h3>
                        <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                            האם את/ה בטוח/ה? פעולה זו תמחק את החשבון שלך לצמיתות, ולא ניתן יהיה לשחזר אותה.
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

            {/* Account Purged Success Popover */}
            {deleteSuccess && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justify: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '32px', maxWidth: '400px', width: '90%', textAlign: 'center', fontFamily: 'Heebo, sans-serif' }} dir="rtl">
                        <div style={{ fontSize: '36px', marginBottom: '12px' }}>✅</div>
                        <h3 style={{ color: '#1A1A2E', fontSize: '18px', fontWeight: '800', margin: '0 0 8px 0' }}>חשבונך נמחק בהצלחה</h3>
                        <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>מועבר/ת לדף הכניסה...</p>
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

const EditableField = ({ label, name, value, isEditing, onChange, type = "text", error }) => (
    <div>
        <label style={labelStyle}>{label}</label>
        {isEditing ? (
            <>
                <input 
                    type={type} 
                    name={name} 
                    value={value || ''} 
                    onChange={onChange} 
                    maxLength={name === 'phone' ? 10 : undefined}
                    style={{...inputStyle, borderColor: error ? '#DC2626' : '#D1D5DB'}} 
                />
                {error && <span style={{ color: '#DC2626', fontSize: '12px', display: 'block', marginTop: '4px', fontWeight: '600' }}>{error}</span>}
            </>
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
const forumRowStyle = { display: 'flex', alignItems: 'center', padding: '12px 16px', backgroundColor: '#F9FAFB', borderRadius: '10px', border: '1px solid #E5E7EB' };
const deleteBtn = { backgroundColor: '#FEF2F2', color: '#DC2626', padding: '8px 18px', border: '1px solid #FECACA', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', fontFamily: 'Heebo, sans-serif' };

export default Profile;
