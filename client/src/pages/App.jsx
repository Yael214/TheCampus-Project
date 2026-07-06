import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './App.css';
import AdminPanel from './AdminPanel';

// Screens
import Login from './Login.jsx';
import Register from './Register.jsx';
import Reset from './Reset.jsx';
import Success from './Success.jsx';
import Feed from './Feed.jsx';
import Profile from './Profile.jsx';
import MapPage from './MapPage.jsx';
import Courses from './Courses.jsx';
import BlockedScreen from './BlockedScreen.jsx'; // Added import for the blocked screen

// Layout elements
import Topbar from '../components/Topbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import EmailVerificationPage from '../components/EmailVerificationPage.jsx';
import AdminDashboard from '../components/AdminDashboard.jsx';

function ProtectedLayout() {
  const { currentUser, isAdmin} = useAuth();
  
  // 1. If there is NO user logged in, redirect them to the login page immediately
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // 2. If the user IS logged in but hasn't verified their email, block them here until they verify
  if (currentUser && !currentUser.emailVerified) {
    return <EmailVerificationPage />;
  }

  // 3. Intercept blocked users and restrict access to the application
  if (currentUser && currentUser.isBlocked) {
    return <BlockedScreen />;
  }

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', backgroundColor: '#FAFEFF', fontFamily: 'Heebo, sans-serif', position: 'relative', overflow: 'hidden' }}>
      {/* Fixed wave decoration at the bottom */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 0, pointerEvents: 'none' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 220" preserveAspectRatio="none" style={{ width: '100%', display: 'block' }}>
          <path fill="#BAE6FD" fillOpacity="0.22" d="M0,112L60,101.3C120,91,240,69,360,74.7C480,80,600,112,720,117.3C840,123,960,101,1080,90.7C1200,80,1320,80,1380,80L1440,80L1440,220L1380,220C1320,220,1200,220,1080,220C960,220,840,220,720,220C600,220,480,220,360,220C240,220,120,220,60,220L0,220Z"/>
          <path fill="#7DD3FC" fillOpacity="0.16" d="M0,160L60,149.3C120,139,240,117,360,117.3C480,117,600,139,720,144C840,149,960,139,1080,128C1200,117,1320,107,1380,101.3L1440,96L1440,220L1380,220C1320,220,1200,220,1080,220C960,220,840,220,720,220C600,220,480,220,360,220C240,220,120,220,60,220L0,220Z"/>
          <path fill="#38BDF8" fillOpacity="0.1" d="M0,192L60,181.3C120,171,240,149,360,144C480,139,600,149,720,154.7C840,160,960,160,1080,154.7C1200,149,1320,139,1380,133.3L1440,128L1440,220L1380,220C1320,220,1200,220,1080,220C960,220,840,220,720,220C600,220,480,220,360,220C240,220,120,220,60,220L0,220Z"/>
        </svg>
      </div>

      <Topbar />
      <div style={{ display: 'flex', position: 'relative', zIndex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/feed" replace />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/partners" element={<MapPage />} />
            <Route path="/forum/:forumId" element={<Courses />} />
            {/* /courses will be here in next sprint */}
            <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/feed" replace />} />
            <Route path="/admin-users" element={isAdmin ? <AdminPanel /> : <Navigate to="/feed" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  const { currentUser, isAdmin } = useAuth();
  
  // If user is logged in, the default layout with the Topbar and Sidebar is displayed.
  return (
    <div className="App">
      <Routes>
        {/* Public paths (only for those who are not logged in) */}
        {/* If a logged in user tries to log in, we will send them straight to Lapid. */}
        <Route path="/login" element={currentUser ? <Navigate to="/feed" replace /> : <Login />} />
        <Route path="/register" element={currentUser ? <Navigate to="/feed" replace /> : <Register />} />
        <Route path="/reset" element={<Reset />} />
        <Route path="/success" element={<Success />} />

        {/* All other paths under the protection of the secure layout */}
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </div>
  );
}

export default App;