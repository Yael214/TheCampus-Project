import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../hooks/useUserData';
import { db } from '../firebase/config';
import { doc, updateDoc } from "firebase/firestore";
import Loader from '../components/Loader';
import UserImage from '../components/UserProfile';
import Topbar from '../components/Topbar';

function Profile({ setScreen }) {
    const { currentUser } = useAuth();
    const TEST_USER_ID = "5h6hhRoa2Ctg1oWG67fr";
    const targetUserId = currentUser?.uid || TEST_USER_ID;

    const { userData: cloudData, loading: dataLoading } = useUserData(targetUserId);
    const [userData, setUserData] = useState(null);
    const [tempData, setTempData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (cloudData) {
            setUserData(cloudData);
            setTempData(cloudData);
        }
    }, [cloudData]);

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        setTempData({ ...tempData, [name]: files ? files[0] : value });
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const userRef = doc(db, "users", targetUserId);
            await updateDoc(userRef, tempData);
            setUserData(tempData);
            setIsEditing(false);
            alert("הפרופיל עודכן בהצלחה!");
        } catch (e) {
            alert("שגיאה בעדכון");
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading || loading) return <Loader text="טוען פרופיל..." />;

    return (
        <div className="profile-page" style={{ direction: 'rtl', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>

            <Topbar setScreen={setScreen} />


            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '30px 20px' }}>

                {/* back click*/}
                <div onClick={() => setScreen('feed')} style={{ cursor: 'pointer', color: '#6366f1', marginBottom: '20px', fontWeight: '600', display: 'inline-block' }}>
                    ← חזרה לפיד
                </div>

                {/* Header \imge and name*/}
                <div style={{ display: 'flex', alignItems: 'center', gap: '25px', marginBottom: '30px', backgroundColor: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <UserImage
                        image={userData?.profileImage}
                        fullName={userData?.fullName}
                        onImageChange={handleInputChange}
                    />
                    <div>
                        <h1 style={{ fontSize: '32px', margin: 0, color: '#1e1b4b', fontWeight: '800' }}>
                            {userData?.fullName}
                        </h1>
                        <p style={{ margin: '5px 0 0 0', color: '#6366f1', fontWeight: '600' }}>סטודנט/ית בקמפוס</p>
                    </div>
                </div>

                {/* profile ditails*/}
                <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                        <div>
                            <label style={labelStyle}>שם מלא</label>
                            {isEditing ? <input style={inputStyle} name="fullName" value={tempData.fullName || ''} onChange={handleInputChange} />
                                : <p style={contentStyle}>{userData?.fullName}</p>}
                        </div>

                        <div>
                            <label style={labelStyle}>גיל</label>
                            {isEditing ? <input style={inputStyle} type="number" name="age" value={tempData.age || ''} onChange={handleInputChange} />
                                : <p style={contentStyle}>{userData?.age}</p>}
                        </div>

                        <div>
                            <label style={labelStyle}>כתובת (עיר וארץ)</label>
                            {isEditing ? (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input style={inputStyle} name="city" placeholder="עיר" value={tempData.city || ''} onChange={handleInputChange} />
                                    <input style={inputStyle} name="country" placeholder="ארץ" value={tempData.country || ''} onChange={handleInputChange} />
                                </div>
                            ) : <p style={contentStyle}>{userData?.city}, {userData?.country}</p>}
                        </div>

                        <div>
                            <label style={labelStyle}>אימייל</label>
                            <p style={{ ...contentStyle, color: '#9ca3af' }}>{userData?.email}</p>
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={labelStyle}>תחום לימודים</label>
                            <p style={{ ...contentStyle, color: '#6366f1', fontWeight: '600' }}>{userData?.studyField}</p>
                        </div>
                    </div>

                    <div style={{ marginTop: '40px', display: 'flex', gap: '15px' }}>
                        {isEditing ? (
                            <>
                                <button onClick={handleSave} style={primaryBtn}>שמור שינויים</button>
                                <button onClick={() => setIsEditing(false)} style={secondaryBtn}>ביטול</button>
                            </>
                        ) : (
                            <button onClick={() => setIsEditing(true)} style={primaryBtn}>עריכת פרופיל</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// style
const labelStyle = { display: 'block', fontSize: '18px', fontWeight: '700', color: '#1e1b4b', marginBottom: '8px' };
const contentStyle = { fontSize: '18px', color: '#4b5563', fontWeight: '400', margin: 0, padding: '5px 0' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '16px' };
const primaryBtn = { backgroundColor: '#6366f1', color: 'white', padding: '12px 25px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '16px' };
const secondaryBtn = { backgroundColor: '#ef4444', color: 'white', padding: '12px 25px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '16px' };

export default Profile;