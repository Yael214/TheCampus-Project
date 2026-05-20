import { useState } from 'react';
import UserImage from './UserProfile';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../hooks/useUserData';
import { db, storage } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useImageHandler } from '../hooks/useImageHandler';
import { NavLink, useNavigate } from 'react-router-dom';

function Sidebar() {
    const { currentUser } = useAuth();
    const { userData } = useUserData(currentUser?.uid);
    const { validateImage, getFileExtension, uploadFileToStorage, loading: imageLoading } = useImageHandler();

    const navigate = useNavigate();

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !currentUser?.uid) return;

        // Validate image extension
        if (!validateImage(file)) {
            alert("Please select a valid image file (png, jpg, jpeg, webp).");
            return;
        }

        try {
            // Extract the real file extension to build the correct dynamic path
            const fileExt = getFileExtension(file);
            const storagePath = `users/${currentUser.uid}/profile.${fileExt}`;
            
            // Upload to storage with cache control
            const downloadURL = await uploadFileToStorage(file, storagePath);

            if (downloadURL) {
                // Update Firestore using your preferred field name: profileImage
                await updateDoc(doc(db, "users", currentUser.uid), { 
                    profileImage: downloadURL 
                });
            }
        } catch (error) {
            console.error("Error updating profile image:", error);
            alert("Error uploading image.");
        }
    };

    const navItems = [
        { key: '/feed', label: 'פיד ראשי', icon: '🏠' },
        { key: '/courses', label: 'הקורסים שלי', icon: '📚' },
        { key: '/partners', label: 'חיפוש שותפים', icon: '👥' },
    ];

    return (
        <div className="w-72 bg-[#F0F2FA] border-l border-gray-200/50 flex flex-col py-8 shadow-sm shrink-0" 
          style={{ height: 'calc(100vh - 56px)', position: 'sticky', top: 0, overflow: 'hidden'}}>

            {/* Small profile card */}
            <div className="px-6 pb-8 flex flex-col items-center border-b border-gray-100 mb-6 text-center">
                <UserImage
                    image={userData?.profileImage}
                    fullName={userData?.fullName}
                    onImageChange={handleImageChange}
                    onImageClick={() => navigate('/profile')}
                />
                {imageLoading && <p style={{ color: '#4F46E5', fontSize: '13px', marginTop: '6px' }}>מעלה תמונה...</p>}
                <div className="mt-4">
                    <h3 className="font-bold text-[#2C3E7A] text-xl">
                        {userData?.fullName || 'סטודנט/ית'}
                    </h3>
                    <p className="text-[#4F46E5] font-semibold opacity-70 text-sm">
                        שנה {userData?.year || 'א\''} • {userData?.studyField || 'תואר כללי'}
                    </p>
                </div>
            </div>

            {/* Navigate */}
            <nav className="flex flex-col gap-3 px-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.key}
                        to={item.key}
                        // isActive variable from Router that indicates whether the user is currently on this page.
                        className={({ isActive }) => `px-5 py-3.5 cursor-pointer flex items-center gap-3.5 rounded-[20px] transition-all
                            ${isActive
                                ? 'bg-white text-[#4F46E5] shadow-sm border border-white font-bold'
                                : 'text-[#2C3E7A] hover:bg-white/60 font-medium opacity-80'
                            }`
                        }
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Bottom - Position Switch + Profile*/}
            <div className="mt-auto flex flex-col gap-2 px-4">
                {/* Position Switch */}
                <div className="px-5 py-2">
                    <LocationToggle initialStatus={userData?.isDiscoverable || false} />
                </div>

                {/* Profile Button */}
                <NavLink
                    to="/profile"
                    className={({ isActive }) => `px-6 py-5 cursor-pointer flex items-center gap-3.5 rounded-[24px] transition-all border
                        ${isActive
                            ? 'bg-indigo-100/80 border-indigo-200/50'
                            : 'bg-indigo-50/80 hover:bg-indigo-100/80 border-indigo-100/30'
                        }`
                    }
                >
                    <span className="text-xl">👤</span>
                    <span className="text-indigo-600 font-bold">הפרופיל שלי</span>
                </NavLink>
            </div>

        </div>
    );
}

export default Sidebar;
