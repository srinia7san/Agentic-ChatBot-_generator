/**
 * ChatBubble Component
 * Message bubble component for React Native
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * ChatBubble - Individual message bubble
 */
export function ChatBubble({ message, colors, onFeedback }) {
    const isUser = message.role === 'user';
    const isError = message.isError;

    return (
        <View style={[
            styles.container,
            isUser ? styles.userContainer : styles.assistantContainer,
        ]}>
            <View style={[
                styles.bubble,
                isUser
                    ? { backgroundColor: colors.userBubbleColor }
                    : { backgroundColor: isError ? '#fee2e2' : colors.assistantBubbleColor },
            ]}>
                <Text style={[
                    styles.text,
                    isUser
                        ? { color: colors.userTextColor }
                        : { color: isError ? '#dc2626' : colors.assistantTextColor },
                ]}>
                    {message.content}
                </Text>

                {/* Timestamp */}
                <Text style={[styles.timestamp, { color: isUser ? 'rgba(255,255,255,0.7)' : '#94a3b8' }]}>
                    {formatTime(message.timestamp)}
                </Text>
            </View>

            {/* Feedback buttons (only for assistant messages) */}
            {!isUser && !isError && onFeedback && (
                <View style={styles.feedbackContainer}>
                    <TouchableOpacity
                        style={[
                            styles.feedbackButton,
                            message.feedback === 'positive' && styles.feedbackActive,
                        ]}
                        onPress={() => onFeedback('positive')}
                    >
                        <Text style={styles.feedbackIcon}>👍</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.feedbackButton,
                            message.feedback === 'negative' && styles.feedbackActive,
                        ]}
                        onPress={() => onFeedback('negative')}
                    >
                        <Text style={styles.feedbackIcon}>👎</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

/**
 * Format timestamp
 */
function formatTime(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
        maxWidth: '80%',
    },
    userContainer: {
        alignSelf: 'flex-end',
    },
    assistantContainer: {
        alignSelf: 'flex-start',
    },
    bubble: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
    },
    text: {
        fontSize: 15,
        lineHeight: 21,
    },
    timestamp: {
        fontSize: 11,
        marginTop: 4,
        textAlign: 'right',
    },
    feedbackContainer: {
        flexDirection: 'row',
        marginTop: 6,
        gap: 8,
    },
    feedbackButton: {
        padding: 4,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
    },
    feedbackActive: {
        backgroundColor: '#dbeafe',
    },
    feedbackIcon: {
        fontSize: 14,
    },
});
