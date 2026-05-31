import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../hooks/useUserData';
import { doc, updateDoc, deleteDoc, collection, onSnapshot } from "firebase/firestore";
import { useForums } from '../hooks/useForums';

import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import AddressInput from '../components/AddressInput.jsx'; 

// Sub-component handling the multi-course lookup catalog and mapping modifications
function CourseSelectionModal({ isOpen, onClose, initialSelectedForums, onSave }) {
    const [allForums, setAllForums] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMap, setSelectedMap] = useState({});

    // Pull full, raw dictionary files directly from the master 'forums' collection
    useEffect(() => {
        if (!isOpen) return;

        const forumsCollectionRef = collection(db, 'forums');
        const unsubscribe = onSnapshot(forumsCollectionRef, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Alphabetical sort descending according to central DB title descriptors
            const sorted = fetched.sort((a, b) => (a.titel || '').localeCompare(b.titel || '', 'he'));
            setAllForums(sorted);
        }, (err) => {
            console.error("Error fetching master catalog: ", err);
        });

        return () => unsubscribe();
    }, [isOpen]);

    // Track dynamic changes over active lookup assignments locally
    useEffect(() => {
        if (isOpen && initialSelectedForums) {
            const currentSelected = {};
            Object.values(initialSelectedForums).forEach(forum => {
                if (forum.forumId) {
                    currentSelected[forum.forumId] = forum.forumName;
                }
            });
            setSelectedMap(currentSelected);
        }
    }, [isOpen, initialSelectedForums]);

    if (!isOpen) return null;

    const handleToggleCourse = (forum) => {
        setSelectedMap(prev => {
            const updated = { ...prev };
            if (updated[forum.id]) {
                delete updated[forum.id]; // Remove if checked
            } else {
                updated[forum.id] = forum.titel || forum.name || 'קורס ללא שם'; // Assign value
            }
            return updated;
        });
    };

    const handleConfirmSelection = () => {
        // Map selected inputs cleanly back to the 'followedForums' map specification
        const finalFollowedMap = {};
        Object.entries(selectedMap).forEach(([id, name], index) => {
            finalFollowedMap[`course${index + 1}`] = {
                forumId: id,
                forumName: name
            };
        });
        onSave(finalFollowedMap);
        onClose();
    };

    const filteredForums = allForums.filter(forum => 
        (forum.titel || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '500px', width: '90%', textAlign: 'right', fontFamily: 'Heebo, sans-serif', display: 'flex', flexDirection: 'column', maxHeight: '80vh' }} dir="rtl">
                <h3 style={{ color: '#2C3E7A', fontSize: '20px', fontWeight: '800', margin: '0 0 16px 0' }}>ניהול ועריכת קורסים</h3>
                
                {/* Search Bar Input */}
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <input 
                        type="text"
                        placeholder="חפש קורס מתוך המאגר..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ ...inputStyle, width: '100%', padding: '10px 12px' }}
                    />
                </div>

                {/* Checklist Catalog Selection box with internal custom scrollbar tracking */}
                <div style={{ overflowY: 'auto', flex: 1, border: '1px solid #E5E7EB', borderRadius: '12px', padding: '12px', marginBottom: '24px', minHeight: '200px', maxHeight: '350px' }}>
                    {filteredForums.map((forum) => (
                        <label 
                            key={forum.id} 
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 8px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }}
                            className="hover:bg-gray-50"
                        >
                            <input 
                                type="checkbox"
                                checked={!!selectedMap[forum.id]}
                                onChange={() => handleToggleCourse(forum)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '15px', color: '#1A1A2E', fontWeight: '500' }}>
                                {forum.titel || forum.name || forum.id}
                            </span>
                        </label>
                    ))}
                    {filteredForums.length === 0 && (
                        <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '14px', margin: '20px 0' }}>לא נמצאו קורסים תואמים במאגר</p>
                    )}
                </div>

                {/* Modal actions panel layout */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start' }}>
                    <button onClick={handleConfirmSelection} style={primaryBtn}>שמור קורסים</button>
                    <button onClick={onClose} style={secondaryBtn}>ביטול</button>
                </div>
            </div>
        </div>
    );
}

