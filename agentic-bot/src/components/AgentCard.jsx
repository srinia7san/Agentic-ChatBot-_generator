import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAgent } from "../context/AgentContext";
import EmbedModal from "./EmbedModal";

export default function AgentCard({ agent }) {
  const navigate = useNavigate();
  const { removeAgent } = useAgent();
  const [showEmbed, setShowEmbed] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${agent.name}"?`)) {
      try {
        await removeAgent(agent.name);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleEmbed = (e) => {
    e.stopPropagation();
    setShowEmbed(true);
  };

  const handleUpdate = (e) => {
    e.stopPropagation();
    navigate(`/update-agent/${encodeURIComponent(agent.name)}`);
  };

  const cardStyle = {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    padding: '24px',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease',
  };

  const labelStyle = {
    fontSize: '10px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--text-muted)',
  };

  const actionBtnStyle = {
    fontSize: '11px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    padding: '6px 12px',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  };

  return (
    <>
      <div
        onClick={() => navigate(`/chat/${encodeURIComponent(agent.name)}`)}
        style={cardStyle}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--text-muted)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
      >
        {/* Header */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '500',
                color: 'var(--text-primary)',
                marginBottom: '4px',
              }}>
                {agent.name}
              </h3>
              <span style={labelStyle}>
                {agent.domain || "General"}
              </span>
            </div>
            {agent.embed_token && (
              <span style={{
                ...labelStyle,
                padding: '4px 8px',
                border: '1px solid var(--border-color)',
              }}>
                Embedded
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          marginBottom: '20px',
          lineHeight: '1.6',
        }}>
          {agent.description || "No description"}
        </p>

        {/* Meta */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '20px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--border-light)',
        }}>
          <span style={labelStyle}>
            {agent.num_documents || 0} chunks
          </span>
          <span style={labelStyle}>
            {(agent.source_type || 'pdf').toUpperCase()}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={handleUpdate}
              style={actionBtnStyle}
              onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
            >
              Update
            </button>
            <button
              onClick={handleEmbed}
              style={actionBtnStyle}
              onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
            >
              Embed
            </button>
            <button
              onClick={handleDelete}
              style={actionBtnStyle}
              onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
            >
              Delete
            </button>
          </div>
          <span style={{
            fontSize: '11px',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-primary)',
          }}>
            Open →
          </span>
        </div>
      </div>

      {showEmbed && (
        <EmbedModal agent={agent} onClose={() => setShowEmbed(false)} />
      )}
    </>
  );
}
