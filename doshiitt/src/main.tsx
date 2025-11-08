import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Ensure admin dashboard points to live backend
if (typeof window !== "undefined") {
  try {
    const adminCurrent = localStorage.getItem("admin_backend_url");
    if (!adminCurrent || adminCurrent === "/backend/admin") {
      localStorage.setItem("admin_backend_url", "https://back.tesapay.com/admin");
    }
  } catch (e) {
    console.warn("Could not set admin backend override:", e);
  }
}

createRoot(document.getElementById("root")!).render(<App />);