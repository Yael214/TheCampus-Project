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
            const userRef = doc(db, "users", targetUserId);
            await updateDoc(userRef, {
                age: tempData.age || '',
                city: tempData.city || '',
                address: tempData.address || '',
                year: tempData.year || '',
            });
            setIsEditing(false);
        } catch (error) {
            console.error("שגיאה בעדכון:", error);
            alert("שגיאה בעדכון הפרופיל.");
        } finally {
            setLoading(false);
        }
    };

    // העלאת תמונת פרופיל חדשה ל-Firebase Storage
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !targetUserId) return;
        try {
            setImageLoading(true);
            const storageRef = ref(storage, `users/${targetUserId}/profile.jpg`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            const userRef = doc(db, "users", targetUserId);
            await updateDoc(userRef, { profileImage: downloadURL });
        } catch (error) {
            console.error("שגיאה בהעלאת תמונה:", error);
            alert("שגיאה בהעלאת התמונה.");
        } finally {
            setImageLoading(false);
        }
    };

    if (dataLoading) return <Loader text="טוען פרופיל... 🎓" />;
    if (!cloudData) return (
        <div style={{ textAlign: 'center', padding: '100px' }}>
            <h2>המשתמש לא נמצא</h2>
            <button onClick={() => setScreen('feed')} style={primaryBtn}>חזרה לפיד</button>
        </div>
    );

    return (
        <div style={{ direction: 'rtl', minHeight: '100vh', backgroundColor: '#F7F8FC', fontFamily: 'Heebo, sans-serif' }}>
            <Topbar setScreen={setScreen} />

            <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
                <div style={{ background: 'white', borderRadius: '20px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>

                    {/* תמונת פרופיל */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
                        <UserImage
                            image={cloudData.profileImage}
                            fullName={cloudData.fullName}
                            onImageChange={handleImageChange}
                        />
                        {imageLoading && <p style={{ color: '#4F46E5', marginTop: '8px' }}>מעלה תמונה...</p>}
                        <h1 style={{ marginTop: '16px', color: '#1A1A2E', marginBottom: '4px' }}>{cloudData.fullName}</h1>
                        <p style={{ color: '#6B7280', margin: 0 }}>{cloudData.studyField} • {cloudData.gender}</p>
                    </div>

                    {/* שדות ניתנים לעריכה */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {[
                            { label: 'גיל', name: 'age' },
                            { label: 'עיר', name: 'city' },
                            { label: 'כתובת', name: 'address' },
                            { label: 'שנת לימודים', name: 'year' },
                        ].map((field) => (
                            <div key={field.name}>
                                <label style={labelStyle}>{field.label}</label>
                                {isEditing ? (
                                    <input
                                        name={field.name}
                                        value={tempData[field.name] || ''}
                                        onChange={handleInputChange}
                                        style={inputStyle}
                                    />
                                ) : (
                                    <p style={contentStyle}>{cloudData[field.name] || '—'}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* שדות לתצוגה בלבד */}
                    <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#F0F2FA', borderRadius: '12px' }}>
                        <p style={{ ...labelStyle, marginBottom: '12px' }}>פרטים קבועים</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={labelStyle}>תחום לימודים</label>
                                <p style={contentStyle}>{cloudData.studyField || '—'}</p>
                            </div>
                            <div>
                                <label style={labelStyle}>מגדר</label>
                                <p style={contentStyle}>{cloudData.gender || '—'}</p>
                            </div>
                        </div>
                    </div>

                    {/* כפתורים */}
                    <div style={{ marginTop: '40px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
                        {isEditing ? (
                            <>
                                <button onClick={handleSave} disabled={loading} style={primaryBtn}>
                                    {loading ? "שומר..." : "שמור שינויים"}
                                </button>
                                <button onClick={() => setIsEditing(false)} style={secondaryBtn}>ביטול</button>
                            </>
                        ) : (
                            <button onClick={handleStartEdit} style={primaryBtn}>עריכת פרופיל</button>
                        )}
                        <button onClick={() => setScreen('feed')} style={{ ...secondaryBtn, backgroundColor: '#F0F2FA', color: '#2C3E7A' }}>
                            חזרה לפיד
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '700', color: '#6B7280', marginBottom: '6px' };
const contentStyle = { fontSize: '17px', color: '#1A1A2E', fontWeight: '500', margin: 0 };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '15px', fontFamily: 'Heebo, sans-serif', boxSizing: 'border-box' };
const primaryBtn = { backgroundColor: '#4F46E5', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' };
const secondaryBtn = { backgroundColor: 'white', color: '#4B5563', padding: '12px 30px', border: '1px solid #D1D5DB', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' };

export default Profile;
