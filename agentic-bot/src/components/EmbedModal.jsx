import React, { useState } from "react";
import ReactDOM from "react-dom";
import { generateEmbedToken } from "../api";

export default function EmbedModal({ agent, onClose }) {
    const [token, setToken] = useState(agent.embed_token || null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState(null);
    const [theme, setTheme] = useState('light');
    const [position, setPosition] = useState('bottom-right');
    const [width, setWidth] = useState('400');
    const [height, setHeight] = useState('600');
    const [embedFormat, setEmbedFormat] = useState('react'); // 'react', 'iframe', 'sdk', 'backend', 'react-native', 'flutter'

    const handleGenerateToken = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await generateEmbedToken(agent.name);
            setToken(result.embed_token);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Get position values based on selection
    const getPositionCSS = () => {
        const positions = {
            'top-left': 'top: 20px; left: 20px;',
            'top-right': 'top: 20px; right: 20px;',
            'bottom-left': 'bottom: 20px; left: 20px;',
            'bottom-right': 'bottom: 20px; right: 20px;'
        };
        return positions[position] || positions['bottom-right'];
    };

    // Generate React Component code
    const getReactCode = () => `// ChatbotWidget.jsx - Copy this component to your React project
import React from 'react';

const ChatbotWidget = () => {
  const containerStyle = {
    position: 'fixed',
    ${position === 'top-left' ? 'top: 20,' : ''}${position === 'top-right' ? 'top: 20,' : ''}${position === 'bottom-left' ? 'bottom: 20,' : ''}${position === 'bottom-right' ? 'bottom: 20,' : ''}
    ${position === 'top-left' ? 'left: 20,' : ''}${position === 'top-right' ? 'right: 20,' : ''}${position === 'bottom-left' ? 'left: 20,' : ''}${position === 'bottom-right' ? 'right: 20,' : ''}
    zIndex: 9999,
    width: 'min(${width}px, calc(100vw - 40px))',
    height: 'min(${height}px, calc(100vh - 40px))',
  };

  const iframeStyle = {
    width: '100%',
    height: '100%',
    border: 'none',
    borderRadius: 12,
    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
  };

  return (
    <div style={containerStyle}>
      <iframe
        src="http://localhost:5173/embed/${token}?theme=${theme}"
        style={iframeStyle}
        allow="microphone"
        title="AI Chatbot"
      />
    </div>
  );
};

export default ChatbotWidget;

// Usage: Import and add <ChatbotWidget /> to your App.jsx`;

    // Generate iframe HTML code
    const getIframeCode = () => `<!-- Chatbot Embed - ${agent.name} -->
<div id="chatbot-widget" style="
  position: fixed;
  ${getPositionCSS()}
  z-index: 9999;
  width: min(${width}px, calc(100vw - 40px));
  height: min(${height}px, calc(100vh - 40px));
">
  <iframe
    src="http://localhost:5173/embed/${token}?theme=${theme}"
    style="width: 100%; height: 100%; border: none; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.15);"
    allow="microphone"
  ></iframe>
</div>`;

    // Generate Web SDK code (script-based)
    const getSdkCode = () => `<!-- AgenticAI Chatbot SDK -->
<script>
  (function() {
    window.AgenticChatbot = {
      token: '${token}',
      theme: '${theme}',
      position: '${position}',
      width: ${width},
      height: ${height}
    };
    
    var container = document.createElement('div');
    container.id = 'agentic-chatbot';
    container.style.cssText = 'position:fixed;${getPositionCSS()}z-index:9999;width:min(${width}px,calc(100vw-40px));height:min(${height}px,calc(100vh-40px));';
    
    var iframe = document.createElement('iframe');
    iframe.src = 'http://localhost:5173/embed/${token}?theme=${theme}';
    iframe.style.cssText = 'width:100%;height:100%;border:none;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.15);';
    iframe.allow = 'microphone';
    
    container.appendChild(iframe);
    document.body.appendChild(container);
  })();
</script>

<!-- Add this script before </body> tag -->`;

    // Generate Backend-Only API documentation
    const getBackendCode = () => `// Backend-Only API v1 - Build your own custom UI
// Base URL: http://localhost:5000/v1
// Token: ${token}

// ═══════════════════════════════════════════════════════
// ENDPOINTS (API v1)
// ═══════════════════════════════════════════════════════

// 1. Get Widget Config
// GET http://localhost:5000/v1/embed/${token}/config

// 2. Send Query (Main endpoint for chat)
fetch('http://localhost:5000/v1/embed/${token}/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'Your question here' })
})
.then(res => res.json())
.then(data => {
  console.log(data.data.answer);  // AI response
  console.log(data.metadata);     // tokens used, response time
  console.log(data.request_id);   // For debugging
});

// 3. Submit Feedback
fetch('http://localhost:5000/v1/embed/${token}/feedback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message_id: 'msg-123',
    type: 'positive',  // or 'negative'
    comment: 'Great answer!'
  })
});

// 4. Track Analytics
fetch('http://localhost:5000/v1/embed/${token}/analytics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event: 'widget_open',
    data: { page: window.location.href }
  })
});

// ═══════════════════════════════════════════════════════
// Rate Limit: 20 requests per 60 seconds
// Domain Allowlist: Configure in dashboard
// Full docs: See BACKEND_API.md
// ═══════════════════════════════════════════════════════`;

    // Generate React Native code
    const getReactNativeCode = () => `// React Native SDK - Install the package
// npm install react-native-agentic-chatbot

import { AgenticChatbot } from 'react-native-agentic-chatbot';

export default function ChatScreen() {
  return (
    <AgenticChatbot
      token="${token}"
      apiUrl="http://localhost:5000/v1"
      theme="${theme}"
      onMessageSent={(msg) => console.log('Sent:', msg)}
      onMessageReceived={(msg) => console.log('Response:', msg)}
      onError={(err) => console.error(err)}
    />
  );
}

// ═══════════════════════════════════════════════════════
// Custom theme example:
// customTheme={{
//   primaryColor: '#8b5cf6',
//   userBubbleColor: '#8b5cf6',
//   backgroundColor: '#faf5ff',
// }}
// ═══════════════════════════════════════════════════════`;

    // Generate Flutter code
    const getFlutterCode = () => `// Flutter SDK - Add to pubspec.yaml
// agentic_chatbot_flutter:
//   path: ../agentic_chatbot_flutter

import 'package:flutter/material.dart';
import 'package:agentic_chatbot_flutter/agentic_chatbot_flutter.dart';

class ChatScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AgenticChatbot(
        token: '${token}',
        apiUrl: 'http://localhost:5000/v1',
        theme: AgenticTheme.${theme},
        onMessageSent: (msg) => print('Sent: \${msg.content}'),
        onMessageReceived: (msg) => print('Response: \${msg.content}'),
        onError: (err) => print('Error: \$err'),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════
// Custom theme example:
// theme: AgenticTheme.light.copyWith(
//   primaryColor: Color(0xFF8B5CF6),
//   userBubbleColor: Color(0xFF8B5CF6),
// ),
// ═══════════════════════════════════════════════════════`;

    // Get embed code based on selected format
    const getEmbedCode = () => {
        if (!token) return '';
        switch (embedFormat) {
            case 'react': return getReactCode();
            case 'iframe': return getIframeCode();
            case 'sdk': return getSdkCode();
            case 'backend': return getBackendCode();
            case 'react-native': return getReactNativeCode();
            case 'flutter': return getFlutterCode();
            default: return getReactCode();
        }
    };

    const embedCode = getEmbedCode();

    const handleCopy = () => {
        navigator.clipboard.writeText(embedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const modalContent = (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 99999,
                padding: '16px',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    width: '100%',
                    maxWidth: '540px',
                    maxHeight: '90vh',
                    overflow: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                                Embed Widget
                            </h2>
                            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6b7280' }}>{agent.name}</p>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#f5f5f5',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                color: '#6b7280'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: '24px' }}>
                    {error && (
                        <div style={{
                            padding: '12px 16px',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            color: '#dc2626',
                            fontSize: '14px',
                            marginBottom: '16px'
                        }}>
                            {error}
                        </div>
                    )}

                    {!token ? (
                        <div style={{ textAlign: 'center', padding: '24px 0' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: '#f5f5f5',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px'
                            }}>
                                <svg width="24" height="24" fill="none" stroke="#6b7280" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </div>
                            <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                                Enable Embedding
                            </h3>
                            <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: '14px' }}>
                                Generate a token to embed this agent on external websites.
                            </p>
                            <button
                                onClick={handleGenerateToken}
                                disabled={loading}
                                style={{
                                    padding: '10px 20px',
                                    background: '#2563eb',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? 'Generating...' : 'Generate Token'}
                            </button>
                        </div>
                    ) : (
                        <div>
                            {/* Options */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                                        Theme
                                    </label>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button
                                            onClick={() => setTheme('light')}
                                            style={{
                                                flex: 1,
                                                padding: '8px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                background: theme === 'light' ? '#2563eb' : '#f5f5f5',
                                                color: theme === 'light' ? 'white' : '#374151'
                                            }}
                                        >
                                            Light
                                        </button>
                                        <button
                                            onClick={() => setTheme('dark')}
                                            style={{
                                                flex: 1,
                                                padding: '8px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                background: theme === 'dark' ? '#2563eb' : '#f5f5f5',
                                                color: theme === 'dark' ? 'white' : '#374151'
                                            }}
                                        >
                                            Dark
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                                        Size
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="number"
                                            value={width}
                                            onChange={(e) => setWidth(e.target.value)}
                                            placeholder="Width"
                                            style={{
                                                flex: 1,
                                                padding: '8px 10px',
                                                borderRadius: '6px',
                                                border: '1px solid #e5e7eb',
                                                fontSize: '13px',
                                                background: 'white'
                                            }}
                                        />
                                        <span style={{ alignSelf: 'center', color: '#6b7280' }}>×</span>
                                        <input
                                            type="number"
                                            value={height}
                                            onChange={(e) => setHeight(e.target.value)}
                                            placeholder="Height"
                                            style={{
                                                flex: 1,
                                                padding: '8px 10px',
                                                borderRadius: '6px',
                                                border: '1px solid #e5e7eb',
                                                fontSize: '13px',
                                                background: 'white'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Position Selector */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                    Position on Page
                                </label>
                                <select
                                    value={position}
                                    onChange={(e) => setPosition(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        fontSize: '14px',
                                        background: 'white',
                                        color: '#374151',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        appearance: 'none',
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 12px center'
                                    }}
                                >
                                    <option value="top-left">↖ Top Left</option>
                                    <option value="top-right">↗ Top Right</option>
                                    <option value="bottom-left">↙ Bottom Left</option>
                                    <option value="bottom-right">↘ Bottom Right</option>
                                </select>
                            </div>

                            {/* Format Selector Tabs */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                    Embed Format
                                </label>
                                <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', padding: '4px', border: '1px solid var(--border-color)' }}>
                                    {[
                                        { value: 'react', label: 'React' },
                                        { value: 'iframe', label: 'iframe' },
                                        { value: 'sdk', label: 'SDK' },
                                        { value: 'backend', label: 'API' },
                                        { value: 'react-native', label: 'RN' },
                                        { value: 'flutter', label: 'Flutter' }
                                    ].map((fmt) => (
                                        <button
                                            key={fmt.value}
                                            onClick={() => setEmbedFormat(fmt.value)}
                                            style={{
                                                flex: 1,
                                                padding: '8px 12px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '10px',
                                                fontWeight: '500',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                                background: embedFormat === fmt.value ? 'var(--accent)' : 'transparent',
                                                color: embedFormat === fmt.value ? 'var(--accent-text)' : 'var(--text-muted)',
                                                boxShadow: embedFormat === fmt.value ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                                transition: 'all 0.15s ease'
                                            }}
                                        >
                                            {fmt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Code */}
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                                        {embedFormat === 'react' ? 'React Component' :
                                            embedFormat === 'iframe' ? 'HTML Code' :
                                                embedFormat === 'sdk' ? 'SDK Script' : 'Backend API Code'}
                                    </label>
                                    <button
                                        onClick={handleCopy}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#2563eb',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {copied ? '✓ Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <pre style={{
                                    background: '#171717',
                                    color: '#a3e635',
                                    padding: '14px',
                                    borderRadius: '8px',
                                    fontSize: '11px',
                                    overflow: 'auto',
                                    margin: 0,
                                    maxHeight: '200px'
                                }}>
                                    <code>{embedCode}</code>
                                </pre>
                            </div>

                            {/* Instructions */}
                            <div style={{
                                background: '#f9fafb',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '14px',
                                fontSize: '13px',
                                color: '#4b5563'
                            }}>
                                <strong style={{ color: '#111827' }}>
                                    {embedFormat === 'react' ? 'How to integrate in React:' :
                                        embedFormat === 'iframe' ? 'How to add to HTML:' :
                                            embedFormat === 'sdk' ? 'How to use Web SDK:' :
                                                'How to use Backend API:'}
                                </strong>
                                <ol style={{ margin: '8px 0 0', paddingLeft: '18px' }}>
                                    {embedFormat === 'react' ? (
                                        <>
                                            <li>Copy the component code above</li>
                                            <li>Create <code style={{ background: '#e5e7eb', padding: '2px 4px', borderRadius: '3px' }}>ChatbotWidget.jsx</code></li>
                                            <li>Import and use <code style={{ background: '#e5e7eb', padding: '2px 4px', borderRadius: '3px' }}>&lt;ChatbotWidget /&gt;</code></li>
                                        </>
                                    ) : embedFormat === 'iframe' ? (
                                        <>
                                            <li>Copy the HTML code above</li>
                                            <li>Paste it anywhere in your HTML file</li>
                                            <li>The widget will appear on page load</li>
                                        </>
                                    ) : embedFormat === 'sdk' ? (
                                        <>
                                            <li>Copy the script tag above</li>
                                            <li>Paste before the closing <code style={{ background: '#e5e7eb', padding: '2px 4px', borderRadius: '3px' }}>&lt;/body&gt;</code> tag</li>
                                            <li>The chatbot auto-initializes on load</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>Use the API endpoints to build your own UI</li>
                                            <li>POST to <code style={{ background: '#e5e7eb', padding: '2px 4px', borderRadius: '3px' }}>/embed/{'{token}'}/query</code> for chat</li>
                                            <li>Works with React Native, Flutter, or any platform</li>
                                            <li>Rate limit: 20 requests per minute</li>
                                        </>
                                    )}
                                </ol>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
                    <button
                        onClick={onClose}
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: '#f5f5f5',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
}
