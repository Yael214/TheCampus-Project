import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserForums } from '../hooks/useUserForums';
import useCreateForumPost from '../hooks/useCreateForumPost'; // use the create-only hook

// Global standalone Modal for dynamic post creation across Feed and specific Course views
function NewPostModal({ isOpen, onClose, lockedForumId = null }) {
    const { currentUser } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedForumId, setSelectedForumId] = useState('');
    const [isSavedToMaterials, setIsSavedToMaterials] = useState(false);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef(null);
    const [uploadType, setUploadType] = useState('*');
    const [selectedFileName, setSelectedFileName] = useState('');

    const { forums: userCourses } = useUserForums();

    // Determine the current forum (locked to route or selected in modal)
    const targetForumId = lockedForumId || selectedForumId;

    // Activate the post creation hook
    const { createPost } = useCreateForumPost(targetForumId);

    // Context synchronization: Handle if the modal is locked to a specific course route or floating free
    useEffect(() => {
        if (lockedForumId) {
            setSelectedForumId(lockedForumId);
        } else if (userCourses && userCourses.length > 0 && !selectedForumId) {
            setSelectedForumId(userCourses[0].id);
        }
    }, [userCourses, selectedForumId, lockedForumId]);

    if (!isOpen) return null;

    const triggerFileSelect = (acceptType) => {
        setUploadType(acceptType);
        setTimeout(() => {
            if (fileInputRef.current) {
                fileInputRef.current.click();
            }
        }, 50);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFileName(file.name);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !content || !targetForumId || loading) return;

        setLoading(true);
        try {
            // Find the selected forum object to extract its name
            const chosenForum = userCourses?.find(f => f.id === targetForumId);
            
            // Use the hook's createPost function instead of addDoc directly
            await createPost({
                title,
                content,
                forumId: targetForumId,
                forumName: chosenForum?.forumName || 'פורום קורס',
                saveToMaterials: isSavedToMaterials,
            });

            setTitle('');
            setContent('');
            setIsSavedToMaterials(false);
            setSelectedFileName('');
            onClose();
        } catch (err) {
            console.error("Error creating post database instance:", err);
            alert("שגיאה בפרסום הפוסט.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" dir="rtl">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-xl w-full border border-gray-100 text-right">
                <h3 className="text-xl font-bold text-[#2C3E7A] mb-6">פוסט חדש</h3>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Course Selector Row: Hidden completely if locked down to a unique context route parameter */}
                    {!lockedForumId && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">בחר פורום</label>
                            <select 
                                value={selectedForumId}
                                onChange={(e) => setSelectedForumId(e.target.value)}
                                className="w-full text-sm p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-[#4F46E5] font-medium text-gray-700"
                            >
                                {userCourses?.map(course => (
                                    /* Display course name using forumName field */
                                    <option key={course.forumId} value={course.forumId}>{course.forumName}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Post Title */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">כותרת הפוסט</label>
                        <input 
                            type="text" 
                            required
                            placeholder="כותרת ברורה ותמציתית..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full text-sm p-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#4F46E5]"
                        />
                    </div>

                    {/* Post Content Body */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">תוכן</label>
                        <textarea 
                            required
                            placeholder="תוכן הפוסט..."
                            rows={4}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full text-sm p-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#4F46E5] resize-none"
                        />
                    </div>

                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={uploadType} className="hidden" />

                    {/* Media Actions Dashboard */}
                    <div className="space-y-3">
                        <div className="w-full p-3 border border-dashed border-gray-200 rounded-xl bg-gray-50 text-right text-xs font-semibold text-gray-500">
                            {selectedFileName ? (
                                <span className="text-[#4F46E5]">📎 קובץ נבחר: {selectedFileName}</span>
                            ) : (
                                <span>בחירת קובץ לא נבחר קובץ</span>
                            )}
                        </div>

                        <div className="flex gap-2.5 justify-start">
                            <button type="button" onClick={() => triggerFileSelect(".pdf")} className="flex items-center gap-1.5 bg-indigo-50/60 text-[#4F46E5] px-4 py-2 rounded-xl text-xs font-bold border-none hover:bg-indigo-100 transition-colors cursor-pointer">📄 PDF</button>
                            <button type="button" onClick={() => triggerFileSelect("image/*")} className="flex items-center gap-1.5 bg-indigo-50/60 text-[#4F46E5] px-4 py-2 rounded-xl text-xs font-bold border-none hover:bg-indigo-100 transition-colors cursor-pointer">🖼️ תמונה</button>
                            <button type="button" onClick={() => triggerFileSelect("video/*")} className="flex items-center gap-1.5 bg-indigo-50/60 text-[#4F46E5] px-4 py-2 rounded-xl text-xs font-bold border-none hover:bg-indigo-100 transition-colors cursor-pointer">🎥 סרטון</button>
                        </div>
                    </div>

                    {/* Safe Traditional Input Inline Layout Block */}
                    <div className="text-right pt-2" style={{ textAlign: 'right', display: 'block' }}>
                        <input 
                            type="checkbox"
                            id="saveMaterialsCheckbox"
                            checked={isSavedToMaterials}
                            onChange={(e) => setIsSavedToMaterials(e.target.checked)}
                            className="rounded border-gray-300 text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
                            style={{ width: '20px', height: '20px', verticalAlign: 'middle', marginLeft: '10px', display: 'inline-block' }}
                        />
                        <label htmlFor="saveMaterialsCheckbox" className="text-sm font-bold text-gray-600 cursor-pointer select-none" style={{ verticalAlign: 'middle', display: 'inline-block' }}>
                            שמור בדאטאבייס של הפורום
                        </label>
                    </div>

                    {/* Form Controls */}
                    <div className="flex gap-3 pt-4">
                        <button type="submit" disabled={loading} className="flex-1 bg-[#4F46E5] text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 border-none text-sm cursor-pointer">{loading ? 'מפרסם...' : 'פרסם'}</button>
                        <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-500 py-3.5 rounded-xl font-bold hover:bg-gray-200 border-none text-sm cursor-pointer">ביטול</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NewPostModal;
