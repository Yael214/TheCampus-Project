import React, { useState , useEffect} from 'react';
import './App.css';

import Login from './Login.jsx';
import Register from './Register.jsx';
import Reset from './Reset.jsx';
import Success from './Success.jsx';
import Feed from './Feed.jsx';
import Profile from './Profile.jsx';
import { useAuth } from '../context/AuthContext';

function App() {

  const [screen, setScreen] = useState('login');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setScreen('feed');
    } 
  }, [user]);

  return (
    <div className="App">
      {screen === 'login' && <Login setScreen={setScreen} />}
      {screen === 'register' && <Register setScreen={setScreen} />}
      {screen === 'reset' && <Reset setScreen={setScreen} />}
      {screen === 'success' && <Success setScreen={setScreen} />}
      {screen === 'feed' && <Feed setScreen={setScreen} />}
      {screen === 'profile' && <Profile setScreen={setScreen} />}
    </div>
  );
}

export default App; 