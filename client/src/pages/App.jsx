import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './App.css';

// Screens
import Login from './Login.jsx';
import Register from './Register.jsx';
import Reset from './Reset.jsx';
import Success from './Success.jsx';
import Feed from './Feed.jsx';
import Profile from './Profile.jsx';
import MapPage from './MapPage.jsx';

// Layout elements
import Topbar from '../components/Topbar.jsx';
import Sidebar from '../components/Sidebar.jsx';

function ProtectedLayout() {
  const {user} = useAuth();

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', backgroundColor: '#F0F2FA', fontFamily: 'Heebo, sans-serif' }}>
      <Topbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/feed" replace />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/partners" element={<MapPage />} />
            {/* /courses will be here in next sprint */}
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  const { user } = useAuth();
  
  // If user is logged in, the default layout with the Topbar and Sidebar is displayed.
  return (
    <div className="App">
      <Routes>
        {/* Public paths (only for those who are not logged in) */}
        {/* If a logged in user tries to log in, we will send them straight to Lapid. */}
        <Route path="/login" element={user ? <Navigate to="/feed" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/feed" replace /> : <Register />} />
        <Route path="/reset" element={<Reset />} />
        <Route path="/success" element={<Success />} />

        {/* All other paths under the protection of the secure layout */}
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </div>
  );
}

export default App;
