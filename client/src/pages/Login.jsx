import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      await login(email, password);
      navigate('/feed');
    } catch (err) {
      setError('אימייל או סיסמה שגויים');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
        setLoading(true);
        const result = await loginWithGoogle();

        const { getDoc, doc } = await import('firebase/firestore');
        const { db } = await import('../firebase/config');
        const userDoc = await getDoc(doc(db, "users", result.user.uid));

        if (userDoc.exists()) {
            setScreen('feed');
        } else {
            await result.user.delete();
            setError('not_registered');
        }
    } catch (err) {
        setError('שגיאה בכניסה עם גוגל');
        console.error(err);
    } finally {
        setLoading(false);
    }
  };
  
  return (
    <div className="auth-page">
      <div className="logo" style={{ fontSize: '28px', justifyContent: 'flex-start', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>הקמפוס 🎓</div>
      <div className="login-container" style={{ maxWidth: '500px' }}>
        <form onSubmit={handleLoginSubmit}>
          <h1>כניסה</h1>

          {error === 'not_registered' ? (
          <span className="error-msg">עוד לא נרשמת לקמפוס, יש ליצור חשבון תחילה</span>
          ) : error ? (
           <span className="error-msg">{error}</span>
          ) : null}

          <label>אימייל</label>
          <input
            type="email"
            placeholder="הקלד/י אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>סיסמה</label>
          <input
            type="password"
            placeholder="הקלד/י סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="forgot-password">
            <a onClick={() => setScreen('reset')}>שכחת סיסמה?</a>
          </div>

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'מתחבר...' : 'התחברות'}
          </button>
        </form>

        {/* כפתור גוגל - מחוץ לפורם כי הוא לא submit */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%', marginTop: '12px', padding: '12px',
            border: '1px solid #D1D5DB', borderRadius: '8px',
            background: 'white', cursor: 'pointer',
            fontWeight: '600', fontSize: '15px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <img src="https://www.google.com/favicon.ico" width="18" height="18" alt="" />
          כניסה עם Google
        </button>

        <div className="secondary-text" style={{ marginTop: '16px', textAlign: 'center' }}>
          סטודנט חדש? <Link to="/register">צור חשבון</Link>
        </div>

        <div className="guest-link" style={{ textAlign: 'center', marginTop: '8px' }}>
          <Link to='/feed'>כניסה כאורח/ת</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
