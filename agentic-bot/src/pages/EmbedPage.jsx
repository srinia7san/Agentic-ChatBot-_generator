import React, { useState, useRef, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { MessageSquare, Send, AlertCircle } from "lucide-react";

const API_BASE = "http://localhost:5000";

export default function EmbedPage() {
    const { token } = useParams();
    const [searchParams] = useSearchParams();
    const theme = searchParams.get("theme") || "light";

    const [agentInfo, setAgentInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const isDark = theme === "dark";

    // Theme-based colors
    const colors = isDark ? {
        bg: "#1a1a2e",
        surface: "#16213e",
        border: "#0f3460",
        text: "#ffffff",
        textMuted: "#a0aec0",
        primary: "#4f46e5",
        primaryHover: "#4338ca",
        userBubble: "#4f46e5",
        botBubble: "#16213e",
        inputBg: "#0f3460",
    } : {
        bg: "#f8fafc",
        surface: "#ffffff",
        border: "#e2e8f0",
        text: "#1e293b",
        textMuted: "#64748b",
        primary: "#2563eb",
        primaryHover: "#1d4ed8",
        userBubble: "#2563eb",
        botBubble: "#ffffff",
        inputBg: "#ffffff",
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch agent info on mount
    useEffect(() => {
        const fetchAgentInfo = async () => {
            try {
                const response = await fetch(`${API_BASE}/embed/${token}/info`);
                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.error || "Failed to load chatbot");
                }

                setAgentInfo(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        if (token) {
            fetchAgentInfo();
        }
    }, [token]);

    const handleSend = async () => {
        if (!input.trim() || sending) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
        setSending(true);

        try {
            const response = await fetch(`${API_BASE}/embed/${token}/query`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: userMessage }),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to get response");
            }

            setMessages((prev) => [
                ...prev,
                { role: "assistant", text: data.answer },
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", text: `Error: ${err.message}`, isError: true },
            ]);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Loading state
    if (loading) {
        return (
            <div style={{
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.bg,
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        border: `3px solid ${colors.border}`,
                        borderTopColor: colors.primary,
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        margin: "0 auto 16px",
                    }} />
                    <p style={{ color: colors.textMuted, fontSize: 14 }}>Loading chatbot...</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div style={{
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.bg,
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                padding: 24,
            }}>
                <div style={{ textAlign: "center", maxWidth: 300 }}>
                    <AlertCircle size={48} color="#ef4444" style={{ margin: "0 auto 16px" }} />
                    <h2 style={{ color: colors.text, fontSize: 18, marginBottom: 8 }}>Unable to Load</h2>
                    <p style={{ color: colors.textMuted, fontSize: 14 }}>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            backgroundColor: colors.bg,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}>
            {/* Header */}
            <div style={{
                padding: "16px 20px",
                backgroundColor: colors.surface,
                borderBottom: `1px solid ${colors.border}`,
                display: "flex",
                alignItems: "center",
                gap: 12,
            }}>
                <div style={{
                    width: 40,
                    height: 40,
                    backgroundColor: colors.primary,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <MessageSquare size={20} color="#fff" />
                </div>
                <div>
                    <h1 style={{
                        margin: 0,
                        fontSize: 16,
                        fontWeight: 600,
                        color: colors.text,
                    }}>
                        {agentInfo?.name || "AI Assistant"}
                    </h1>
                    <p style={{
                        margin: 0,
                        fontSize: 12,
                        color: colors.textMuted,
                    }}>
                        {agentInfo?.domain || "Ask me anything"}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: "auto",
                padding: 20,
            }}>
                {messages.length === 0 && (
                    <div style={{ textAlign: "center", marginTop: 40 }}>
                        <MessageSquare size={32} color={colors.textMuted} style={{ margin: "0 auto 12px" }} />
                        <p style={{ color: colors.textMuted, fontSize: 14 }}>
                            Start a conversation by typing below
                        </p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        style={{
                            display: "flex",
                            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                            marginBottom: 12,
                        }}
                    >
                        <div style={{
                            maxWidth: "80%",
                            padding: "12px 16px",
                            borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                            backgroundColor: msg.role === "user"
                                ? colors.userBubble
                                : msg.isError
                                    ? "#fee2e2"
                                    : colors.botBubble,
                            color: msg.role === "user"
                                ? "#fff"
                                : msg.isError
                                    ? "#dc2626"
                                    : colors.text,
                            fontSize: 14,
                            lineHeight: 1.5,
                            boxShadow: isDark ? "none" : "0 1px 2px rgba(0,0,0,0.05)",
                            border: msg.role === "user" ? "none" : `1px solid ${colors.border}`,
                        }}>
                            {msg.text}
                        </div>
                    </div>
                ))}

                {sending && (
                    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
                        <div style={{
                            padding: "12px 16px",
                            borderRadius: "18px 18px 18px 4px",
                            backgroundColor: colors.botBubble,
                            border: `1px solid ${colors.border}`,
                        }}>
                            <div style={{ display: "flex", gap: 4 }}>
                                {[0, 1, 2].map((i) => (
                                    <div
                                        key={i}
                                        style={{
                                            width: 8,
                                            height: 8,
                                            backgroundColor: colors.primary,
                                            borderRadius: "50%",
                                            animation: `bounce 1.4s infinite ease-in-out`,
                                            animationDelay: `${i * 0.16}s`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
                <style>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}</style>
            </div>

            {/* Input */}
            <div style={{
                padding: 16,
                backgroundColor: colors.surface,
                borderTop: `1px solid ${colors.border}`,
            }}>
                <div style={{ display: "flex", gap: 12 }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        disabled={sending}
                        style={{
                            flex: 1,
                            padding: "12px 16px",
                            borderRadius: 12,
                            border: `1px solid ${colors.border}`,
                            backgroundColor: colors.inputBg,
                            color: colors.text,
                            fontSize: 14,
                            outline: "none",
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={sending || !input.trim()}
                        style={{
                            padding: "12px 20px",
                            borderRadius: 12,
                            border: "none",
                            backgroundColor: sending || !input.trim() ? colors.border : colors.primary,
                            color: "#fff",
                            cursor: sending || !input.trim() ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontSize: 14,
                            fontWeight: 500,
                            transition: "background-color 0.2s",
                        }}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
