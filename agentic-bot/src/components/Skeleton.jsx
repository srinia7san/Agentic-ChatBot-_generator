import React from "react";

export function Skeleton({ className = "", variant = "text" }) {
    const baseStyle = {
        backgroundColor: 'var(--bg-tertiary)',
        animation: 'pulse 1.5s ease-in-out infinite',
    };

    const variants = {
        text: { height: '16px', width: '100%' },
        title: { height: '20px', width: '75%' },
        avatar: { height: '48px', width: '48px' },
        card: { height: '128px', width: '100%' },
        button: { height: '40px', width: '96px' },
    };

    const variantStyle = variants[variant] || variants.text;

    return (
        <div
            style={{ ...baseStyle, ...variantStyle }}
            className={`animate-pulse ${className}`}
        />
    );
}

export function AgentCardSkeleton() {
    return (
        <div style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            padding: '24px',
        }}>
            <div style={{ marginBottom: '16px' }}>
                <div style={{
                    height: '20px',
                    width: '60%',
                    backgroundColor: 'var(--bg-tertiary)',
                    marginBottom: '8px',
                }} className="animate-pulse" />
                <div style={{
                    height: '12px',
                    width: '30%',
                    backgroundColor: 'var(--bg-tertiary)',
                }} className="animate-pulse" />
            </div>
            <div style={{
                height: '14px',
                width: '100%',
                backgroundColor: 'var(--bg-tertiary)',
                marginBottom: '8px',
            }} className="animate-pulse" />
            <div style={{
                height: '14px',
                width: '70%',
                backgroundColor: 'var(--bg-tertiary)',
                marginBottom: '20px',
            }} className="animate-pulse" />
            <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '20px',
                paddingBottom: '20px',
                borderBottom: '1px solid var(--border-light)',
            }}>
                <div style={{
                    height: '12px',
                    width: '60px',
                    backgroundColor: 'var(--bg-tertiary)',
                }} className="animate-pulse" />
                <div style={{
                    height: '12px',
                    width: '40px',
                    backgroundColor: 'var(--bg-tertiary)',
                }} className="animate-pulse" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{
                        height: '24px',
                        width: '60px',
                        backgroundColor: 'var(--bg-tertiary)',
                    }} className="animate-pulse" />
                    <div style={{
                        height: '24px',
                        width: '60px',
                        backgroundColor: 'var(--bg-tertiary)',
                    }} className="animate-pulse" />
                </div>
                <div style={{
                    height: '16px',
                    width: '50px',
                    backgroundColor: 'var(--bg-tertiary)',
                }} className="animate-pulse" />
            </div>
        </div>
    );
}

export function ChatMessageSkeleton() {
    return (
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
                maxWidth: '70%',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                padding: '16px',
            }}>
                <div style={{
                    height: '14px',
                    width: '200px',
                    backgroundColor: 'var(--bg-tertiary)',
                    marginBottom: '8px',
                }} className="animate-pulse" />
                <div style={{
                    height: '14px',
                    width: '280px',
                    backgroundColor: 'var(--bg-tertiary)',
                    marginBottom: '8px',
                }} className="animate-pulse" />
                <div style={{
                    height: '14px',
                    width: '140px',
                    backgroundColor: 'var(--bg-tertiary)',
                }} className="animate-pulse" />
            </div>
        </div>
    );
}
