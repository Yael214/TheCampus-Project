import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./App.css";
import AdminPanel from "./AdminPanel";

// Screens
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import Reset from "./Reset.jsx";
import Success from "./Success.jsx";
import Feed from "./Feed.jsx";
import Profile from "./Profile.jsx";
import MapPage from "./MapPage.jsx";
import Forums from "./Forums.jsx";
import BlockedScreen from "./BlockedScreen.jsx"; // Added import for the blocked screen

// Layout elements
import Topbar from "../components/Topbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import EmailVerificationPage from "../components/EmailVerificationPage.jsx";
import AdminDashboard from "../components/AdminDashboard.jsx";

/**
 * ProtectedLayout Component
 * Acts as a wrapper for authenticated routes.
 * Enforces route guarding by checking authentication status, email verification, and block status.
 * Renders the main application layout (Topbar, Sidebar) for authorized users.
 */
function ProtectedLayout() {
  const { currentUser, isAdmin } = useAuth();

  // Redirect unauthenticated users to the login page immediately
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Restrict access if the user's email is not verified
  if (currentUser && !currentUser.emailVerified) {
    return <EmailVerificationPage />;
  }

  // Intercept blocked users and display the restricted access screen
  if (currentUser && currentUser.isBlocked) {
    return <BlockedScreen />;
  }

  return (
    <div
      style={{
        direction: "rtl",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FAFEFF",
        fontFamily: "Heebo, sans-serif",
      }}
    >
      <Topbar />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar />
        <main style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          <Routes>
            <Route path="/" element={<Navigate to="/feed" replace />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/partners" element={<MapPage />} />
            <Route path="/forum/:forumId" element={<Forums />} />
            {/* /forums will be here in next sprint */}
            <Route
              path="/admin"
              element={
                isAdmin ? <AdminDashboard /> : <Navigate to="/feed" replace />
              }
            />
            <Route
              path="/admin-users"
              element={
                isAdmin ? <AdminPanel /> : <Navigate to="/feed" replace />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

/**
 * App Component
 * The root routing component of the application.
 * Defines public routes (Login, Register) and wraps private routes within ProtectedLayout.
 */
function App() {
  const { currentUser } = useAuth();

  // If user is logged in, the default layout with the Topbar and Sidebar is displayed.
  return (
    <div className="App">
      <Routes>
        {/* Public paths - Redirect logged-in users directly to the Feed */}
        <Route
          path="/login"
          element={currentUser ? <Navigate to="/feed" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={currentUser ? <Navigate to="/feed" replace /> : <Register />}
        />
        <Route path="/reset" element={<Reset />} />
        <Route path="/success" element={<Success />} />

        {/* All other paths under the protection of the secure layout */}
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </div>
  );
}

export default App;