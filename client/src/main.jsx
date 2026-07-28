import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./pages/App.jsx";
import { AuthProvider } from "./context/AuthContext";

/**
 * Application Entry Point
 * Initializes the React root, sets up global context providers (Auth),
 * and configures the routing context.
 */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
