import React from 'react';

const PartnerCard = ({ name, distance, sharedCourses, phone ,about }) => {
  return (
    <article className="card">
      <div className="card-row">
        <button 
            className="btn" 
            onClick={(e) => {
              e.stopPropagation(); // Prevents the card from being selected on the map when the button is pressed
              if (phone) {
                const cleanPhone = phone.startsWith('0') ? '972' + phone.slice(1) : phone;
                window.open(`https://wa.me/${cleanPhone}`, '_blank');
              } else {
                alert('לא נמצא מספר טלפון למשתמש זה');
              }
            }}
          >
            שלח הודעה
        </button>
        <div className="card-content">
          <div className="card-title">
            <h3>{name}</h3>
            <span className="card-distance">{distance} ק"מ</span>
          </div>
          {about && (
          <p className="card-about" style={{ 
            fontSize: '13px', 
            color: '#4B5563', 
            margin: '4px 0 8px 0',
            lineHeight: '1.4',
            wordBreak: 'break-word'}}>
          {about}
          </p>)}
          <div className="shared-courses">
            {(sharedCourses || []).map((course, index) => (
              <span key={index} className="course-tag">{course}</span>
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
