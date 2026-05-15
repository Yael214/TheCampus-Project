import { useState } from 'react';
import './App.css';
import Login from './Login.jsx';
import Register from './Register.jsx';
import Reset from './Reset.jsx';
import Success from './Success.jsx';
import Feed from './Feed.jsx';
import Profile from './Profile.jsx';
import Topbar from '../components/Topbar.jsx';
import Sidebar from '../components/Sidebar.jsx';

function App() {
  const [screen, setScreen] = useState('login');

  // Fixed bar
  const appScreens = ['feed', 'profile', 'courses', 'partners'];
  const isAppScreen = appScreens.includes(screen);

  return (
    <div className="App">
      {isAppScreen ? (
        // לייאאוט קבוע - Topbar וSidebar לא זזים
        <div style={{ direction: 'rtl', minHeight: '100vh', backgroundColor: '#F0F2FA', fontFamily: 'Heebo, sans-serif' }}>
          <Topbar setScreen={setScreen} />
          <div style={{ display: 'flex' }}>
            <Sidebar setScreen={setScreen} currentScreen={screen} />
            <main style={{ flex: 1, overflowY: 'auto' }}>
              {screen === 'feed' && <Feed />}
              {screen === 'profile' && <Profile />}
            </main>
          </div>
        </div>
      ) : (

        <>
          {screen === 'login' && <Login setScreen={setScreen} />}
          {screen === 'register' && <Register setScreen={setScreen} />}
          {screen === 'reset' && <Reset setScreen={setScreen} />}
          {screen === 'success' && <Success setScreen={setScreen} />}
        </>
      )}
    </div>
  );
}

export default App;
