/**
 * useAgenticChat Hook
 * Manages chat state and message history
 */

import { useState, useCallback, useEffect } from 'react';
import { useAgenticAPI } from './useAgenticAPI';

/**
 * Generate unique message ID
 */
const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Hook for managing chat state
 * @param {Object} config - Configuration object
 * @param {string} config.token - Embed token
 * @param {string} config.apiUrl - API base URL
 * @param {Function} config.onMessageSent - Callback when message sent
 * @param {Function} config.onMessageReceived - Callback when response received
 * @param {Function} config.onError - Callback on error
 */
export function useAgenticChat({
    token,
    apiUrl,
    onMessageSent,
    onMessageReceived,
    onError,
}) {
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [agentInfo, setAgentInfo] = useState(null);
    const [config, setConfig] = useState(null);

    const api = useAgenticAPI(token, apiUrl);

    /**
     * Initialize - load config and agent info
     */
    useEffect(() => {
        const init = async () => {
            try {
                const [configData, infoData] = await Promise.all([
                    api.getConfig(),
                    api.getAgentInfo(),
                ]);
                setConfig(configData);
                setAgentInfo(infoData);

                // Add welcome message if available
                if (configData?.ui_hints?.welcome_message) {
                    setMessages([{
                        id: generateId(),
                        role: 'assistant',
                        content: configData.ui_hints.welcome_message,
                        timestamp: new Date(),
                    }]);
                }

                // Track widget open
                api.trackEvent('widget_open');
            } catch (err) {
                console.error('Failed to initialize chat:', err);
                onError?.(err);
            }
        };

        init();

        // Track widget close on unmount
        return () => {
            api.trackEvent('widget_close');
        };
    }, [token, apiUrl]);

    /**
     * Send a message
     */
    const sendMessage = useCallback(async (content) => {
        if (!content.trim()) return;

        // Create user message
        const userMessage = {
            id: generateId(),
            role: 'user',
            content: content.trim(),
            timestamp: new Date(),
        };

        // Add to messages
        setMessages(prev => [...prev, userMessage]);
        onMessageSent?.(userMessage);

        // Show typing indicator
        setIsTyping(true);

        try {
            // Send to API
            const result = await api.sendQuery(content);

            // Create assistant message
            const assistantMessage = {
                id: generateId(),
                role: 'assistant',
                content: result.data?.answer || result.answer,
                timestamp: new Date(),
                metadata: {
                    response_time_ms: result.metadata?.response_time_ms,
                    tokens_used: result.metadata?.tokens_used,
                    request_id: result.request_id,
                },
            };

            setMessages(prev => [...prev, assistantMessage]);
            onMessageReceived?.(assistantMessage);

            // Track message sent
            api.trackEvent('message_sent', { message_id: userMessage.id });

        } catch (err) {
            // Add error message
            const errorMessage = {
                id: generateId(),
                role: 'assistant',
                content: `Sorry, I encountered an error: ${err.message}`,
                timestamp: new Date(),
                isError: true,
            };

            setMessages(prev => [...prev, errorMessage]);
            onError?.(err);
        } finally {
            setIsTyping(false);
        }
    }, [api, onMessageSent, onMessageReceived, onError]);

    /**
     * Submit feedback for a message
     */
    const submitFeedback = useCallback(async (messageId, type, comment = '') => {
        try {
            await api.submitFeedback(messageId, type, comment);

            // Update message with feedback
            setMessages(prev => prev.map(msg =>
                msg.id === messageId
                    ? { ...msg, feedback: type }
                    : msg
            ));
        } catch (err) {
            console.error('Failed to submit feedback:', err);
        }
    }, [api]);

    /**
     * Clear chat history
     */
    const clearChat = useCallback(() => {
        setMessages([]);

        // Re-add welcome message if available
        if (config?.ui_hints?.welcome_message) {
            setMessages([{
                id: generateId(),
                role: 'assistant',
                content: config.ui_hints.welcome_message,
                timestamp: new Date(),
            }]);
        }
    }, [config]);

    return {
        messages,
        isTyping,
        agentInfo,
        config,
        loading: api.loading,
        error: api.error,
        sendMessage,
        submitFeedback,
        clearChat,
    };
}
