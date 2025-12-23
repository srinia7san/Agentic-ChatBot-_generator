import 'package:flutter/material.dart';
import '../models/message.dart';
import '../models/config.dart';
import '../models/theme.dart';
import '../services/agentic_api.dart';
import 'chat_bubble.dart';
import 'chat_input.dart';
import 'typing_indicator.dart';

/// Main Agentic Chatbot widget
class AgenticChatbot extends StatefulWidget {
  /// Embed token from your dashboard
  final String token;

  /// API base URL
  final String apiUrl;

  /// Theme configuration
  final AgenticTheme theme;

  /// Show/hide header
  final bool showHeader;

  /// Custom header title (overrides agent name)
  final String? headerTitle;

  /// Custom placeholder text
  final String? placeholder;

  /// Callback when message is sent
  final void Function(Message)? onMessageSent;

  /// Callback when response is received
  final void Function(Message)? onMessageReceived;

  /// Callback on error
  final void Function(Object)? onError;

  const AgenticChatbot({
    super.key,
    required this.token,
    this.apiUrl = 'http://localhost:5000/v1',
    this.theme = AgenticTheme.light,
    this.showHeader = true,
    this.headerTitle,
    this.placeholder,
    this.onMessageSent,
    this.onMessageReceived,
    this.onError,
  });

  @override
  State<AgenticChatbot> createState() => _AgenticChatbotState();
}

class _AgenticChatbotState extends State<AgenticChatbot> {
  late AgenticAPI _api;
  final List<Message> _messages = [];
  bool _isTyping = false;
  AgenticConfig? _config;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _api = AgenticAPI(token: widget.token, apiUrl: widget.apiUrl);
    _initializeChat();
  }

  Future<void> _initializeChat() async {
    try {
      final config = await _api.getConfig();
      setState(() {
        _config = config;
        if (config.uiHints.welcomeMessage.isNotEmpty) {
          _messages.add(Message(
            id: _generateId(),
            role: MessageRole.assistant,
            content: config.uiHints.welcomeMessage,
            timestamp: DateTime.now(),
          ));
        }
      });
      _api.trackEvent('widget_open');
    } catch (e) {
      widget.onError?.call(e);
    }
  }

  String _generateId() => 'msg_${DateTime.now().millisecondsSinceEpoch}';

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage(String content) async {
    if (content.trim().isEmpty) return;

    final userMessage = Message(
      id: _generateId(),
      role: MessageRole.user,
      content: content.trim(),
      timestamp: DateTime.now(),
    );

    setState(() {
      _messages.add(userMessage);
      _isTyping = true;
    });
    _scrollToBottom();
    widget.onMessageSent?.call(userMessage);

    try {
      final result = await _api.sendQuery(content);

      final assistantMessage = Message(
        id: _generateId(),
        role: MessageRole.assistant,
        content: result['data']?['answer'] ?? result['answer'] ?? '',
        timestamp: DateTime.now(),
        metadata: MessageMetadata(
          responseTimeMs: result['metadata']?['response_time_ms'],
          tokensUsed: result['metadata']?['tokens_used'],
          requestId: result['request_id'],
        ),
      );

      setState(() {
        _messages.add(assistantMessage);
        _isTyping = false;
      });
      _scrollToBottom();
      widget.onMessageReceived?.call(assistantMessage);
      _api.trackEvent('message_sent', data: {'message_id': userMessage.id});
    } catch (e) {
      final errorMessage = Message(
        id: _generateId(),
        role: MessageRole.assistant,
        content: 'Sorry, an error occurred: $e',
        timestamp: DateTime.now(),
        isError: true,
      );

      setState(() {
        _messages.add(errorMessage);
        _isTyping = false;
      });
      _scrollToBottom();
      widget.onError?.call(e);
    }
  }

  void _submitFeedback(String messageId, FeedbackType type) {
    _api.submitFeedback(messageId, type == FeedbackType.positive ? 'positive' : 'negative');
    setState(() {
      final index = _messages.indexWhere((m) => m.id == messageId);
      if (index != -1) {
        _messages[index] = _messages[index].copyWith(feedback: type);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = widget.theme;
    final title = widget.headerTitle ?? _config?.agent.name ?? 'AI Assistant';
    final placeholder = widget.placeholder ?? _config?.uiHints.placeholder ?? 'Type a message...';

    return Container(
      color: theme.backgroundColor,
      child: SafeArea(
        child: Column(
          children: [
            // Header
            if (widget.showHeader)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                color: theme.headerBackgroundColor,
                child: Row(
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      decoration: const BoxDecoration(
                        color: Color(0xFF4ADE80),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      title,
                      style: TextStyle(
                        color: theme.headerTextColor,
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),

            // Messages
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.all(16),
                itemCount: _messages.length + (_isTyping ? 1 : 0),
                itemBuilder: (context, index) {
                  if (index == _messages.length && _isTyping) {
                    return TypingIndicator(theme: theme);
                  }
                  return ChatBubble(
                    message: _messages[index],
                    theme: theme,
                    onFeedback: (type) => _submitFeedback(_messages[index].id, type),
                  );
                },
              ),
            ),

            // Input
            ChatInput(
              theme: theme,
              placeholder: placeholder,
              onSend: _sendMessage,
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _api.trackEvent('widget_close');
    _scrollController.dispose();
    super.dispose();
  }
}
