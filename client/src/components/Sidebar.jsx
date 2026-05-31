import { useState } from 'react';
import UserImage from './UserProfile';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../hooks/useUserData';
import { db, storage } from '../firebase/config'; 
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import { useImageHandler } from '../hooks/useImageHandler';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUserForums } from '../hooks/useUserForums';

function Sidebar() {
    const { currentUser } = useAuth();
    const { userData } = useUserData(currentUser?.uid);
    const { validateImage, getFileExtension, uploadFileToStorage, loading: imageLoading } = useImageHandler();
    const navigate = useNavigate();

    // State management for course dropdown visibility and search filtering
    const [isCoursesOpen, setIsCoursesOpen] = useState(false);
    const [courseSearch, setCourseSearch] = useState('');

    // Fetching user-enrolled courses directly from the database hook
    const { forums, loading: forumsLoading } = useUserForums() || { forums: [], loading: false };

    // Alphabetical sorting and real-time query filtering for the courses dropdown
    const sortedForums = [...(forums || [])].sort((a, b) => a.name.localeCompare(b, 'he'));
    const filteredForums = sortedForums.filter(forum => 
        forum.name.toLowerCase().includes(courseSearch.toLowerCase())
    );

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !currentUser?.uid) return;

        // validate image extension
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
                {imageLoading && <p style={{ color: '#4F46E5', fontSize: '13px', marginTop: '6px' }}>Uploading image...</p>}
                <div className="mt-4">
                    <h3 className="font-bold text-[#2C3E7A] text-xl">
                        {userData?.fullName || 'Student'}
                    </h3>
                    <p className="text-[#4F46E5] font-semibold opacity-70 text-sm">
                        Year {userData?.year || 'A'} • {userData?.studyField || 'General Degree'}
                    </p>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex flex-col gap-3 px-4 overflow-y-auto max-h-[50vh]">
                
                {/* 1. Main Feed Hub Route Anchor */}
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

                {/* 2. My Courses - Collapsible Dropdown Menu Component */}
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
                            <span>הקורסים שלי</span>
                        </div>
                        {/* Dynamic arrow icon toggling direction based on open state */}
                        <span className={`text-xs transition-transform duration-200 ${isCoursesOpen ? 'rotate-180' : ''}`}>
                            ▼
                        </span>
                    </button>

                    {/* Enrolled Courses Sub-list View Portal */}
                    {isCoursesOpen && (
                        <div className="mt-2 bg-white/80 border border-white/60 rounded-[20px] p-3 shadow-inner flex flex-col gap-2 max-h-56">
                            
                            {/* Inside-dropdown search parameter query entry field */}
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
                            
                            {/* Scrollable courses collection viewport */}
                            <div className="overflow-y-auto flex-1 space-y-1 pr-1">
                                {forumsLoading && <p className="text-xs text-gray-400 text-center py-2">Loading courses...</p>}
                                
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
                                        <span className="truncate">{forum.name}</span>
                                    </NavLink>
                                ))}

                                {!forumsLoading && filteredForums.length === 0 && (
                                    <p className="text-xs text-gray-400 text-center py-2">No courses found</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Partners Connection Route Finder */}
                <NavLink
                    to="/partners"
                    // isActive variable from Router indicates whether the user is currently on this page.
                    className={({ isActive }) => `px-5 py-3.5 cursor-pointer flex items-center gap-3.5 rounded-[20px] transition-all
                        ${isActive
                            ? 'bg-white text-[#4F46E5] shadow-sm border border-white font-bold'
                            : 'text-[#2C3E7A] hover:bg-white/60 font-medium opacity-80'
                        }`}
                >
                    <span className="text-xl">👥</span>
                    <span>חיפוש שותפים</span>
                </NavLink>

            </nav>

            {/* Bottom Menu - Location Toggle and Profile Navigation */}
            <div className="mt-auto flex flex-col gap-2 px-4">
                <div className="px-5 py-2">
                    {/*<LocationToggle initialStatus={userData?.isDiscoverable || false} />*/}
                </div>

                {/* Profile View Link Route Anchor */}
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