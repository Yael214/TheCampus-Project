import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { useImageHandler } from '../hooks/useImageHandler';
import { useUserForums } from '../hooks/useUserForums';
import UserImage from './UserProfile';

function Sidebar() {
    const { currentUser, isAdmin } = useAuth();
    const { validateImage, getFileExtension, uploadFileToStorage, loading: imageLoading } = useImageHandler();
    const navigate = useNavigate();

    const [isForumOpen, setIsForumOpen] = useState(false);
    const [forumSearch, setForumSearch] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false);

    const { forums, loading: forumsLoading } = useUserForums() || { forums: [], loading: false };

    const sortedForums = [...(forums || [])].sort((a, b) => a.forumName.localeCompare(b, 'he'));
    const filteredForums = sortedForums.filter((forum) => forum?.forumName?.toLowerCase().includes(forumSearch.toLowerCase()));

    const handleCollapse = () => {
        if (!isCollapsed) {
            setIsForumOpen(false);
        }
        setIsCollapsed((value) => !value);
    };

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (!file || !currentUser?.uid) return;

        if (!validateImage(file)) {
            alert('Please select a valid image file (png, jpg, jpeg, webp).');
            return;
        }

        try {
            const fileExt = getFileExtension(file);
            const storagePath = `users/${currentUser.uid}/profile.${fileExt}`;
            const downloadURL = await uploadFileToStorage(file, storagePath);
            if (downloadURL) {
                await updateDoc(doc(db, 'users', currentUser.uid), { profileImage: downloadURL });
            }
        } catch (error) {
            console.error('Error updating profile image:', error);
            alert('Error uploading image.');
        }
    };

    return (
        <div
            className={`flex shrink-0 flex-col py-8 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-72'}`}
            style={{
                height: '100%',
                overflow: 'hidden',
                backgroundColor: 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderLeft: '1px solid rgba(186,230,253,0.5)',
                boxShadow: '2px 0 16px rgba(56,189,248,0.07)',
            }}
        >
            <div className={`mb-4 flex px-3 ${isCollapsed ? 'justify-center' : 'justify-end'}`}>
                <button
                    onClick={handleCollapse}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-sky-200 bg-white text-[10px] text-sky-400 shadow-sm transition-all hover:bg-sky-50 hover:text-sky-600"
                    title={isCollapsed ? 'הרחב סרגל' : 'כווץ סרגל'}
                >
                    <span className={`transition-transform duration-300 ${isCollapsed ? 'rotate-90' : '-rotate-90'}`}>▼</span>
                </button>
            </div>

            {!isCollapsed && (
                <div className="mb-6 flex flex-col items-center border-b border-gray-100 px-6 pb-8 text-center">
                    <UserImage
                        image={currentUser?.profileImage}
                        fullName={currentUser?.fullName}
                        onImageChange={handleImageChange}
                        onImageClick={() => navigate('/profile')}
                    />
                    {imageLoading && <p style={{ color: '#4F46E5', fontSize: '13px', marginTop: '6px' }}>טוען תמונה...</p>}
                    <div className="mt-4">
                        <h3 className="text-xl font-bold text-[#2C3E7A]">{currentUser?.fullName || 'Student'}</h3>
                        <p className="text-sm font-semibold text-[#4F46E5] opacity-70">
                            שנה {currentUser?.year || 'A'} • {currentUser?.studyField || 'General Degree'}
                        </p>
                    </div>
                </div>
            )}

            {isCollapsed && (
                <div className="mb-4 flex justify-center px-2">
                    <UserImage
                        image={currentUser?.profileImage}
                        fullName={currentUser?.fullName}
                        onImageChange={handleImageChange}
                        onImageClick={() => navigate('/profile')}
                        size={36}
                    />
                </div>
            )}

            <nav className={`flex max-h-[50vh] flex-col gap-3 overflow-y-auto ${isCollapsed ? 'items-center px-2' : 'px-4'}`}>
                <NavLink
                    to="/feed"
                    title="פיד ראשי"
                    style={{ boxShadow: '0 2px 6px rgba(56,189,248,0.18)' }}
                    className={({ isActive }) => `flex cursor-pointer items-center rounded-[20px] transition-all ${isCollapsed ? 'h-10 w-10 justify-center p-0' : 'gap-3.5 px-5 py-3.5'} ${isActive ? 'border border-white bg-white font-bold text-[#4F46E5] shadow-sm' : 'font-medium text-[#2C3E7A] opacity-80 hover:bg-white/60'}`}
                >
                    <span className="text-xl">🏠</span>
                    {!isCollapsed && <span>פיד ראשי</span>}
                </NavLink>

                <div className={`w-full ${isCollapsed ? 'flex justify-center' : ''}`}>
                    <button
                        type="button"
                        onClick={() => !isCollapsed && setIsForumOpen((value) => !value)}
                        title="הפורומים שלי"
                        className={`flex cursor-pointer items-center rounded-[20px] border-none bg-transparent text-right transition-all ${isCollapsed ? 'h-10 w-10 justify-center p-0' : 'w-full justify-between px-5 py-3.5'} ${isForumOpen ? 'border border-white bg-white font-bold text-[#4F46E5] shadow-sm' : 'font-medium text-[#2C3E7A] opacity-80 hover:bg-white/60'}`}
                    >
                        <div className={`flex items-center ${isCollapsed ? '' : 'gap-3.5'}`}>
                            <span className="text-xl">📚</span>
                            {!isCollapsed && <span>הפורומים שלי</span>}
                        </div>
                        {!isCollapsed && <span className={`text-xs transition-transform duration-200 ${isForumOpen ? 'rotate-180' : ''}`}>▼</span>}
                    </button>

                    {isForumOpen && !isCollapsed && (
                        <div className="mt-2 flex max-h-56 flex-col gap-2 rounded-[20px] border border-white/60 bg-white/80 p-3 shadow-inner">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="חפש פורום..."
                                    value={forumSearch}
                                    onChange={(event) => setForumSearch(event.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white/90 p-2 pl-10 pr-4 text-right text-sm text-[#2C3E7A] focus:border-[#4F46E5] focus:outline-none"
                                />
                                <span className="pointer-events-none absolute left-3 top-2.5 text-sm text-gray-400">🔍</span>
                            </div>
                            <div className="flex-1 space-y-1 overflow-y-auto pr-1">
                                {forumsLoading && <p className="py-2 text-center text-xs text-gray-400">טוען פורומים...</p>}
                                {!forumsLoading && filteredForums.map((forum) => (
                                    <NavLink
                                        key={forum.id}
                                        to={`/forum/${forum.id}`}
                                        className={({ isActive }) => `flex w-full items-center gap-2 rounded-xl p-2.5 text-right text-xs transition-all ${isActive ? 'bg-[#4F46E5]/10 font-bold text-[#4F46E5]' : 'font-medium text-[#2C3E7A] opacity-90 hover:bg-white'}`}
                                    >
                                        <span>📖</span>
                                        <span className="truncate">{forum.forumName}</span>
                                    </NavLink>
                                ))}
                                {!forumsLoading && filteredForums.length === 0 && <p className="py-2 text-center text-xs text-gray-400">No forums found</p>}
                            </div>
                        </div>
                    )}
                </div>

                <NavLink
                    to="/partners"
                    title="חיפוש שותפים"
                    style={{ boxShadow: '0 2px 6px rgba(56,189,248,0.18)' }}
                    className={({ isActive }) => `flex cursor-pointer items-center rounded-[20px] transition-all ${isCollapsed ? 'h-10 w-10 justify-center p-0' : 'gap-3.5 px-5 py-3.5'} ${isActive ? 'border border-white bg-white font-bold text-[#4F46E5] shadow-sm' : 'font-medium text-[#2C3E7A] opacity-80 hover:bg-white/60'}`}
                >
                    <span className="text-xl">👥</span>
                    {!isCollapsed && <span>חיפוש שותפים</span>}
                </NavLink>

                {isAdmin && (
                    <NavLink
                        to="/admin-users"
                        title="ניהול משתמשים"
                        style={{ boxShadow: '0 2px 6px rgba(56,189,248,0.18)' }}
                        className={({ isActive }) => `mt-4 flex cursor-pointer items-center rounded-[20px] transition-all ${isCollapsed ? 'h-10 w-10 justify-center p-0' : 'gap-3.5 px-5 py-3.5'} ${isActive ? 'border border-red-100 bg-red-50 font-bold text-red-600 shadow-sm' : 'font-medium text-red-600 opacity-90 hover:bg-red-50/60'}`}
                    >
                        <span className="text-xl">🛡️</span>
                        {!isCollapsed && <span>ניהול משתמשים</span>}
                    </NavLink>
                )}
            </nav>

            <div className={`mt-auto flex flex-col gap-2 ${isCollapsed ? 'items-center px-2' : 'px-4'}`}>
                <NavLink
                    to="/profile"
                    title="הפרופיל שלי"
                    style={{ boxShadow: '0 2px 6px rgba(56,189,248,0.18)' }}
                    className={({ isActive }) => `flex cursor-pointer items-center rounded-3xl border transition-all ${isCollapsed ? 'h-10 w-10 justify-center p-0' : 'gap-3.5 px-6 py-5'} ${isActive ? 'border-indigo-200/50 bg-indigo-100/80' : 'border-indigo-100/30 bg-indigo-50/80 hover:bg-indigo-100/80'}`}
                >
                    <span className="text-xl">👤</span>
                    {!isCollapsed && <span className="font-bold text-indigo-600">הפרופיל שלי</span>}
                </NavLink>
            </div>
        </div>
    );
}

export default Sidebar;
