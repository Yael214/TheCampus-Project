import React, { useState } from 'react';
import './App.css';
import Login from './Login.jsx';
import Register from './Register.jsx';
import Reset from './Reset.jsx';
import Success from './Success.jsx';
import Feed from './Feed.jsx';

function App() {
  const [screen, setScreen] = useState('login');

  return (
    <div className="App">
      {screen === 'login' && <Login setScreen={setScreen} />}
      {screen === 'register' && <Register setScreen={setScreen} />}
      {screen === 'reset' && <Reset setScreen={setScreen} />}
      {screen === 'success' && <Success setScreen={setScreen} />}
      {screen === 'feed' && <Feed setScreen={setScreen} />}
    </div>
  );
}

export default App;