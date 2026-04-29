import { useState } from "react";
import { useAuth } from "./context/AuthContext";

function Shanicheck() {
  const { currentUser, isAdmin, loading, loginWithGoogle, login, logout } = useAuth();
  
  // State עבור שדות האימייל והסיסמה
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await login(email, password); // שימוש בפונקציה מה-Context
    } catch (err) {
      setError("שגיאה בהתחברות: " + err.message);
    }
  };

  if (loading) return <h1 style={{ textAlign: "center" }}>טוען נתונים מהשרת...</h1>;

  return (
    <div style={{ padding: "30px", direction: "rtl", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#4A90E2" }}>בדיקת תשתית Firebase - Shanicheck</h1>
      <hr />
      
      {currentUser ? (
        <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "15px" }}>
          <p>🟢 <strong>סטטוס:</strong> מחוברת למערכת</p>
          <p>📧 <strong>אימייל:</strong> {currentUser.email}</p>
          <p>🆔 <strong>UID:</strong> {currentUser.uid}</p>
          <p>👑 <strong>הרשאת אדמין:</strong> {isAdmin ? "✅ מנהלת (Admin)" : "❌ סטודנטית רגילה"}</p>
          
          <button 
            onClick={logout} 
            style={{ backgroundColor: "#ff4d4d", color: "white", border: "none", padding: "10px", cursor: "pointer" }}
          >
            התנתקות מהמערכת
          </button>
        </div>
      ) : (
        <div style={{ marginTop: "20px" }}>
          <p>🔴 <strong>סטטוס:</strong> לא מחוברת</p>
          
          {/* טופס התחברות עם אימייל */}
          <form onSubmit={handleEmailLogin} style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "10px", maxWidth: "300px" }}>
            <h3>התחברות עם אימייל</h3>
            <input 
              type="email" 
              placeholder="אימייל" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <input 
              type="password" 
              placeholder="סיסמה" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <button type="submit" style={{ backgroundColor: "#4CAF50", color: "white", padding: "10px", cursor: "pointer", border: "none" }}>
              התחברי עם אימייל
            </button>
          </form>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <hr />

          <button 
            onClick={loginWithGoogle} 
            style={{ backgroundColor: "#4285F4", color: "white", border: "none", padding: "10px 20px", cursor: "pointer", marginTop: "10px" }}
          >
            התחברי עם Google כדי לבדוק Auth
          </button>
        </div>
      )}
    </div>
  );
}

export default Shanicheck;