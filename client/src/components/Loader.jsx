import React from 'react';
//loading function
function Loader({ text = "טוען נתונים... 🎓" }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100%',
            backgroundColor: '#f9fafb',
            direction: 'rtl'
        }}>
            <div className="loader-spinner" style={{
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #4F46E5',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 1s linear infinite',
                marginBottom: '20px'
            }}></div>
            <h2 style={{ color: '#374151', fontSize: '1.2rem' }}>{text}</h2>

            { }
            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}

export default Loader;