function Profile() {
    const { currentUser } = useAuth();
    const targetUserId = currentUser?.uid;
    const { userData: cloudData, loading: dataLoading } = useUserData(targetUserId);
    const navigate = useNavigate();

    const { forums, isLoading: forumsLoading, toggleFollowForum } = useForums(targetUserId);
    const followedForums = cloudData?.followedForums || [];

    const [tempData, setTempData] = useState({});
    const [tempLocation, setTempLocation] = useState(null); 
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [savedData, setSavedData] = useState(null);
    const [addressError, setAddressError] = useState(null); 

    // Custom state layer parameters managing the explicit dynamic course lookup selectors
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

    //state for delete account
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [deleteSuccess, setDeleteSuccess] = useState(false);

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

    // valid address editing
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

    // Intermediate handler linking course selections inside editing buffers
    const handleCoursesUpdated = (newFollowedForumsMap) => {
        if (isEditing) {
            setTempData(prev => ({ ...prev, followedForums: newFollowedForumsMap }));
        } else {
            // Direct write option if updated immediately when profile editing layout is closed
            if (!targetUserId) return;
            updateDoc(doc(db, "users", targetUserId), {
                followedForums: newFollowedForumsMap
            }).catch(err => console.error("Error syncing courses: ", err));
        }
    };

    const handleSave = async () => {
        if (!targetUserId) return;

        if (tempData.address && !tempLocation) {
            setAddressError("יש לבחור כתובת חוקית מתוך הרשימה");
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
                location: tempLocation || null,
                // Appending followedForums map verification to standard document updates
                followedForums: tempData.followedForums || cloudData.followedForums || {}
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

    // delete account function
    const handleDeleteAccount = async () => {
        if (!currentUser || !cloudData) return;
        setDeleteLoading(true);
        setDeleteError('');
        
        try {
            // delete image and fils from Storage 
            const fileUrls = [cloudData.profileImage, cloudData.studyApproval].filter(Boolean);
            await Promise.allSettled(
                fileUrls.map(url => deleteObject(ref(storage, url)))
            );

            // delete user details from Firestore
            await deleteDoc(doc(db, "users", currentUser.uid));

            // delete user from Firebase Auth
            await currentUser.delete();

            setDeleteSuccess(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (error) {
            console.error("שגיאה במחיקת החשבון:", error);
            if (error.code === 'auth/requires-recent-login') {
                setDeleteError('לצורך אבטחה, יש להתנתק, להתחבר מחדש ולבצע את המחיקה.');
            } else {
                setDeleteError('אירעה שגיאה במחיקת החשבון. נסה/י שוב.');
            }
            setShowDeleteConfirm(false); 
        } finally {
            setDeleteLoading(false);
        }
    };

    if (dataLoading) return <Loader text="טוען פרופיל... 🎓" />;
    if (!cloudData) return (
        <div style={{ textAlign: 'center', padding: '60px', fontFamily: 'Heebo, sans-serif' }}>
            <h2>המשתמש לא נמצא</h2>
        </div>
    );

    // Extract printable course labels to safely populate read-only layouts
    const currentFollowedCourses = Object.values(display?.followedForums || {});

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

                {/* user details */}
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
                    <EditableField label="גיל" name="age" value={display.age} isEditing={isEditing} onChange={handleInputChange} />
                    <EditableField label="תחום לימודים" name="studyField" value={display.studyField} isEditing={isEditing} onChange={handleInputChange} />
                    <EditableField label="שנת לימודים" name="year" value={display.year} isEditing={isEditing} onChange={handleInputChange} />
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

                    {/* Integrated custom Courses selector column slot parallel with Address layout */}
                    <div>
                        <label style={labelStyle}>הקורסים שלי</label>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {currentFollowedCourses.map((course, idx) => (
                                    <span key={idx} style={{ backgroundColor: 'white', color: '#4F46E5', fontSize: '13px', fontWeight: '700', padding: '4px 10px', border: '1px solid #4F46E5', borderRadius: '12px', display: 'inline-block' }}>
                                        📖 {course.forumName}
                                    </span>
                                ))}
                                {currentFollowedCourses.length === 0 && (
                                    <span style={{ color: '#9CA3AF', fontSize: '14px', fontStyle: 'italic' }}>טרם נבחרו קורסים במערכת</span>
                                )}
                            </div>
                            
                            {/* Toggle button enabling changes either during explicit inline layout forms editing or as a fast action overlay */}
                            <button 
                                type="button"
                                onClick={() => setIsCourseModalOpen(true)}
                                style={{ background: 'none', border: 'none', color: '#4F46E5', fontWeight: '700', fontSize: '13px', cursor: 'pointer', padding: '4px 0', textDecoration: 'underline' }}
                            >
                                עריכה/שינוי הקורסים
                            </button>
                        </div>
                    </div>

                </div>

                <div style={divider} />
                <div style={sectionTitle}>הפורומים שלי</div>
                <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 16px 0' }}>
                    סמנ/י את הפורומים שברצונך לעקוב אחריהם בפיד:
                </p>

                {forumsLoading ? (
                    <p style={contentStyle}>טוען פורומים...</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {forums.map((forum) => {
                            const isFollowing = followedForums.includes(forum.id);
                            return (
                                <div key={forum.id} style={forumRowStyle}>
                                    <input
                                        type="checkbox"
                                        id={forum.id}
                                        checked={isFollowing}
                                        onChange={() => toggleFollowForum(forum.id, isFollowing)}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <div style={{ marginRight: '12px', textAlign: 'right' }}>
                                        <label htmlFor={forum.id} style={{ fontWeight: '700', color: '#1A1A2E', fontSize: '14px', cursor: 'pointer' }}>
                                            {forum.title}
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


                {/* button */}
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

                {/* Show deletion errors */}
                {deleteError && (
                    <p style={{ color: '#DC2626', fontSize: '13px', textAlign: 'center', marginTop: '16px', fontWeight: '600' }}>
                        {deleteError}
                    </p>
                )}

            </div>

            {/* Confirmation popup */}
            {showDeleteConfirm && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justify: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '32px', maxWidth: '400px', width: '90%', textAlign: 'center', fontFamily: 'Heebo, sans-serif' }} dir="rtl">
                        <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚠️</div>
                        <h3 style={{ color: '#1A1A2E', fontSize: '18px', fontWeight: '800', margin: '0 0 12px 0' }}>מחיקת חשבון לצמיתות</h3>
                        <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                            האם את/ה בטוח/ה? פעולה זו תמחק את החשבון שלך לצמיתות, כולל קבצים שהעלית, ולא ניתן יהיה לשחזר אותה.
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

            {/* Success popup */}
            {deleteSuccess && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justify: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '32px', maxWidth: '400px', width: '90%', textAlign: 'center', fontFamily: 'Heebo, sans-serif' }} dir="rtl">
                        <div style={{ fontSize: '36px', marginBottom: '12px' }}>✅</div>
                        <h3 style={{ color: '#1A1A2E', fontSize: '18px', fontWeight: '800', margin: '0 0 8px 0' }}>חשבונך נמחק בהצלחה</h3>
                        <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>מועבר/ת לדף הכניסה...</p>
                    </div>
                </div>
            )}

            {/* Injected Course Selection Overlay Modal Portal Anchor */}
            <CourseSelectionModal 
                isOpen={isCourseModalOpen}
                onClose={() => setIsCourseModalOpen(false)}
                initialSelectedForums={display?.followedForums || {}}
                onSave={handleCoursesUpdated}
            />

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

// עיצובים
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
