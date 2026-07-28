import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * Success Component
 * Displays a confirmation message after a successful user registration.
 * Provides navigation back to the login screen.
 */
function Success() {
  const navigate = useNavigate();
  return (
    <div className="auth-page">
      <div
        className="logo"
        style={{
          fontSize: "28px",
          justifyContent: "flex-start",
          maxWidth: "500px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        הקמפוס 🎓
      </div>
      <div
        className="container"
        style={{ textAlign: "center", maxWidth: "500px" }}
      >
        <h1>פרטיך נקלטו בהצלחה!</h1>
        <p>ברוכים הבאים לקמפוס 🙂</p>
        <button className="primary-btn" onClick={() => navigate("/login")}>
          חזרה לעמוד הכניסה
        </button>
      </div>
    </div>
  );
}

export default Success;
