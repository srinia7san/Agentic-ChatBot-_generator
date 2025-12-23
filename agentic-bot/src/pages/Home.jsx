import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import { useAgent } from "../context/AgentContext";
import { useAuth } from "../context/AuthContext";
import AgentCard from "../components/AgentCard";
import { AgentCardSkeleton } from "../components/Skeleton";
import { checkHealth, getUserStats } from "../api";

export default function Home() {
  const { agents, loading, error, refreshAgents } = useAgent();
  const { user } = useAuth();
  const [backendStatus, setBackendStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name"); // 'name', 'date', 'documents'
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    const checkServers = async () => {
      const healthy = await checkHealth();
      setBackendStatus(healthy);
    };
    checkServers();

    // Fetch user stats
    const fetchStats = async () => {
      try {
        const stats = await getUserStats();
        setUserStats(stats);
      } catch (err) {
        console.error('Failed to fetch user stats:', err);
      }
    };
    fetchStats();
  }, []);

  // Filter and sort agents
  const filteredAgents = useMemo(() => {
    let result = [...agents];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(agent =>
        agent.name?.toLowerCase().includes(query) ||
        agent.domain?.toLowerCase().includes(query) ||
        agent.description?.toLowerCase().includes(query) ||
        agent.source_type?.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'documents':
          return (b.num_documents || 0) - (a.num_documents || 0);
        case 'name':
        default:
          return (a.name || '').localeCompare(b.name || '');
      }
    });

    return result;
  }, [agents, searchQuery, sortBy]);

  const statCardStyle = {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    padding: '24px',
  };

  const statLabelStyle = {
    fontSize: '11px',
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

  const inputStyle = {
    padding: '10px 14px',
    fontSize: '13px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    outline: 'none',
    minWidth: '200px',
  };

  const selectStyle = {
    padding: '10px 14px',
    fontSize: '11px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)',
    outline: 'none',
    cursor: 'pointer',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '300',
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}>
            Welcome, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Manage your AI agents
          </p>
        </div>

        {/* Status Banner */}
        {backendStatus === false && (
          <div style={{
            marginBottom: '32px',
            padding: '16px 20px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <p style={{ fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Backend offline
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Start the Flask server to continue
              </p>
            </div>
            <button
              onClick={() => checkHealth().then(setBackendStatus)}
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
              Retry
            </button>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1px', backgroundColor: 'var(--border-color)', marginBottom: '48px' }}>
          <div style={statCardStyle}>
            <p style={statLabelStyle}>Agents</p>
            <p style={statValueStyle}>{agents.length}</p>
          </div>
          <div style={statCardStyle}>
            <p style={statLabelStyle}>Documents</p>
            <p style={statValueStyle}>
              {agents.reduce((acc, a) => acc + (a.num_documents || 0), 0)}
            </p>
          </div>
          <div style={statCardStyle}>
            <p style={statLabelStyle}>Queries</p>
            <p style={statValueStyle}>
              {userStats?.total_queries || 0}
            </p>
          </div>
          <div style={statCardStyle}>
            <p style={statLabelStyle}>Tokens Used</p>
            <p style={statValueStyle}>
              {userStats?.total_tokens ? (userStats.total_tokens >= 1000 ? `${(userStats.total_tokens / 1000).toFixed(1)}K` : userStats.total_tokens) : 0}
            </p>
          </div>
          <div style={statCardStyle}>
            <p style={statLabelStyle}>Status</p>
            <p style={statValueStyle}>
              {backendStatus === null ? "—" : backendStatus ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Agents Section Header with Search */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          gap: '16px',
        }}>
          <h2 style={{
            fontSize: '12px',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-secondary)',
          }}>
            Your Agents {filteredAgents.length !== agents.length && `(${filteredAgents.length})`}
          </h2>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={inputStyle}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={selectStyle}
            >
              <option value="name">Name</option>
              <option value="date">Recent</option>
              <option value="documents">Documents</option>
            </select>
            <button
              onClick={refreshAgents}
              style={{
                padding: '10px 16px',
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
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '13px',
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <AgentCardSkeleton />
            <AgentCardSkeleton />
            <AgentCardSkeleton />
          </div>
        ) : agents.length === 0 ? (
          <div style={{
            border: '1px solid var(--border-color)',
            padding: '64px',
            textAlign: 'center',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '400',
              color: 'var(--text-primary)',
              marginBottom: '8px'
            }}>
              No agents yet
            </h3>
            <p style={{
              color: 'var(--text-muted)',
              marginBottom: '32px',
              fontSize: '14px'
            }}>
              Create your first AI agent by uploading documents.
            </p>
            <button
              onClick={() => window.location.href = '/create-agent'}
              style={{
                padding: '12px 24px',
                fontSize: '12px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                background: 'var(--accent)',
                border: '1px solid var(--accent)',
                color: 'var(--accent-text)',
                cursor: 'pointer',
              }}
            >
              Create Agent
            </button>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div style={{
            border: '1px solid var(--border-color)',
            padding: '48px',
            textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              No agents match "{searchQuery}"
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {filteredAgents.map((agent) => (
              <AgentCard key={agent.id || agent.name} agent={agent} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
