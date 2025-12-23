// API Service for communicating with Flask backend
const API_BASE = '/api';

// Helper to get auth header
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Fetch all agents from the backend (filtered by authenticated user)
 */
export async function fetchAgents() {
    const response = await fetch(`${API_BASE}/agents`, {
        headers: {
            ...getAuthHeader(),
        },
    });

    if (response.status === 401) {
        throw new Error('Please login to view agents');
    }

    if (!response.ok) {
        throw new Error('Failed to fetch agents');
    }
    const data = await response.json();
    return data.agents || [];
}

/**
 * Get a specific agent's information
 */
export async function getAgent(agentName) {
    const response = await fetch(`${API_BASE}/agents/${encodeURIComponent(agentName)}`, {
        headers: {
            ...getAuthHeader(),
        },
    });

    if (response.status === 401) {
        throw new Error('Please login to view agent');
    }

    if (!response.ok) {
        throw new Error('Agent not found');
    }
    const data = await response.json();
    return data.agent;
}

/**
 * Create a new agent with PDF files
 */
export async function createAgent(agentName, domain, description, files) {
    const formData = new FormData();
    formData.append('agent_name', agentName);
    formData.append('domain', domain);
    formData.append('description', description);

    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }

    const response = await fetch(`${API_BASE}/agents/create`, {
        method: 'POST',
        headers: {
            ...getAuthHeader(),
        },
        body: formData,
    });

    if (response.status === 401) {
        throw new Error('Please login to create agent');
    }

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to create agent');
    }
    return data;
}

/**
 * Create a new agent from various data sources (CSV, Word, SQL, NoSQL)
 */
export async function createAgentFromSource(agentName, domain, description, sourceType, sourceConfig) {
    const formData = new FormData();
    formData.append('agent_name', agentName);
    formData.append('domain', domain);
    formData.append('description', description);
    formData.append('source_type', sourceType);

    // Handle file-based sources
    if (['csv', 'word'].includes(sourceType) && sourceConfig.files) {
        for (let i = 0; i < sourceConfig.files.length; i++) {
            formData.append('files', sourceConfig.files[i]);
        }
    }

    // Handle SQL source
    if (sourceType === 'sql') {
        formData.append('connection_string', sourceConfig.connection_string || '');
        if (sourceConfig.tables) {
            formData.append('tables', JSON.stringify(sourceConfig.tables));
        }
        formData.append('sample_limit', String(sourceConfig.sample_limit || 1000));
    }

    // Handle NoSQL source
    if (sourceType === 'nosql') {
        formData.append('connection_string', sourceConfig.connection_string || '');
        formData.append('database', sourceConfig.database || '');
        if (sourceConfig.collections) {
            formData.append('collections', JSON.stringify(sourceConfig.collections));
        }
        formData.append('sample_limit', String(sourceConfig.sample_limit || 1000));
    }

    const response = await fetch(`${API_BASE}/agents/create-from-source`, {
        method: 'POST',
        headers: {
            ...getAuthHeader(),
        },
        body: formData,
    });

    if (response.status === 401) {
        throw new Error('Please login to create agent');
    }

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to create agent');
    }
    return data;
}

/**
 * Update an existing agent with more data
 */
export async function updateAgentData(agentName, sourceType, sourceConfig) {
    const formData = new FormData();
    formData.append('source_type', sourceType);

    // Handle file-based sources
    if (['pdf', 'csv', 'word'].includes(sourceType) && sourceConfig.files) {
        for (let i = 0; i < sourceConfig.files.length; i++) {
            formData.append('files', sourceConfig.files[i]);
        }
    }

    // Handle SQL source
    if (sourceType === 'sql') {
        formData.append('connection_string', sourceConfig.connection_string || '');
        if (sourceConfig.tables) {
            formData.append('tables', JSON.stringify(sourceConfig.tables));
        }
        formData.append('sample_limit', String(sourceConfig.sample_limit || 1000));
    }

    // Handle NoSQL source
    if (sourceType === 'nosql') {
        formData.append('connection_string', sourceConfig.connection_string || '');
        formData.append('database', sourceConfig.database || '');
        if (sourceConfig.collections) {
            formData.append('collections', JSON.stringify(sourceConfig.collections));
        }
        formData.append('sample_limit', String(sourceConfig.sample_limit || 1000));
    }

    const response = await fetch(`${API_BASE}/agents/${encodeURIComponent(agentName)}/update`, {
        method: 'POST',
        headers: {
            ...getAuthHeader(),
        },
        body: formData,
    });

    if (response.status === 401) {
        throw new Error('Please login to update agent');
    }

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to update agent');
    }
    return data;
}

