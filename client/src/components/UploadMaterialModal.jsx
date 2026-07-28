import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function UploadMaterialModal({ isOpen, onClose, onUpload }) {
    const { currentUser } = useAuth();
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!file) {
            return alert('אנא בחרי קובץ להעלאה');
        }

        try {
            setIsUploading(true);
            await onUpload(title, file, currentUser, true);

            setTitle('');
            setFile(null);
            onClose();
        } catch (err) {
            alert(`שגיאה בהעלאת הקובץ: ${err.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" dir="rtl">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 text-right shadow-xl">
                <h3 className="mb-4 text-xl font-bold text-[#2C3E7A]">העלאת חומר לימוד חדש</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-xs font-bold text-gray-500">כותרת / שם החומר</label>
                        <input
                            type="text"
                            required
                            placeholder="לדוגמה: סיכום הרצאה 4 במבני נתונים"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none"
                            disabled={isUploading}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold text-gray-500">בחרי קובץ (PDF, תמונה וכו')</label>
                        <input
                            type="file"
                            required
                            onChange={(event) => setFile(event.target.files[0])}
                            className="w-full cursor-pointer rounded-xl border border-dashed border-gray-300 p-2 text-sm focus:outline-none"
                            disabled={isUploading}
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 rounded-xl bg-[#4F46E5] py-3 font-bold text-white disabled:bg-indigo-300"
                            disabled={isUploading}
                        >
                            {isUploading ? 'מעלה קובץ...' : 'העלה קובץ'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-xl bg-gray-100 py-3 font-bold text-gray-500"
                            disabled={isUploading}
                        >
                            ביטול
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UploadMaterialModal;