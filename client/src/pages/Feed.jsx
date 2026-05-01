import React from 'react';
import { useNavigate } from 'react-router-dom';

function Feed() {
  const navigate = useNavigate();

  return (
    <div className="ss2">
      <div className="topbar">
        <div className="logo">הקמפוס 🎓</div>
        <div className="search-box"><input placeholder="חיפוש..." /></div>
      </div>
      <div className="main-content" style={{padding: '20px'}}>
        <h2>הפיד שלי</h2>
        <button className="primary-btn" style={{width: '150px'}} onClick={() => navigate('/')}>התנתקות</button>
      </div>
    </div>
  );
}

export default Feed;