/**
 * Query an agent with a question
 */
export async function queryAgent(agentName, query, k = 4) {
    const response = await fetch(`${API_BASE}/agents/${encodeURIComponent(agentName)}/query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        body: JSON.stringify({ query, k }),
    });

    if (response.status === 401) {
        throw new Error('Please login to query agent');
    }

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to query agent');
    }
    return data;
}

/**
 * Delete an agent
 */
export async function deleteAgent(agentName) {
    const response = await fetch(`${API_BASE}/agents/${encodeURIComponent(agentName)}`, {
        method: 'DELETE',
        headers: {
            ...getAuthHeader(),
        },
    });

    if (response.status === 401) {
        throw new Error('Please login to delete agent');
    }

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to delete agent');
    }
    return data;
}

/**
 * Generate embed token for an agent
 */
export async function generateEmbedToken(agentName) {
    const response = await fetch(`${API_BASE}/agents/${encodeURIComponent(agentName)}/embed-token`, {
        method: 'POST',
        headers: {
            ...getAuthHeader(),
        },
    });

    if (response.status === 401) {
        throw new Error('Please login to generate embed token');
    }

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to generate embed token');
    }
    return data;
}

/**
 * Check if the backend is healthy
 */
export async function checkHealth() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        if (!response.ok) return false;
        const data = await response.json();
        return data.status === 'healthy';
    } catch {
        return false;
    }
}

/**
 * Check if auth server is healthy
 */
export async function checkAuthHealth() {
    try {
        const response = await fetch('/auth/health');
        if (!response.ok) return false;
        const data = await response.json();
        return data.status === 'healthy';
    } catch {
        return false;
    }
}

/**
 * Get current user's token usage stats
 */
export async function getUserStats() {
    const response = await fetch(`${API_BASE}/user/stats`, {
        headers: {
            ...getAuthHeader(),
        },
    });

    if (response.status === 401) {
        throw new Error('Please login to view stats');
    }

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stats');
    }
    return data.stats || {};
}

// ==================== ADMIN API FUNCTIONS ====================

/**
 * Get all users with token usage (admin only)
 */
export async function getAdminUsers() {
    const response = await fetch(`${API_BASE}/admin/users`, {
        headers: {
            ...getAuthHeader(),
        },
    });

    if (response.status === 401) {
        throw new Error('Please login to access admin panel');
    }

    if (response.status === 403) {
        throw new Error('Admin access required');
    }

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
    }
    return data.users || [];
}

/**
 * Get aggregated token usage statistics (admin only)
 */
export async function getAdminUsage() {
    const response = await fetch(`${API_BASE}/admin/usage`, {
        headers: {
            ...getAuthHeader(),
        },
    });

    if (response.status === 401) {
        throw new Error('Please login to access admin panel');
    }

    if (response.status === 403) {
        throw new Error('Admin access required');
    }

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch usage');
    }
    return data;
}

/**
 * Get detailed token usage for a specific user (admin only)
 */
export async function getAdminUserUsage(userId, limit = 50) {
    const response = await fetch(`${API_BASE}/admin/usage/${userId}?limit=${limit}`, {
        headers: {
            ...getAuthHeader(),
        },
    });

    if (response.status === 401) {
        throw new Error('Please login to access admin panel');
    }

    if (response.status === 403) {
        throw new Error('Admin access required');
    }

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user usage');
    }
    return data.queries || [];
}
