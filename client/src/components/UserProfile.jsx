import React from 'react';

function UserImage({ image, fullName, onImageChange, onImageClick, size = 100 }) {

    const getInitials = (name) => {
        if (!name) return "";
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].charAt(0);
        return parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
    };

    const hasValidImage = image && image !== "" && image !== "**";

    return (
        <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>

            <div
                onClick={onImageClick}
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: `${size < 50 ? 2 : 3}px solid #6366f1`,
                    cursor: 'pointer',
                    backgroundColor: '#6366f1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: `${Math.round(size * 0.32)}px`,
                    fontWeight: 'bold',
                    color: 'white',
                    boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
                }}
            >
                {image ? (
                    <img src={image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                ) : (
                    <span>{getInitials(fullName) || "👤"}</span>
                )}
            </div>

            {size >= 50 && (
                <label style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    border: '1px solid #e5e7eb'
                }}>
                    ✏️
                    <input type="file" name="profileImage" accept="image/*" onChange={onImageChange} style={{ display: 'none' }} />
                </label>
            )}
        </div>
    );
}

export default UserImage;