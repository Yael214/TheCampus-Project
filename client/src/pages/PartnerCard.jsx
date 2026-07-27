import React from "react";

/**
 * PartnerCard Component
 * Displays an individual study partner's profile snippet within the map sidebar.
 * Includes WhatsApp integration for direct messaging and course overflow tooltips.
 */
const PartnerCard = ({ name, distance, sharedCourses, phone, about }) => {
  return (
    <article className="card">
      <div className="card-row">
        <button
          className="btn"
          onClick={(e) => {
            e.stopPropagation(); // Prevent click event from bubbling up to the map selection handler
            if (phone) {
              const cleanPhone = phone.startsWith("0")
                ? "972" + phone.slice(1)
                : phone;
              window.open(`https://wa.me/${cleanPhone}`, "_blank");
            } else {
              alert("לא נמצא מספר טלפון למשתמש זה");
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
            <p
              className="card-about"
              style={{
                fontSize: "13px",
                color: "#4B5563",
                margin: "4px 0 8px 0",
                lineHeight: "1.4",
                wordBreak: "break-word",
              }}
            >
              {about}
            </p>
          )}
          <div className="shared-courses">
            {/* Display up to two shared courses as individual tags */}
            {(sharedCourses || []).slice(0, 2).map((course, index) => (
              <span key={index} className="course-tag" title={course}>
                {course}
              </span>
            ))}

            {/* Display an overflow indicator with a tooltip for additional courses */}
            {(sharedCourses || []).length > 2 && (
              <span
                className="course-tag extra-tag"
                data-tooltip={(sharedCourses || []).slice(2).join(", ")}
              >
                +{(sharedCourses || []).length - 2}
              </span>
            )}
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
