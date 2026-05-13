import React from 'react';
import Logo from './Logo';

function Topbar({ setScreen }) {
    return (
        <div className="topbar" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 40px',
            backgroundColor: 'white',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            direction: 'rtl'
        }}>


            <div onClick={() => setScreen('feed')} style={{ cursor: 'pointer' }}>
                <Logo />
            </div>


            <div style={{ flex: 1, margin: '0 40px', maxWidth: '500px' }}>
                <input
                    type="text"
                    placeholder="חפשו קורסים, סטודנטים או סיכומים..."
                    style={{
                        width: '100%',
                        padding: '10px 20px',
                        borderRadius: '25px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#f9fafb',
                        fontSize: '16px',
                        outline: 'none'
                    }}
                />
            </div>


            <button
                onClick={() => setScreen('login')}
                style={{
                    padding: '8px 15px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: '#4b5563',
                    fontWeight: '600'
                }}
            >
                התנתקות
            </button>
        </div>
    );
}

export default Topbar; 