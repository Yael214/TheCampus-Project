import React from 'react';

const PartnerCard = ({ name, distance, tags }) => {
  return (
    <article className="card">
      <div className="card-row">
        <button 
          className="btn" 
          onClick={() => window.location.href = 'chat.html'}
        >
          שלח הודעה
        </button>
        <div className="card-content">
          <div className="card-title">
            <h3>{name}</h3>
            <span className="card-distance">{distance} ק"מ</span>
          </div>
          <div className="tags">
            {tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        </div>
        <div className="card-avatar">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </div>
    </article>
  );
};

export default PartnerCard;