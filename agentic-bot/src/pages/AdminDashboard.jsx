import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { getAdminUsers, getAdminUsage } from "../api";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [totals, setTotals] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedUser, setExpandedUser] = useState(null);

    useEffect(() => {
        if (user && !user.isAdmin) {
            navigate("/home");
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [usersData, usageData] = await Promise.all([
                    getAdminUsers(),
                    getAdminUsage()
                ]);

                setUsers(usersData);
                setTotals(usageData.totals);
            } catch (err) {
                setError(err.message);
                if (err.message.includes("Admin access required")) {
                    navigate("/home");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, navigate]);

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
        if (num >= 1000) return (num / 1000).toFixed(1) + "K";
        return num?.toString() || "0";
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    const statCardStyle = {
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        padding: '24px',
    };

    const statLabelStyle = {
        fontSize: '10px',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--text-muted)',
        marginBottom: '8px',
    };

    const statValueStyle = {
        fontSize: '28px',
        fontWeight: '300',
        color: 'var(--text-primary)',
    };

    const thStyle = {
        padding: '12px 16px',
        textAlign: 'left',
        fontSize: '10px',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--text-muted)',
        borderBottom: '1px solid var(--border-color)',
    };

    const tdStyle = {
        padding: '16px',
        fontSize: '13px',
        color: 'var(--text-primary)',
        borderBottom: '1px solid var(--border-light)',
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
                <Navbar />
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
                    <div className="animate-pulse" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ height: '32px', width: '200px', backgroundColor: 'var(--bg-tertiary)' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1px', backgroundColor: 'var(--border-color)' }}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} style={{ height: '100px', backgroundColor: 'var(--bg-primary)' }} />
                            ))}
                        </div>
                        <div style={{ height: '400px', backgroundColor: 'var(--bg-tertiary)' }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
            <Navbar />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
                {/* Header */}
                <div style={{ marginBottom: '48px' }}>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: '300',
                        letterSpacing: '-0.02em',
                        color: 'var(--text-primary)',
                        marginBottom: '8px',
                    }}>
                        Admin Dashboard
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        Monitor token usage across all users
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        marginBottom: '32px',
                        padding: '16px',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                    }}>
                        {error}
                    </div>
                )}

                {/* Stats Cards */}
                {totals && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1px', backgroundColor: 'var(--border-color)', marginBottom: '48px' }}>
                        <div style={statCardStyle}>
                            <p style={statLabelStyle}>Users</p>
                            <p style={statValueStyle}>{users.length}</p>
                        </div>
                        <div style={statCardStyle}>
                            <p style={statLabelStyle}>Bots</p>
                            <p style={statValueStyle}>{totals.total_bots || 0}</p>
                        </div>
                        <div style={statCardStyle}>
                            <p style={statLabelStyle}>Queries</p>
                            <p style={statValueStyle}>{formatNumber(totals.total_queries)}</p>
                        </div>
                        <div style={statCardStyle}>
                            <p style={statLabelStyle}>Prompt Tokens</p>
                            <p style={statValueStyle}>{formatNumber(totals.total_prompt_tokens)}</p>
                        </div>
                        <div style={statCardStyle}>
                            <p style={statLabelStyle}>Total Tokens</p>
                            <p style={statValueStyle}>{formatNumber(totals.total_tokens)}</p>
                        </div>
                    </div>
                )}

                {/* Users Table */}
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '24px'
                    }}>
                        <h2 style={{
                            fontSize: '12px',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: 'var(--text-secondary)',
                        }}>
                            User Token Usage
                        </h2>
                    </div>

                    <div style={{ border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                    <th style={thStyle}>User</th>
                                    <th style={thStyle}>Bots</th>
                                    <th style={thStyle}>Queries</th>
                                    <th style={thStyle}>Prompt</th>
                                    <th style={thStyle}>Completion</th>
                                    <th style={thStyle}>Total</th>
                                    <th style={thStyle}>Last Query</th>
                                    <th style={{ ...thStyle, width: '40px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <React.Fragment key={u.id}>
                                        <tr>
                                            <td style={tdStyle}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontWeight: '500' }}>{u.name}</span>
                                                        {u.isAdmin && (
                                                            <span style={{
                                                                fontSize: '9px',
                                                                fontWeight: '500',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.05em',
                                                                padding: '2px 6px',
                                                                border: '1px solid var(--border-color)',
                                                                color: 'var(--text-muted)',
                                                            }}>
                                                                Admin
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</span>
                                                </div>
                                            </td>
                                            <td style={tdStyle}>{u.bot_count || 0}</td>
                                            <td style={tdStyle}>{formatNumber(u.token_usage?.total_queries || 0)}</td>
                                            <td style={tdStyle}>{formatNumber(u.token_usage?.total_prompt_tokens || 0)}</td>
                                            <td style={tdStyle}>{formatNumber(u.token_usage?.total_completion_tokens || 0)}</td>
                                            <td style={{ ...tdStyle, fontWeight: '500' }}>
                                                {formatNumber(u.token_usage?.total_tokens || 0)}
                                            </td>
                                            <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>
                                                {formatDate(u.token_usage?.last_query)}
                                            </td>
                                            <td style={tdStyle}>
                                                <button
                                                    onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: 'var(--text-muted)',
                                                        fontSize: '12px',
                                                    }}
                                                >
                                                    {expandedUser === u.id ? '−' : '+'}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedUser === u.id && (
                                            <tr>
                                                <td colSpan={8} style={{
                                                    padding: '16px',
                                                    backgroundColor: 'var(--bg-secondary)',
                                                    borderBottom: '1px solid var(--border-color)',
                                                }}>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                        <p style={{ marginBottom: '4px' }}>
                                                            <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px' }}>User ID: </span>
                                                            {u.id}
                                                        </p>
                                                        <p>
                                                            <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px' }}>Created: </span>
                                                            {formatDate(u.createdAt)}
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={8} style={{
                                            padding: '48px',
                                            textAlign: 'center',
                                            color: 'var(--text-muted)',
                                            fontSize: '13px',
                                        }}>
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
