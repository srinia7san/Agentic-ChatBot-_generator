/**
 * useAgenticAPI Hook
 * Handles API communication with the Agentic backend
 */

import { useState, useCallback } from 'react';

const DEFAULT_API_URL = 'http://localhost:5000/v1';

/**
 * Hook for making API calls to Agentic backend
 * @param {string} token - Embed token
 * @param {string} apiUrl - API base URL
 */
export function useAgenticAPI(token, apiUrl = DEFAULT_API_URL) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Send a query to the chatbot
     */
    const sendQuery = useCallback(async (query, conversationId = null) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${apiUrl}/embed/${token}/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    conversation_id: conversationId,
                }),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error?.message || 'Query failed');
            }

            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [token, apiUrl]);

    /**
     * Get widget configuration
     */
    const getConfig = useCallback(async () => {
        try {
            const response = await fetch(`${apiUrl}/embed/${token}/config`);
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error?.message || 'Failed to get config');
            }

            return result.data?.config || result.config;
        } catch (err) {
            setError(err);
            throw err;
        }
    }, [token, apiUrl]);

    /**
     * Get agent info
     */
    const getAgentInfo = useCallback(async () => {
        try {
            const response = await fetch(`${apiUrl}/embed/${token}/info`);
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error?.message || 'Failed to get agent info');
            }

            return result;
        } catch (err) {
            setError(err);
            throw err;
        }
    }, [token, apiUrl]);

    /**
     * Submit feedback for a message
     */
    const submitFeedback = useCallback(async (messageId, type, comment = '') => {
        try {
            const response = await fetch(`${apiUrl}/embed/${token}/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message_id: messageId,
                    type, // 'positive' or 'negative'
                    comment,
                }),
            });

            const result = await response.json();
            return result;
        } catch (err) {
            setError(err);
            throw err;
        }
    }, [token, apiUrl]);

    /**
     * Track analytics event
     */
    const trackEvent = useCallback(async (event, data = {}) => {
        try {
            await fetch(`${apiUrl}/embed/${token}/analytics`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ event, data }),
            });
        } catch (err) {
            // Silently fail for analytics
            console.warn('Analytics tracking failed:', err);
        }
    }, [token, apiUrl]);

    return {
        loading,
        error,
        sendQuery,
        getConfig,
        getAgentInfo,
        submitFeedback,
        trackEvent,
    };
}
