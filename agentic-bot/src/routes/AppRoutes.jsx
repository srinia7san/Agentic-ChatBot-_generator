import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import CreateAgent from "../pages/CreateAgent";
import UpdateAgent from "../pages/UpdateAgent";
import AgentChat from "../pages/AgentChat";
import AdminDashboard from "../pages/AdminDashboard";
import EmbedPage from "../pages/EmbedPage";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public embed route - must be before other routes */}
        <Route path="/embed/:token" element={<EmbedPage />} />
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/create-agent" element={<ProtectedRoute><CreateAgent /></ProtectedRoute>} />
        <Route path="/update-agent/:name" element={<ProtectedRoute><UpdateAgent /></ProtectedRoute>} />
        <Route path="/chat/:name" element={<ProtectedRoute><AgentChat /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
