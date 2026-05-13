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

    // chack 5h6hhRoa2Ctg1oWG67fr user ditails
    const TEST_USER_ID = "5h6hhRoa2Ctg1oWG67fr";
    const targetUserId = TEST_USER_ID;

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
        const { name, value } = e.target;
        setTempData({ ...tempData, [name]: value });
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const userRef = doc(db, "users", targetUserId);
            // עדכון לפי השמות המדויקים בפיירבייס
            await updateDoc(userRef, {
                fullName: tempData.fullName,
                age: tempData.age,
                gender: tempData.gender,
                city: tempData.city,
                studyField: tempData.studyField
            });
            setUserData(tempData);
            setIsEditing(false);
            alert("הפרופיל עודכן בהצלחה!");
        } catch (error) {
            console.error("שגיאה בעדכון:", error);
            alert("אין הרשאת כתיבה. בדקי את ה-Rules בפיירבייס.");
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading) return <Loader text="מתחבר לנתונים של יעל... 🎓" />;

    if (!userData) {
        return (
            <div style={{ textAlign: 'center', padding: '100px' }}>
                <h2>הגישה לנתונים חסומה</h2>
                <p>ודאי שביצעת Login או שחוקי ה-Firestore מאפשרים קריאה (Read: if true).</p>
                <button onClick={() => setScreen('feed')} style={primaryBtn}>חזרה לפיד</button>
            </div>
        );
    }

    return (
        <div className="ss2" style={{ direction: 'rtl', minHeight: '100vh', backgroundColor: '#F7F8FC' }}>
            <Topbar setScreen={setScreen} />

            <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
                <div style={{ background: 'white', borderRadius: '20px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
                        <UserImage
                            image={userData.profileImage}
                            fullName={userData.fullName}
                        />
                        <h1 style={{ marginTop: '20px', color: '#1A1A2E' }}>{userData.fullName}</h1>
                        <p style={{ color: '#6B7280' }}>סטודנט/ית שנה {userData.year}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                        <div>
                            <label style={labelStyle}>שם מלא</label>
                            {isEditing ? <input name="fullName" value={tempData.fullName} onChange={handleInputChange} style={inputStyle} /> : <p style={contentStyle}>{userData.fullName}</p>}
                        </div>
                        <div>
                            <label style={labelStyle}>תחום לימודים</label>
                            {isEditing ? <input name="studyField" value={tempData.studyField} onChange={handleInputChange} style={inputStyle} /> : <p style={contentStyle}>{userData.studyField}</p>}
                        </div>
                        <div>
                            <label style={labelStyle}>עיר</label>
                            {isEditing ? <input name="city" value={tempData.city} onChange={handleInputChange} style={inputStyle} /> : <p style={contentStyle}>{userData.city}</p>}
                        </div>
                        <div>
                            <label style={labelStyle}>גיל</label>
                            {isEditing ? <input name="age" value={tempData.age} onChange={handleInputChange} style={inputStyle} /> : <p style={contentStyle}>{userData.age}</p>}
                        </div>
                    </div>

                    <div style={{ marginTop: '40px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
                        {isEditing ? (
                            <>
                                <button onClick={handleSave} disabled={loading} style={primaryBtn}>{loading ? "שומר..." : "שמור שינויים"}</button>
                                <button onClick={() => setIsEditing(false)} style={secondaryBtn}>ביטול</button>
                            </>
                        ) : (
                            <button onClick={() => setIsEditing(true)} style={primaryBtn}>עריכת פרופיל</button>
                        )}
                        <button onClick={() => setScreen('feed')} style={{ ...secondaryBtn, backgroundColor: '#F0F2FA', color: '#2C3E7A' }}>חזרה לפיד</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const labelStyle = { display: 'block', fontSize: '14px', fontWeight: '700', color: '#6B7280', marginBottom: '8px' };
const contentStyle = { fontSize: '18px', color: '#1A1A2E', fontWeight: '500', margin: 0 };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' };
const primaryBtn = { backgroundColor: '#4F46E5', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' };
const secondaryBtn = { backgroundColor: 'white', color: '#4B5563', padding: '12px 30px', border: '1px solid #D1D5DB', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' };

export default Profile;