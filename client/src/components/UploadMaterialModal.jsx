import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function UploadMaterialModal({ isOpen, onClose, onUpload }) {
    const { currentUser } = useAuth();
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    if (!isOpen) 
        return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) 
            return alert('אנא בחרי קובץ להעלאה');
        
        try {
            setIsUploading(true);
            // calling the upload function passed from the parent component
            await onUpload(title, file, currentUser);
            
            // reset form and close modal after successful upload
            setTitle('');
            setFile(null);
            onClose();
        } catch (err) {
            alert('שגיאה בהעלאת הקובץ: ' + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" dir="rtl">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-right">
                <h3 className="text-xl font-bold text-[#2C3E7A] mb-4">העלאת חומר לימוד חדש</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">כותרת / שם החומר</label>
                        <input 
                            type="text" 
                            required
                            placeholder="לדוגמה: סיכום הרצאה 4 במבני נתונים"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none"
                            disabled={isUploading}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">בחרי קובץ (PDF, תמונה וכו')</label>
                        <input 
                            type="file" 
                            required
                            onChange={(e) => setFile(e.target.files[0])}
                            className="w-full text-sm p-2 border border-dashed border-gray-300 rounded-xl focus:outline-none cursor-pointer"
                            disabled={isUploading}
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button 
                            type="submit" 
                            className="flex-1 bg-[#4F46E5] text-white py-3 rounded-xl font-bold disabled:bg-indigo-300"
                            disabled={isUploading}
                        >
                            {isUploading ? 'מעלה קובץ...' : 'העלה קובץ'}
                        </button>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="flex-1 bg-gray-100 text-gray-500 py-3 rounded-xl font-bold"
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