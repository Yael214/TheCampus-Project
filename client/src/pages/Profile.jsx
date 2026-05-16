import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../hooks/useUserData';
import { db, storage } from '../firebase/config';
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Loader from '../components/Loader';
import UserImage from '../components/UserProfile';
import Topbar from '../components/Topbar';

function Profile({ setScreen }) {
    const { currentUser } = useAuth();
    const targetUserId = currentUser?.uid;
    const { userData: cloudData, loading: dataLoading } = useUserData(targetUserId);

    const [tempData, setTempData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);

    const handleStartEdit = () => {
        setTempData({ ...cloudData });
        setIsEditing(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTempData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!targetUserId) return;
        try {
            setLoading(true);
            await updateDoc(doc(db, "users", targetUserId), {
                age: tempData.age || '',
                city: tempData.city || '',
                address: tempData.address || '',
                year: tempData.year || '',
                studyField: tempData.studyField || '',
                about: tempData.about || '',
            });
            setIsEditing(false);
        } catch (error) {
            console.error("שגיאה בעדכון:", error);
            alert("שגיאה בעדכון הפרופיל.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !targetUserId) return;
        try {
            setImageLoading(true);
            const storageRef = ref(storage, `users/${targetUserId}/profile.jpg`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            await updateDoc(doc(db, "users", targetUserId), { profileImage: downloadURL });
        } catch (error) {
            console.error("שגיאה בהעלאת תמונה:", error);
            alert("שגיאה בהעלאת התמונה.");
        } finally {
            setImageLoading(false);
        }
    };

    if (dataLoading) return <Loader text="טוען פרופיל... 🎓" />;
    if (!cloudData) return (
        <div style={{ textAlign: 'center', padding: '100px', fontFamily: 'Heebo, sans-serif' }}>
            <h2>המשתמש לא נמצא</h2>
            <button onClick={() => setScreen('feed')} style={primaryBtn}>חזרה לפיד</button>
        </div>
    );

    const display = isEditing ? tempData : cloudData;

    return (
        <div style={{ direction: 'rtl', minHeight: '100vh', backgroundColor: '#F0F2FA', fontFamily: 'Heebo, sans-serif' }}>
            <Topbar setScreen={setScreen} />

            <div style={{ display: 'flex' }}>

                {/* Sidebar */}
                <div style={{
                    width: '260px', backgroundColor: '#F0F2FA', borderLeft: '1px solid rgba(209,213,219,0.5)',
                    display: 'flex', flexDirection: 'column', padding: '32px 0', minHeight: 'calc(100vh - 56px)',
                    flexShrink: 0
                }}>
                    <div style={{ padding: '0 24px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid #F3F4F6', marginBottom: '20px', textAlign: 'center' }}>
                        <UserImage
                            image={cloudData.profileImage}
                            fullName={cloudData.fullName}
                            onImageChange={handleImageChange}
                        />
                        {imageLoading && <p style={{ color: '#4F46E5', fontSize: '13px', marginTop: '6px' }}>מעלה תמונה...</p>}
                        <h3 style={{ fontWeight: '700', color: '#2C3E7A', fontSize: '18px', marginTop: '12px', marginBottom: '4px' }}>
                            {cloudData.fullName || 'סטודנט/ית'}
                        </h3>
                        <p style={{ color: '#4F46E5', fontWeight: '600', opacity: 0.7, fontSize: '13px', margin: 0 }}>
                            שנה {cloudData.year || 'א\''} • {cloudData.studyField || 'תואר כללי'}
                        </p>
                    </div>

                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 12px' }}>
                        <div onClick={() => setScreen('feed')} style={navItem}>
                            <span>🏠</span><span>פיד ראשי</span>
                        </div>
                        <div style={navItem}>
                            <span>📚</span><span>הקורסים שלי</span>
                        </div>
                        <div style={navItem}>
                            <span>👥</span><span>חיפוש שותפים</span>
                        </div>
                    </nav>

                    <div
                        onClick={() => setScreen('profile')}
                        style={{
                            marginTop: 'auto', margin: '16px', padding: '16px 20px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                            backgroundColor: 'rgba(238,242,255,0.8)', borderRadius: '24px',
                            border: '1px solid rgba(199,210,254,0.3)'
                        }}
                    >
                        <span>👤</span>
                        <span style={{ color: '#4F46E5', fontWeight: '700' }}>הפרופיל שלי</span>
                    </div>
                </div>

                {/* תוכן ראשי - כרטיס רחב יותר */}
                <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
                    <div style={{ maxWidth: '100%' }}>
                        <div style={card}>

                            <h2 style={{ color: '#2C3E7A', fontSize: '24px', fontWeight: '800', margin: '0 0 28px 0' }}>
                                הפרופיל שלי
                            </h2>

                            {/* קצת על עצמי - ראשון */}
                            <div style={sectionTitle}>קצת על עצמי</div>
                            <div style={{ marginTop: '12px' }}>
                                {isEditing ? (
                                    <textarea
                                        name="about"
                                        value={tempData.about || ''}
                                        onChange={handleInputChange}
                                        placeholder="תחביבים, תחומי עניין, על מה תרצה/י לשתף..."
                                        rows={4}
                                        style={{ ...inputStyle, resize: 'vertical', width: '100%' }}
                                    />
                                ) : (
                                    <p style={{ color: cloudData.about ? '#1A1A2E' : '#9CA3AF', fontSize: '16px', lineHeight: '1.8', margin: 0 }}>
                                        {cloudData.about || 'לחצ/י על עריכת פרופיל כדי לספר על עצמך...'}
                                    </p>
                                )}
                            </div>

                            <div style={divider} />

                            {/* פרטים קבועים */}
                            <div style={grid}>
                                <Field label="שם מלא" value={cloudData.fullName} />
                                <Field label="תעודת זהות" value={cloudData.idNumber} />
                                <Field label="אימייל" value={currentUser?.email} />
                                <Field label="מגדר" value={cloudData.gender} />
                            </div>

                            <div style={divider} />

                            {/* פרטים נוספים */}
                            <div style={sectionTitle}>פרטים נוספים</div>
                            <div style={{ ...grid, marginTop: '16px' }}>
                                <EditableField label="גיל" name="age" value={display.age} isEditing={isEditing} onChange={handleInputChange} />
                                <EditableField label="עיר" name="city" value={display.city} isEditing={isEditing} onChange={handleInputChange} />
                                <EditableField label="כתובת" name="address" value={display.address} isEditing={isEditing} onChange={handleInputChange} />
                                <EditableField label="תחום לימודים" name="studyField" value={display.studyField} isEditing={isEditing} onChange={handleInputChange} />
                                <EditableField label="שנת לימודים" name="year" value={display.year} isEditing={isEditing} onChange={handleInputChange} />
                            </div>

                            {/* כפתורים בתחתית */}
                            <div style={{ marginTop: '40px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
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
                    </div>
                </main>
            </div>
        </div>
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

const card = { background: 'white', borderRadius: '20px', padding: '40px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' };
const grid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' };
const divider = { height: '1px', backgroundColor: '#F3F4F6', margin: '28px 0' };
const sectionTitle = { fontSize: '14px', fontWeight: '700', color: '#6B7280' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '700', color: '#6B7280', marginBottom: '6px' };
const contentStyle = { fontSize: '16px', color: '#1A1A2E', fontWeight: '500', margin: 0 };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '15px', fontFamily: 'Heebo, sans-serif', boxSizing: 'border-box' };
const primaryBtn = { backgroundColor: '#4F46E5', color: 'white', padding: '12px 32px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', fontFamily: 'Heebo, sans-serif' };
const secondaryBtn = { backgroundColor: 'white', color: '#4B5563', padding: '12px 32px', border: '1px solid #D1D5DB', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', fontFamily: 'Heebo, sans-serif' };
const navItem = { padding: '11px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', color: '#2C3E7A', borderRadius: '20px', opacity: 0.8, fontSize: '15px' };

export default Profile;
