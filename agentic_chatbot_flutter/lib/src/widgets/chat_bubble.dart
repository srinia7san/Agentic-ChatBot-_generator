import 'package:flutter/material.dart';
import '../models/message.dart';
import '../models/theme.dart';

/// Chat bubble widget for individual messages
class ChatBubble extends StatelessWidget {
  final Message message;
  final AgenticTheme theme;
  final void Function(FeedbackType)? onFeedback;

  const ChatBubble({
    super.key,
    required this.message,
    required this.theme,
    this.onFeedback,
  });

  @override
  Widget build(BuildContext context) {
    final isUser = message.role == MessageRole.user;
    final isError = message.isError;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Align(
        alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
        child: Column(
          crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            // Bubble
            Container(
              constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width * 0.8,
              ),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: isUser
                    ? theme.userBubbleColor
                    : isError
                        ? const Color(0xFFFEE2E2)
                        : theme.assistantBubbleColor,
                borderRadius: BorderRadius.circular(18),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    message.content,
                    style: TextStyle(
                      color: isUser
                          ? theme.userTextColor
                          : isError
                              ? const Color(0xFFDC2626)
                              : theme.assistantTextColor,
                      fontSize: 15,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _formatTime(message.timestamp),
                    style: TextStyle(
                      color: isUser
                          ? theme.userTextColor.withOpacity(0.7)
                          : const Color(0xFF94A3B8),
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),

            // Feedback buttons
            if (!isUser && !isError && onFeedback != null)
              Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _FeedbackButton(
                      icon: '👍',
                      isActive: message.feedback == FeedbackType.positive,
                      onTap: () => onFeedback!(FeedbackType.positive),
                    ),
                    const SizedBox(width: 8),
                    _FeedbackButton(
                      icon: '👎',
                      isActive: message.feedback == FeedbackType.negative,
                      onTap: () => onFeedback!(FeedbackType.negative),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  String _formatTime(DateTime date) {
    final hours = date.hour.toString().padLeft(2, '0');
    final minutes = date.minute.toString().padLeft(2, '0');
    return '$hours:$minutes';
  }
}

class _FeedbackButton extends StatelessWidget {
  final String icon;
  final bool isActive;
  final VoidCallback onTap;

  const _FeedbackButton({
    required this.icon,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFFDBEAFE) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(icon, style: const TextStyle(fontSize: 14)),
      ),
    );
  }
}
