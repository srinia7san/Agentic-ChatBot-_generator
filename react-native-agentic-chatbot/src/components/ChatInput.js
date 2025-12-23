/**
 * ChatInput Component
 * Text input with send button for React Native
 */

import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';

/**
 * ChatInput - Message input component
 */
export function ChatInput({ onSend, placeholder, colors, disabled }) {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (text.trim() && !disabled) {
            onSend(text.trim());
            setText('');
        }
    };

    return (
        <View style={[
            styles.container,
            { backgroundColor: colors.inputBackground, borderTopColor: colors.inputBorder }
        ]}>
            <TextInput
                style={[
                    styles.input,
                    { backgroundColor: colors.backgroundColor, borderColor: colors.inputBorder }
                ]}
                value={text}
                onChangeText={setText}
                placeholder={placeholder}
                placeholderTextColor="#94a3b8"
                multiline
                maxLength={2000}
                editable={!disabled}
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
            />
            <TouchableOpacity
                style={[
                    styles.sendButton,
                    { backgroundColor: text.trim() ? colors.primaryColor : '#cbd5e1' }
                ]}
                onPress={handleSend}
                disabled={!text.trim() || disabled}
            >
                <Text style={styles.sendIcon}>➤</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 12,
        paddingBottom: 16,
        alignItems: 'flex-end',
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        marginRight: 10,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendIcon: {
        color: '#ffffff',
        fontSize: 18,
        marginLeft: 2,
    },
});
