/**
 * AgenticChatbot Component
 * Main chatbot component for React Native
 */

import React from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Text,
    TouchableOpacity,
} from 'react-native';
import { useAgenticChat } from '../hooks/useAgenticChat';
import { ChatBubble } from './ChatBubble';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';

const DEFAULT_THEME = {
    light: {
        backgroundColor: '#ffffff',
        headerBackground: '#000000',
        headerText: '#ffffff',
        userBubbleColor: '#000000',
        userTextColor: '#ffffff',
        assistantBubbleColor: '#f5f5f5',
        assistantTextColor: '#000000',
        inputBackground: '#fafafa',
        inputBorder: '#e5e5e5',
        primaryColor: '#000000',
    },
    dark: {
        backgroundColor: '#000000',
        headerBackground: '#000000',
        headerText: '#ffffff',
        userBubbleColor: '#ffffff',
        userTextColor: '#000000',
        assistantBubbleColor: '#141414',
        assistantTextColor: '#ffffff',
        inputBackground: '#0a0a0a',
        inputBorder: '#262626',
        primaryColor: '#ffffff',
    },
};

/**
 * AgenticChatbot - Full chatbot component
 */
export function AgenticChatbot({
    token,
    apiUrl = 'http://localhost:5000/v1',
    theme = 'light',
    customTheme = {},
    onMessageSent,
    onMessageReceived,
    onError,
    placeholder = 'Type a message...',
    showHeader = true,
    headerTitle,
}) {
    const colors = { ...DEFAULT_THEME[theme], ...customTheme };

    const {
        messages,
        isTyping,
        agentInfo,
        config,
        loading,
        sendMessage,
        submitFeedback,
    } = useAgenticChat({
        token,
        apiUrl,
        onMessageSent,
        onMessageReceived,
        onError,
    });

    const flatListRef = React.useRef(null);

    // Scroll to bottom when new messages arrive
    React.useEffect(() => {
        if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const renderMessage = ({ item }) => (
        <ChatBubble
            message={item}
            colors={colors}
            onFeedback={(type) => submitFeedback(item.id, type)}
        />
    );

    const displayTitle = headerTitle || agentInfo?.agent_name || 'AI Assistant';
    const displayPlaceholder = config?.ui_hints?.placeholder || placeholder;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
            {/* Header */}
            {showHeader && (
                <View style={[styles.header, { backgroundColor: colors.headerBackground }]}>
                    <View style={styles.headerDot} />
                    <Text style={[styles.headerTitle, { color: colors.headerText }]}>
                        {displayTitle}
                    </Text>
                </View>
            )}

            {/* Messages */}
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messageList}
                    showsVerticalScrollIndicator={false}
                />

                {/* Typing Indicator */}
                {isTyping && <TypingIndicator colors={colors} />}

                {/* Input */}
                <ChatInput
                    onSend={sendMessage}
                    placeholder={displayPlaceholder}
                    colors={colors}
                    disabled={loading}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 12,
        paddingBottom: 12,
    },
    headerDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#4ade80',
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    messageList: {
        padding: 16,
        paddingBottom: 8,
    },
});
