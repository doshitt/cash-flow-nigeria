import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./hooks/useAuth.tsx";

// Runtime backend override to ensure PHP executes on your live server
if (typeof window !== "undefined") {
  try {
    const current = localStorage.getItem("tesapay_backend_url");
    if (!current || current === "/backend") {
      // Point to your deployed backend domain
      localStorage.setItem("tesapay_backend_url", "https://back.tesapay.com");
    }
    const adminCurrent = localStorage.getItem("admin_backend_url");
    if (!adminCurrent || adminCurrent === "/backend/admin") {
      // Admin endpoints live under /admin when backend root is the document root
      localStorage.setItem("admin_backend_url", "https://back.tesapay.com/admin");
    }
  } catch (e) {
    console.warn("Could not set backend override:", e);
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
