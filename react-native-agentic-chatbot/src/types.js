/**
 * TypeScript type definitions for React Native Agentic Chatbot SDK
 */

export interface AgenticConfig {
    /** Embed token from your dashboard */
    token: string;
    /** API base URL (default: http://localhost:5000/v1) */
    apiUrl?: string;
    /** Theme: 'light' or 'dark' */
    theme?: 'light' | 'dark';
}

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    metadata?: MessageMetadata;
}

export interface MessageMetadata {
    response_time_ms?: number;
    tokens_used?: number;
    sources_count?: number;
    request_id?: string;
}

export interface ChatTheme {
    primaryColor?: string;
    backgroundColor?: string;
    userBubbleColor?: string;
    assistantBubbleColor?: string;
    textColor?: string;
    inputBackgroundColor?: string;
    fontFamily?: string;
}

export interface AgenticChatbotProps {
    /** Embed token */
    token: string;
    /** API URL (default: http://localhost:5000/v1) */
    apiUrl?: string;
    /** Color theme */
    theme?: 'light' | 'dark';
    /** Custom theme overrides */
    customTheme?: ChatTheme;
    /** Callback when message is sent */
    onMessageSent?: (message: Message) => void;
    /** Callback when response is received */
    onMessageReceived?: (message: Message) => void;
    /** Callback on error */
    onError?: (error: Error) => void;
    /** Custom placeholder text */
    placeholder?: string;
    /** Show/hide header */
    showHeader?: boolean;
    /** Custom header title */
    headerTitle?: string;
}

export interface APIResponse<T = any> {
    success: boolean;
    data: T | null;
    metadata: Record<string, any>;
    error: { code: string; message: string } | null;
    request_id: string;
    timestamp: string;
    api_version: string;
}

export interface QueryResponse {
    answer: string;
    agent_name: string;
}

export interface ConfigResponse {
    agent: {
        name: string;
        domain: string;
        description: string;
    };
    features: {
        streaming: boolean;
        file_upload: boolean;
        feedback: boolean;
    };
    rate_limit: {
        limit: number;
        remaining: number;
        window_seconds: number;
    };
    ui_hints: {
        placeholder: string;
        welcome_message: string;
    };
}
