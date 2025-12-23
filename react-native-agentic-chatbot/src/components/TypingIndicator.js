/**
 * TypingIndicator Component
 * Animated typing dots for React Native
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

/**
 * TypingIndicator - Animated typing dots
 */
export function TypingIndicator({ colors }) {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animate = (dot, delay) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dot, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        const animation1 = animate(dot1, 0);
        const animation2 = animate(dot2, 150);
        const animation3 = animate(dot3, 300);

        animation1.start();
        animation2.start();
        animation3.start();

        return () => {
            animation1.stop();
            animation2.stop();
            animation3.stop();
        };
    }, []);

    const translateY = (animValue) =>
        animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -6],
        });

    return (
        <View style={styles.container}>
            <View style={[styles.bubble, { backgroundColor: colors.assistantBubbleColor }]}>
                <Animated.View
                    style={[
                        styles.dot,
                        { backgroundColor: colors.primaryColor, transform: [{ translateY: translateY(dot1) }] },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.dot,
                        { backgroundColor: colors.primaryColor, transform: [{ translateY: translateY(dot2) }] },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.dot,
                        { backgroundColor: colors.primaryColor, transform: [{ translateY: translateY(dot3) }] },
                    ]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingBottom: 8,
        alignSelf: 'flex-start',
    },
    bubble: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 18,
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});
