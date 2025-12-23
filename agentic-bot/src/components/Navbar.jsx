import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '64px'
        }}>
          {/* Logo */}
          <div
            style={{
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
            onClick={() => navigate("/home")}
          >
            Agentic
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {user && (
              <span style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                marginRight: '16px',
              }}>
                {user.email}
              </span>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                padding: '8px 16px',
                fontSize: '11px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                background: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {isDark ? 'Light' : 'Dark'}
            </button>

            <button
              onClick={() => navigate("/home")}
              style={{
                padding: '8px 16px',
                fontSize: '11px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              Dashboard
            </button>

            {/* Admin Link - only for admins */}
            {user?.isAdmin && (
              <button
                onClick={() => navigate("/admin")}
                style={{
                  padding: '8px 16px',
                  fontSize: '11px',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                Admin
              </button>
            )}

            <button
              onClick={() => navigate("/create-agent")}
              style={{
                padding: '8px 16px',
                fontSize: '11px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                background: 'var(--accent)',
                border: '1px solid var(--accent)',
                color: 'var(--accent-text)',
                cursor: 'pointer',
              }}
            >
              New
            </button>

            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                fontSize: '11px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
