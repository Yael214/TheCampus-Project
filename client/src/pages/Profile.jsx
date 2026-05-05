import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase/config';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Loader from '../components/Loader';
import UserImage from '../components/UserProfile';

function Profile({ setScreen }) {
    const { currentUser, loading: authLoading } = useAuth();
    const [userData, setUserData] = useState(null);
    const [tempData, setTempData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showImageModal, setShowImageModal] = useState(false);

    // Retrieving data from the database
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (currentUser) {
                    const userRef = doc(db, "users", currentUser.uid);
                    const snap = await getDoc(userRef);
                    if (snap.exists()) {
                        const data = snap.data();
                        setUserData(data);
                        setTempData(data);
                    }
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                if (!authLoading) setLoading(false);
            }
        };
        fetchProfile();
    }, [currentUser, authLoading]);


    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setTempData({ ...tempData, [name]: files[0] });
        } else {
            setTempData({ ...tempData, [name]: value });
        }
    };


    const uploadFile = async (file, folder) => {
        if (!file || typeof file === 'string') return file;
        const storageRef = ref(storage, `${folder}/${currentUser.uid}_${file.name}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    };

    //Save changes
    const handleSave = async () => {
        try {
            setLoading(true);

            const profileImageUrl = await uploadFile(tempData.profileImage, "profiles");
            const studyApprovalUrl = await uploadFile(tempData.studyApproval, "approvals");

            const finalData = {
                ...tempData,
                profileImage: profileImageUrl,
                studyApproval: studyApprovalUrl
            };

            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, finalData);

            setUserData(finalData);
            setIsEditing(false);
            alert("הפרופיל עודכן בהצלחה!");
        } catch (e) {
            console.error(e);
            alert("שגיאה בעדכון הפרופיל");
        } finally {
            setLoading(false);
        }
    };

    // loading screen

    if (loading || authLoading) {
        return <Loader text="מתחבר לפרופיל שלך... 🎓" />;
    }

    return (
        <div className="ss2" style={{ direction: 'rtl', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            {/* Topbar */}
            <div className="topbar">
                <div className="logo">הקמפוס 🎓</div>
            </div>

            <div className="main-content" style={{ padding: '20px 40px' }}>

                {/* Back arrow */}
                <div
                    onClick={() => setScreen('feed')}
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#4F46E5', marginBottom: '20px', fontWeight: 'bold', width: 'fit-content' }}
                >
                    <span style={{ marginLeft: '8px', fontSize: '24px' }}>→</span> חזרה לפיד
                </div>

                <div style={{ display: 'flex', gap: '30px' }}>

                    { }
                    <div style={{ flex: '1', backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>

                        { }
                        <UserImage
                            image={userData?.profileImage}
                            name={userData?.fullName}
                            onImageChange={handleInputChange}
                            onImageClick={() => setShowImageModal(true)}
                        />

                        <div className="profile-form">
                            <label style={labelStyle}>שם מלא</label>
                            {isEditing ? <input style={inputStyle} name="fullName" value={tempData.fullName} onChange={handleInputChange} /> : <p style={viewStyle}>{userData?.fullName}</p>}

                            <label style={labelStyle}>תעודת זהות</label>
                            {isEditing ? <input style={inputStyle} name="idNumber" value={tempData.idNumber} onChange={handleInputChange} /> : <p style={viewStyle}>{userData?.idNumber}</p>}

                            <label style={labelStyle}>אימייל (קבוע)</label>
                            <p style={{ ...viewStyle, backgroundColor: '#f3f4f6' }}>{userData?.email}</p>

                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>גיל</label>
                                    {isEditing ? <input style={inputStyle} type="number" name="age" value={tempData.age} onChange={handleInputChange} /> : <p style={viewStyle}>{userData?.age}</p>}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>מגדר</label>
                                    {isEditing ? (
                                        <select style={inputStyle} name="gender" value={tempData.gender} onChange={handleInputChange}>
                                            <option value="זכר">זכר</option>
                                            <option value="נקבה">נקבה</option>
                                        </select>
                                    ) : <p style={viewStyle}>{userData?.gender}</p>}
                                </div>
                            </div>

                            <label style={labelStyle}>תחום לימודים</label>
                            <p style={{ ...viewStyle, fontWeight: 'bold' }}>{userData?.studyField}</p>

                            {/* study permit*/}
                            <div style={{ marginTop: '20px', padding: '15px', border: '1px dashed #4F46E5', borderRadius: '8px', backgroundColor: '#F0F4FF' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <span style={{ fontWeight: 'bold', display: 'block' }}>אישור לימודים:</span>
                                        {userData?.studyApproval && (
                                            <a href={userData.studyApproval} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#4F46E5' }}>צפייה בקובץ נוכחי</a>
                                        )}
                                    </div>
                                    <label className="primary-btn" style={{ width: 'auto', padding: '8px 15px', fontSize: '12px', cursor: 'pointer' }}>
                                        עדכון מסמך
                                        <input type="file" name="studyApproval" onChange={handleInputChange} style={{ display: 'none' }} />
                                    </label>
                                </div>
                            </div>

                            {/* action button*/}
                            <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                                {isEditing ? (
                                    <>
                                        <button className="primary-btn" onClick={handleSave}>שמור שינויים</button>
                                        <button className="primary-btn" style={{ backgroundColor: '#EF4444' }} onClick={() => setIsEditing(false)}>ביטול</button>
                                    </>
                                ) : (
                                    <button className="primary-btn" onClick={() => setIsEditing(true)}>עריכת פרטים</button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* צד שמאל - פעולות מהירות */}
                    <div style={{ flex: '0.35' }}>
                        <div style={{ padding: '25px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ borderBottom: '1px solid #F3F4F6', paddingBottom: '10px' }}>פעולות מהירות</h3>
                            <ul style={{ listStyle: 'none', padding: 0, marginTop: '15px' }}>
                                <li style={{ cursor: 'pointer', padding: '10px 0' }}>🔔 הגדרות התראות</li>
                                <li style={{ cursor: 'pointer', padding: '10px 0', color: '#EF4444' }} onClick={() => setScreen('login')}>🚪 התנתקות</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            { }
            {showImageModal && (
                <div
                    onClick={() => setShowImageModal(false)}
                    style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
                >
                    <img
                        src={userData?.profileImage || ''}
                        alt="Large View"
                        style={{ maxWidth: '85%', maxHeight: '85%', borderRadius: '8px' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    {!userData?.profileImage && <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '50%', fontSize: '80px' }}>👤</div>}
                </div>
            )}
        </div>
    );
}

// עיצובים קבועים לשדות
const labelStyle = { display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '5px' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', marginBottom: '15px' };
const viewStyle = { padding: '10px 0', borderBottom: '1px solid #E5E7EB', marginBottom: '15px', color: '#111827' };

export default Profile;