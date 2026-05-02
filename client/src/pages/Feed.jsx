import React from 'react';

function Feed({ setScreen }) {
  return (
    <div className="ss2">
      <div className="topbar">
        <div className="logo">הקמפוס 🎓</div>
        <div className="search-box">
          <input placeholder="חיפוש..." />
        </div>
      </div>
      <div className="main-content" style={{padding: '20px'}}>
        <h2>הפיד שלי</h2>
        <button className="primary-btn" style={{width: '150px'}} onClick={() => setScreen('login')}>
          התנתקות
        </button>
      </div>
    </div>
  );
}

export default Feed;