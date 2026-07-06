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
    <div style={{ direction: 'rtl', minHeight: '100vh', backgroundColor: '#FAFEFF', fontFamily: 'Heebo, sans-serif' }}>
      <Topbar />
      <div style={{ display: 'flex' }}>
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