import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';

function Topbar() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="topbar" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 40px',
            backgroundColor: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(79,70,229,0.08)',
            boxShadow: '0 2px 16px rgba(79,70,229,0.06), 0 1px 0 rgba(255,255,255,0.8)',
            direction: 'rtl',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>

            <div onClick={() => navigate('/feed')} style={{ cursor: 'pointer' }}>
                <Logo />
            </div>

            <div style={{ flex: 1, margin: '0 48px', maxWidth: '520px' }}>
                <input
                    type="text"
                    placeholder="חפשו קורסים, סטודנטים או סיכומים..."
                    style={{
                        width: '100%',
                        padding: '10px 22px',
                        borderRadius: '999px',
                        border: '1.5px solid #e5e7eb',
                        backgroundColor: '#f8fafc',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        fontFamily: 'Heebo, sans-serif',
                        color: '#1A1A2E'
                    }}
                    onFocus={e => { e.target.style.borderColor = '#a5b4fc'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.08)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                />
            </div>

            <button
                onClick={async () => { await logout(); navigate('/login'); }}
                style={{
                    padding: '8px 20px',
                    backgroundColor: 'white',
                    border: '1.5px solid #e5e7eb',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    color: '#4b5563',
                    fontWeight: '600',
                    fontSize: '14px',
                    fontFamily: 'Heebo, sans-serif',
                    transition: 'border-color 0.2s, color 0.2s'
                }}
                onMouseEnter={e => { e.target.style.borderColor = '#4F46E5'; e.target.style.color = '#4F46E5'; }}
                onMouseLeave={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.color = '#4b5563'; }}
            >
                התנתקות
            </button>
        </div>
    );
}

export default Topbar; 