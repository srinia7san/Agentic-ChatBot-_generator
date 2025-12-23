import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { AgentProvider } from "./context/AgentContext";

// Note: AuthProvider must wrap AgentProvider since AgentProvider depends on auth state
ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <AgentProvider>
      <App />
    </AgentProvider>
  </AuthProvider>
);
