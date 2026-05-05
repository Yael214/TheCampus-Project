function User({ image, name, onImageChange, onImageClick }) {
    return (
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto' }}>
                <div onClick={onImageClick} style={ }>
                    {image ? <img src={image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>👤</span>}
                </div>
                <label style={ }>
                    ✏️ <input type="file" onChange={onImageChange} style={{ display: 'none' }} />
                </label>
            </div>
            <h2 style={{ marginTop: '15px' }}>{name}</h2>
        </div>
    );
}