import React, { useState } from 'react';
import { useMaterials } from '../hooks/useMaterials';
import UploadMaterialModal from './UploadMaterialModal';

function MaterialsSidebar({ forumId }) {
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const { materials, loading, error, uploadMaterial, deleteMaterial } = useMaterials(forumId);

    // A helper function to determine the appropriate icon based on file type
    const getFileIcon = (type) => {
        if (!type) return '📄';
        if (type.includes('pdf')) return '📕';
        if (type.includes('image')) return '🖼️';
        if (type.includes('word') || type.includes('officedocument')) return '📘';
        return '📝';
    };

    const handleDeleteClick = async (e, material) => {
        e.preventDefault(); // Prevents the <a> link from opening
        e.stopPropagation(); // Stops event bubbling to the parent link

        const confirmDelete = window.confirm(`האם את בטוחה שברצונך למחוק את החומר "${material.title}"?`);
        if (!confirmDelete) return;

        try {
            await deleteMaterial(material.materialId, material.fileUrl, material.storagePath);
            console.log(`Material ${material.title} deleted successfully`);
        } catch (err) {
            console.error("Failed to delete material component side:", err);
        }
    };

    return (
        <aside className="flex-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col shrink-0 text-right h-full max-h-[80vh]">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-[#2C3E7A] flex items-center gap-2 m-0">
                    <span>📂</span> חומרי הקורס
                </h2>
                <button 
                    onClick={() => setIsUploadOpen(true)} 
                    className="text-[#4F46E5] font-bold text-xs bg-indigo-50 px-3 py-1.5 rounded-lg border-none cursor-pointer hover:bg-indigo-100 transition-colors"
                >
                    העלאה +
                </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto hidden-scrollbar">
                {loading ? (
                    <div className="text-center py-6 text-gray-400 text-xs italic">טוען חומרים...</div>
                ) : error ? (
                    <div className="text-center py-4 text-red-500 text-[11px]">שגיאה בטעינת חומרים</div>
                ) : materials.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-xs">
                        אין עדיין חומרים בפורום זה.
                    </div>
                ) : (
                    materials.map((material) => (
                        <div key={material.materialId} className="relative group">
                            <a 
                                href={material.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3.5 bg-gray-50 hover:bg-gray-100 rounded-2xl flex items-center gap-3 transition-all border border-transparent hover:border-gray-200 block text-right no-underline pl-12"
                            >
                                <span className="text-2xl shrink-0">{getFileIcon(material.fileType)}</span>
                                <div className="overflow-hidden flex-1">
                                    <p className="font-bold text-xs text-[#2C3E7A] truncate m-0">{material.title}</p>
                                    <p className="text-[9px] text-gray-400 mt-0.5 m-0">הועלה ע"י {material.authorName}</p>
                                </div>
                            </a>
                            
                            {/* Trash Button - Styled with Tailwind, positioned absolute left */}
                            <button
                                onClick={(e) => handleDeleteClick(e, material)}
                                className="absolute left-3 top-1/2 -translate-y-1/2 bg-transparent hover:bg-red-50 p-2 rounded-xl border-none cursor-pointer text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center text-sm"
                                title="מחיקת חומר"
                            >
                                🗑️
                            </button>
                        </div>
                    ))
                )}
            </div>

            <UploadMaterialModal 
                isOpen={isUploadOpen} 
                onClose={() => setIsUploadOpen(false)} 
                onUpload={uploadMaterial}
            />
        </aside>
    );
}

export default MaterialsSidebar;