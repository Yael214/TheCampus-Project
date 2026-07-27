import { useState } from 'react';
import { useMaterials } from '../hooks/useMaterials';
import UploadMaterialModal from './UploadMaterialModal';

function MaterialsSidebar({ forumId }) {
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const { materials, loading, error, uploadMaterial, deleteMaterial } = useMaterials(forumId);

    const getFileIcon = (type) => {
        if (!type) return '📄';
        if (type.includes('pdf')) return '📕';
        if (type.includes('image')) return '🖼️';
        if (type.includes('word') || type.includes('officedocument')) return '📘';
        return '📝';
    };

    const handleDeleteClick = async (event, material) => {
        event.preventDefault();
        event.stopPropagation();

        const confirmDelete = window.confirm(`האם את בטוחה שברצונך למחוק את החומר "${material.title}"?`);
        if (!confirmDelete) return;

        try {
            await deleteMaterial(material.materialId, material.fileUrl, material.storagePath);
            console.log(`Material ${material.title} deleted successfully`);
        } catch (err) {
            console.error('Failed to delete material component side:', err);
        }
    };

    return (
        <aside className="flex h-full max-h-[80vh] flex-1 shrink-0 flex-col rounded-3xl border border-gray-100 bg-white p-6 text-right shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="m-0 flex items-center gap-2 text-lg font-bold text-[#2C3E7A]">
                    <span>📂</span> חומרי הקורס
                </h2>
                <button
                    onClick={() => setIsUploadOpen(true)}
                    className="cursor-pointer rounded-lg border-none bg-indigo-50 px-3 py-1.5 text-xs font-bold text-[#4F46E5] transition-colors hover:bg-indigo-100"
                >
                    העלאה +
                </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto hidden-scrollbar">
                {loading ? (
                    <div className="py-6 text-center text-xs italic text-gray-400">טוען חומרים...</div>
                ) : error ? (
                    <div className="py-4 text-center text-[11px] text-red-500">שגיאה בטעינת חומרים</div>
                ) : materials.length === 0 ? (
                    <div className="py-10 text-center text-xs text-gray-400">אין עדיין חומרים בפורום זה.</div>
                ) : (
                    materials.map((material) => (
                        <div key={material.materialId} className="group relative">
                            <a
                                href={material.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block rounded-2xl border border-transparent bg-gray-50 p-3.5 pl-12 text-right transition-all hover:border-gray-200 hover:bg-gray-100"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="shrink-0 text-2xl">{getFileIcon(material.fileType)}</span>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="m-0 truncate text-xs font-bold text-[#2C3E7A]">{material.title}</p>
                                        <p className="m-0 mt-0.5 text-[9px] text-gray-400">הועלה ע"י {material.authorName}</p>
                                    </div>
                                </div>
                            </a>

                            <button
                                onClick={(event) => handleDeleteClick(event, material)}
                                className="absolute left-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-xl border-none bg-transparent p-2 text-sm text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
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