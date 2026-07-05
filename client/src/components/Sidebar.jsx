import { useState } from 'react';
import UserImage from './UserProfile';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config'; 
import { doc, updateDoc } from 'firebase/firestore';
import { useImageHandler } from '../hooks/useImageHandler';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUserForums } from '../hooks/useUserForums';

function Sidebar() {
    // Get unified currentUser from context (includes auth + Firestore data)
    const { currentUser, isAdmin } = useAuth();
    const { validateImage, getFileExtension, uploadFileToStorage, loading: imageLoading } = useImageHandler();
    const navigate = useNavigate();

    // State management for course dropdown visibility and search filtering
    const [isCoursesOpen, setIsCoursesOpen] = useState(false);
    const [courseSearch, setCourseSearch] = useState('');

    // Fetching user-enrolled courses from the database hook
    const { forums, loading: forumsLoading } = useUserForums() || { forums: [], loading: false };

    // Sort alphabetically and filter courses based on search input
    const sortedForums = [...(forums || [])].sort((a, b) => a.forumName.localeCompare(b, 'he'));

    const filteredForums = sortedForums.filter(forum => 
        forum?.forumName?.toLowerCase().includes(courseSearch.toLowerCase())
    );

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !currentUser?.uid) return;

        // Validate image extension before upload
        if (!validateImage(file)) {
            alert("Please select a valid image file (png, jpg, jpeg, webp).");
            return;
        }

        try {
            const fileExt = getFileExtension(file);
            const storagePath = `users/${currentUser.uid}/profile.${fileExt}`;
            
            const downloadURL = await uploadFileToStorage(file, storagePath);

            if (downloadURL) {
                await updateDoc(doc(db, "users", currentUser.uid), { 
                    profileImage: downloadURL 
                });
            }
        } catch (error) {
            console.error("Error updating profile image:", error);
            alert("Error uploading image.");
        }
    };

    return (
        <div className="w-72 bg-[#F0F2FA] border-l border-gray-200/50 flex flex-col py-8 shadow-sm shrink-0" 
          style={{ height: 'calc(100vh - 56px)', position: 'sticky', top: 0, overflow: 'hidden'}}>

            {/* Small profile card */}
            <div className="px-6 pb-8 flex flex-col items-center border-b border-gray-100 mb-6 text-center">
                <UserImage
                    image={currentUser?.profileImage}
                    fullName={currentUser?.fullName}
                    onImageChange={handleImageChange}
                    onImageClick={() => navigate('/profile')}
                />
                {imageLoading && <p style={{ color: '#4F46E5', fontSize: '13px', marginTop: '6px' }}>טוען תמונה...</p>}
                <div className="mt-4">
                    <h3 className="font-bold text-[#2C3E7A] text-xl">
                        {currentUser?.fullName || 'Student'}
                    </h3>
                    <p className="text-[#4F46E5] font-semibold opacity-70 text-sm">
                        שנה {currentUser?.year || 'A'} • {currentUser?.studyField || 'General Degree'}
                    </p>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex flex-col gap-3 px-4 overflow-y-auto max-h-[50vh]">
                
                <NavLink
                    to="/feed"
                    className={({ isActive }) => `px-5 py-3.5 cursor-pointer flex items-center gap-3.5 rounded-[20px] transition-all
                        ${isActive
                            ? 'bg-white text-[#4F46E5] shadow-sm border border-white font-bold'
                            : 'text-[#2C3E7A] hover:bg-white/60 font-medium opacity-80'
                        }`}
                >
                    <span className="text-xl">🏠</span>
                    <span>פיד ראשי</span>
                </NavLink>

                {/* Courses Dropdown */}
                <div className="w-full">
                    <button 
                        type="button"
                        onClick={() => setIsCoursesOpen(!isCoursesOpen)}
                        className={`w-full px-5 py-3.5 cursor-pointer flex items-center justify-between rounded-[20px] transition-all text-right border-none bg-transparent
                            ${isCoursesOpen 
                                ? 'bg-white text-[#4F46E5] shadow-sm border border-white font-bold' 
                                : 'text-[#2C3E7A] hover:bg-white/60 font-medium opacity-80'
                            }`}
                    >
                        <div className="flex items-center gap-3.5">
                            <span className="text-xl">📚</span>
                            <span>הפורומים שלי</span>
                        </div>
                        <span className={`text-xs transition-transform duration-200 ${isCoursesOpen ? 'rotate-180' : ''}`}>
                            ▼
                        </span>
                    </button>

                    {isCoursesOpen && (
                        <div className="mt-2 bg-white/80 border border-white/60 rounded-[20px] p-3 shadow-inner flex flex-col gap-2 max-h-56">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="חפש קורס..." 
                                    value={courseSearch}
                                    onChange={(e) => setCourseSearch(e.target.value)}
                                    className="w-full text-sm p-2 pr-4 pl-10 border border-gray-200 rounded-xl bg-white/90 focus:outline-none focus:border-[#4F46E5] text-right text-[#2C3E7A]"
                                />
                                <span className="absolute left-3 top-2.5 text-gray-400 text-sm pointer-events-none">🔍</span>
                            </div>
                            
                            <div className="overflow-y-auto flex-1 space-y-1 pr-1">
                                {forumsLoading && <p className="text-xs text-gray-400 text-center py-2">טוען קורסים...</p>}
                                
                                {!forumsLoading && filteredForums.map((forum) => (
                                    <NavLink
                                        key={forum.id}
                                        to={`/forum/${forum.id}`} 
                                        className={({ isActive }) => `w-full text-right text-xs p-2.5 rounded-xl transition-all flex items-center gap-2
                                            ${isActive 
                                                ? 'bg-[#4F46E5]/10 text-[#4F46E5] font-bold' 
                                                : 'text-[#2C3E7A] hover:bg-white font-medium opacity-90'
                                            }`}
                                    >
                                        <span>📖</span>
                                        <span className="truncate">{forum.forumName}</span>
                                    </NavLink>
                                ))}
                                {!forumsLoading && filteredForums.length === 0 && (
                                    <p className="text-xs text-gray-400 text-center py-2">No courses found</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <NavLink
                    to="/partners"
                    className={({ isActive }) => `px-5 py-3.5 cursor-pointer flex items-center gap-3.5 rounded-[20px] transition-all
                        ${isActive
                            ? 'bg-white text-[#4F46E5] shadow-sm border border-white font-bold'
                            : 'text-[#2C3E7A] hover:bg-white/60 font-medium opacity-80'
                        }`}
                >
                    <span className="text-xl">👥</span>
                    <span>חיפוש שותפים</span>
                </NavLink>

                {/* 🛡️ Single Clean Admin Button */}
                {isAdmin && (
                    <NavLink
                        to="/admin-users"
                        className={({ isActive }) => `px-5 py-3.5 cursor-pointer flex items-center gap-3.5 rounded-[20px] transition-all mt-4
                            ${isActive
                                ? 'bg-red-50 text-red-600 shadow-sm border border-red-100 font-bold'
                                : 'text-red-600 hover:bg-red-50/60 font-medium opacity-90'
                            }`}
                    >
                        <span className="text-xl">🛡️</span>
                        <span>ניהול משתמשים</span>
                    </NavLink>
                )}
            </nav>

            <div className="mt-auto flex flex-col gap-2 px-4">
                <NavLink
                    to="/profile"
                    className={({ isActive }) => `px-6 py-5 cursor-pointer flex items-center gap-3.5 rounded-[24px] transition-all border
                        ${isActive
                            ? 'bg-indigo-100/80 border-indigo-200/50'
                            : 'bg-indigo-50/80 hover:bg-indigo-100/80 border-indigo-100/30'
                        }`}
                >
                    <span className="text-xl">👤</span>
                    <span className="text-indigo-600 font-bold">הפרופיל שלי</span>
                </NavLink>
            </div>
        </div>
    );
}

export default Sidebar;