import { useState } from 'react';
import UserImage from './UserProfile';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { useImageHandler } from '../hooks/useImageHandler';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUserForums } from '../hooks/useUserForums';

function Sidebar() {
    const { currentUser, isAdmin } = useAuth();
    const { validateImage, getFileExtension, uploadFileToStorage, loading: imageLoading } = useImageHandler();
    const navigate = useNavigate();

    const [isCoursesOpen, setIsCoursesOpen] = useState(false);
    const [courseSearch, setCourseSearch] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false);

    const { forums, loading: forumsLoading } = useUserForums() || { forums: [], loading: false };

    const sortedForums = [...(forums || [])].sort((a, b) => a.forumName.localeCompare(b, 'he'));
    const filteredForums = sortedForums.filter(forum =>
        forum?.forumName?.toLowerCase().includes(courseSearch.toLowerCase())
    );

    const handleCollapse = () => {
        if (!isCollapsed) setIsCoursesOpen(false);
        setIsCollapsed(prev => !prev);
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !currentUser?.uid) return;

        if (!validateImage(file)) {
            alert("Please select a valid image file (png, jpg, jpeg, webp).");
            return;
        }

        try {
            const fileExt = getFileExtension(file);
            const storagePath = `users/${currentUser.uid}/profile.${fileExt}`;
            const downloadURL = await uploadFileToStorage(file, storagePath);
            if (downloadURL) {
                await updateDoc(doc(db, "users", currentUser.uid), { profileImage: downloadURL });
            }
        } catch (error) {
            console.error("Error updating profile image:", error);
            alert("Error uploading image.");
        }
    };

    return (
        <div
            className={`flex flex-col py-8 shrink-0 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-72'}`}
            style={{ height: 'calc(100vh - 56px)', position: 'sticky', top: 0, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderLeft: '1px solid rgba(186,230,253,0.5)', boxShadow: '2px 0 16px rgba(56,189,248,0.07)' }}
        >
            {/* Collapse toggle button */}
            <div className={`flex mb-4 px-3 ${isCollapsed ? 'justify-center' : 'justify-end'}`}>
                <button
                    onClick={handleCollapse}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-sky-200 text-sky-400 hover:bg-sky-50 hover:text-sky-600 transition-all shadow-sm text-[10px]"
                    title={isCollapsed ? 'הרחב סרגל' : 'כווץ סרגל'}
                >
                    <span className={`transition-transform duration-300 ${isCollapsed ? 'rotate-90' : '-rotate-90'}`}>▼</span>
                </button>
            </div>

            {/* Profile card */}
            {!isCollapsed && (
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
            )}

            {/* Collapsed: small avatar only */}
            {isCollapsed && (
                <div className="flex justify-center mb-4 px-2">
                    <UserImage
                        image={currentUser?.profileImage}
                        fullName={currentUser?.fullName}
                        onImageChange={handleImageChange}
                        onImageClick={() => navigate('/profile')}
                        size={36}
                    />
                </div>
            )}

            {/* Navigation */}
            <nav className={`flex flex-col gap-3 overflow-y-auto max-h-[50vh] ${isCollapsed ? 'px-2 items-center' : 'px-4'}`}>

                <NavLink
                    to="/feed"
                    title="פיד ראשי"
                    className={({ isActive }) => `cursor-pointer flex items-center rounded-[20px] transition-all
                        ${isCollapsed ? 'justify-center w-10 h-10 p-0' : 'gap-3.5 px-5 py-3.5'}
                        ${isActive
                            ? 'bg-white text-[#4F46E5] shadow-sm border border-white font-bold'
                            : 'text-[#2C3E7A] hover:bg-white/60 font-medium opacity-80'
                        }`}
                >
                    <span className="text-xl">🏠</span>
                    {!isCollapsed && <span>פיד ראשי</span>}
                </NavLink>

                {/* Courses Dropdown */}
                <div className={`w-full ${isCollapsed ? 'flex justify-center' : ''}`}>
                    <button
                        type="button"
                        onClick={() => !isCollapsed && setIsCoursesOpen(!isCoursesOpen)}
                        title="הפורומים שלי"
                        className={`cursor-pointer flex items-center rounded-[20px] transition-all text-right border-none bg-transparent
                            ${isCollapsed ? 'justify-center w-10 h-10 p-0' : 'w-full justify-between px-5 py-3.5'}
                            ${isCoursesOpen
                                ? 'bg-white text-[#4F46E5] shadow-sm border border-white font-bold'
                                : 'text-[#2C3E7A] hover:bg-white/60 font-medium opacity-80'
                            }`}
                    >
                        <div className={`flex items-center ${isCollapsed ? '' : 'gap-3.5'}`}>
                            <span className="text-xl">📚</span>
                            {!isCollapsed && <span>הפורומים שלי</span>}
                        </div>
                        {!isCollapsed && (
                            <span className={`text-xs transition-transform duration-200 ${isCoursesOpen ? 'rotate-180' : ''}`}>▼</span>
                        )}
                    </button>

                    {isCoursesOpen && !isCollapsed && (
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
                    title="חיפוש שותפים"
                    className={({ isActive }) => `cursor-pointer flex items-center rounded-[20px] transition-all
                        ${isCollapsed ? 'justify-center w-10 h-10 p-0' : 'gap-3.5 px-5 py-3.5'}
                        ${isActive
                            ? 'bg-white text-[#4F46E5] shadow-sm border border-white font-bold'
                            : 'text-[#2C3E7A] hover:bg-white/60 font-medium opacity-80'
                        }`}
                >
                    <span className="text-xl">👥</span>
                    {!isCollapsed && <span>חיפוש שותפים</span>}
                </NavLink>

                {isAdmin && (
                    <NavLink
                        to="/admin-users"
                        title="ניהול משתמשים"
                        className={({ isActive }) => `cursor-pointer flex items-center rounded-[20px] transition-all mt-4
                            ${isCollapsed ? 'justify-center w-10 h-10 p-0' : 'gap-3.5 px-5 py-3.5'}
                            ${isActive
                                ? 'bg-red-50 text-red-600 shadow-sm border border-red-100 font-bold'
                                : 'text-red-600 hover:bg-red-50/60 font-medium opacity-90'
                            }`}
                    >
                        <span className="text-xl">🛡️</span>
                        {!isCollapsed && <span>ניהול משתמשים</span>}
                    </NavLink>
                )}
            </nav>

            {/* Bottom profile link */}
            <div className={`mt-auto flex flex-col gap-2 ${isCollapsed ? 'px-2 items-center' : 'px-4'}`}>
                <NavLink
                    to="/profile"
                    title="הפרופיל שלי"
                    className={({ isActive }) => `cursor-pointer flex items-center rounded-[24px] transition-all border
                        ${isCollapsed ? 'justify-center w-10 h-10 p-0' : 'gap-3.5 px-6 py-5'}
                        ${isActive
                            ? 'bg-indigo-100/80 border-indigo-200/50'
                            : 'bg-indigo-50/80 hover:bg-indigo-100/80 border-indigo-100/30'
                        }`}
                >
                    <span className="text-xl">👤</span>
                    {!isCollapsed && <span className="text-indigo-600 font-bold">הפרופיל שלי</span>}
                </NavLink>
            </div>
        </div>
    );
}

export default Sidebar;
