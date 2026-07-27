import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserForums } from '../hooks/useUserForums';
import { useMaterials } from '../hooks/useMaterials';
import useCreateForumPost from '../hooks/useCreateForumPost';

function NewPostModal({ isOpen, onClose, lockedForumId = null }) {
    const { currentUser } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedForumId, setSelectedForumId] = useState('');
    const [isSavedToMaterials, setIsSavedToMaterials] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef(null);
    const [uploadType, setUploadType] = useState('*');

    const { forums: userForums } = useUserForums();

    const targetForumId = lockedForumId || selectedForumId;
    const { uploadMaterial } = useMaterials(targetForumId);
    const { createPost } = useCreateForumPost(targetForumId);

    useEffect(() => {
        if (lockedForumId) {
            setSelectedForumId(lockedForumId);
        } else if (userForums?.length > 0 && !selectedForumId) {
            setSelectedForumId(userForums[0].id);
        }
    }, [userForums, selectedForumId, lockedForumId]);

    if (!isOpen) return null;

    const triggerFileSelect = (acceptType) => {
        setUploadType(acceptType);
        setTimeout(() => {
            fileInputRef.current?.click();
        }, 50);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!title || !content || !targetForumId || loading) return;

        setLoading(true);
        try {
            const attachments = [];

            if (selectedFile) {
                const uploadedFileData = await uploadMaterial(title, selectedFile, currentUser, isSavedToMaterials);
                if (uploadedFileData) {
                    attachments.push(uploadedFileData);
                }
            }

            const chosenForum = userForums?.find((forum) => (forum.forumId ?? forum.id) === targetForumId);

            await createPost({
                title,
                content,
                forumId: targetForumId,
                forumName: chosenForum?.forumName || 'פורום קורס',
                attachments,
                saveToMaterials: isSavedToMaterials,
            });

            setTitle('');
            setContent('');
            setIsSavedToMaterials(false);
            setSelectedFile(null);
            onClose();
            console.log('Post published successfully.');
        } catch (err) {
            console.error('Error creating post database instance:', err);
            alert('שגיאה בפרסום הפוסט.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setTitle('');
        setContent('');
        setIsSavedToMaterials(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" dir="rtl">
            <div className="w-full max-w-xl rounded-3xl border border-gray-100 bg-white p-8 text-right shadow-xl">
                <h3 className="mb-6 text-xl font-bold text-[#2C3E7A]">פוסט חדש</h3>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!lockedForumId && (
                        <div>
                            <label className="mb-1.5 block text-xs font-bold text-gray-500">בחר פורום</label>
                            <select
                                value={selectedForumId}
                                onChange={(event) => setSelectedForumId(event.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3.5 text-sm font-medium text-gray-700 focus:border-[#4F46E5] focus:outline-none"
                            >
                                {userForums?.map((forum, index) => {
                                    const forumId = forum.forumId ?? forum.id ?? String(index);
                                    return (
                                        <option key={forumId} value={forumId}>
                                            {forum.forumName || forum.name || 'פורום קורס'}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="mb-1.5 block text-xs font-bold text-gray-500">כותרת הפוסט</label>
                        <input
                            type="text"
                            required
                            placeholder="כותרת ברורה ותמציתית..."
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            className="w-full rounded-xl border border-gray-200 p-3.5 text-sm focus:border-[#4F46E5] focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold text-gray-500">תוכן</label>
                        <textarea
                            required
                            placeholder="תוכן הפוסט..."
                            rows={4}
                            value={content}
                            onChange={(event) => setContent(event.target.value)}
                            className="w-full resize-none rounded-xl border border-gray-200 p-3.5 text-sm focus:border-[#4F46E5] focus:outline-none"
                        />
                    </div>

                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={uploadType} className="hidden" />

                    <div className="space-y-3">
                        <div className="w-full rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-right text-xs font-semibold text-gray-500">
                            {selectedFile ? (
                                <span className="text-[#4F46E5]">📎 קובץ נבחר: {selectedFile.name}</span>
                            ) : (
                                <span>בחירת קובץ לא נבחר קובץ</span>
                            )}
                        </div>

                        <div className="flex justify-start gap-2.5">
                            <button type="button" onClick={() => triggerFileSelect('.pdf')} className="flex cursor-pointer items-center gap-1.5 rounded-xl border-none bg-indigo-50/60 px-4 py-2 text-xs font-bold text-[#4F46E5] transition-colors hover:bg-indigo-100">📄 PDF</button>
                            <button type="button" onClick={() => triggerFileSelect('image/*')} className="flex cursor-pointer items-center gap-1.5 rounded-xl border-none bg-indigo-50/60 px-4 py-2 text-xs font-bold text-[#4F46E5] transition-colors hover:bg-indigo-100">🖼️ תמונה</button>
                            <button type="button" onClick={() => triggerFileSelect('video/*')} className="flex cursor-pointer items-center gap-1.5 rounded-xl border-none bg-indigo-50/60 px-4 py-2 text-xs font-bold text-[#4F46E5] transition-colors hover:bg-indigo-100">🎥 סרטון</button>
                        </div>
                    </div>

                    <div className="pt-2 text-right">
                        <input
                            type="checkbox"
                            id="saveMaterialsCheckbox"
                            checked={isSavedToMaterials}
                            onChange={(event) => setIsSavedToMaterials(event.target.checked)}
                            className="mr-2 inline-block h-5 w-5 cursor-pointer rounded border-gray-300 text-[#4F46E5] focus:ring-[#4F46E5]"
                        />
                        <label htmlFor="saveMaterialsCheckbox" className="inline-block cursor-pointer select-none text-sm font-bold text-gray-600">
                            שמור בדאטאבייס של הפורום
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="submit" disabled={loading} className="flex-1 cursor-pointer rounded-xl border-none bg-[#4F46E5] py-3.5 text-sm font-bold text-white hover:bg-indigo-700">
                            {loading ? 'מפרסם...' : 'פרסם'}
                        </button>
                        <button type="button" onClick={handleClose} className="flex-1 cursor-pointer rounded-xl border-none bg-gray-100 py-3.5 text-sm font-bold text-gray-500 hover:bg-gray-200">
                            ביטול
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NewPostModal;
