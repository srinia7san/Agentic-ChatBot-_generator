/// Message model for chat messages
class Message {
  final String id;
  final MessageRole role;
  final String content;
  final DateTime timestamp;
  final MessageMetadata? metadata;
  final FeedbackType? feedback;
  final bool isError;

  Message({
    required this.id,
    required this.role,
    required this.content,
    required this.timestamp,
    this.metadata,
    this.feedback,
    this.isError = false,
  });

  Message copyWith({
    String? id,
    MessageRole? role,
    String? content,
    DateTime? timestamp,
    MessageMetadata? metadata,
    FeedbackType? feedback,
    bool? isError,
  }) {
    return Message(
      id: id ?? this.id,
      role: role ?? this.role,
      content: content ?? this.content,
      timestamp: timestamp ?? this.timestamp,
      metadata: metadata ?? this.metadata,
      feedback: feedback ?? this.feedback,
      isError: isError ?? this.isError,
    );
  }
}

enum MessageRole { user, assistant }

enum FeedbackType { positive, negative }

class MessageMetadata {
  final int? responseTimeMs;
  final int? tokensUsed;
  final int? sourcesCount;
  final String? requestId;

  MessageMetadata({
    this.responseTimeMs,
    this.tokensUsed,
    this.sourcesCount,
    this.requestId,
  });

  factory MessageMetadata.fromJson(Map<String, dynamic> json) {
    return MessageMetadata(
      responseTimeMs: json['response_time_ms'],
      tokensUsed: json['tokens_used'],
      sourcesCount: json['sources_count'],
      requestId: json['request_id'],
    );
  }
}
