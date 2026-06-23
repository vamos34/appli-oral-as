import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Prevent standard benign iframe sandbox errors and ResizeObserver feedback loops from failing/crashing the preview framework runtime
if (typeof window !== "undefined") {
  window.addEventListener("error", (e) => {
    const msg = e.message || "";
    if (
      msg.includes("ResizeObserver") ||
      msg.toLowerCase().includes("script error")
    ) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  });

  window.addEventListener("unhandledrejection", (e) => {
    const reason = String(e.reason || "");
    if (
      reason.includes("ResizeObserver") ||
      reason.toLowerCase().includes("script error")
    ) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  });

  const originalOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    const msg = String(message || "");
    if (
      msg.includes("ResizeObserver") ||
      msg.toLowerCase().includes("script error")
    ) {
      return true; // prevent default alert/crashing behavior
    }
    if (originalOnError) {
      return originalOnError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
