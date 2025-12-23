/// Configuration model for widget settings
class AgenticConfig {
  final AgentInfo agent;
  final FeatureFlags features;
  final RateLimitInfo rateLimit;
  final UiHints uiHints;

  AgenticConfig({
    required this.agent,
    required this.features,
    required this.rateLimit,
    required this.uiHints,
  });

  factory AgenticConfig.fromJson(Map<String, dynamic> json) {
    return AgenticConfig(
      agent: AgentInfo.fromJson(json['agent'] ?? {}),
      features: FeatureFlags.fromJson(json['features'] ?? {}),
      rateLimit: RateLimitInfo.fromJson(json['rate_limit'] ?? {}),
      uiHints: UiHints.fromJson(json['ui_hints'] ?? {}),
    );
  }
}

class AgentInfo {
  final String name;
  final String domain;
  final String description;

  AgentInfo({
    required this.name,
    required this.domain,
    required this.description,
  });

  factory AgentInfo.fromJson(Map<String, dynamic> json) {
    return AgentInfo(
      name: json['name'] ?? 'AI Assistant',
      domain: json['domain'] ?? '',
      description: json['description'] ?? '',
    );
  }
}

class FeatureFlags {
  final bool streaming;
  final bool fileUpload;
  final bool feedback;

  FeatureFlags({
    this.streaming = false,
    this.fileUpload = false,
    this.feedback = true,
  });

  factory FeatureFlags.fromJson(Map<String, dynamic> json) {
    return FeatureFlags(
      streaming: json['streaming'] ?? false,
      fileUpload: json['file_upload'] ?? false,
      feedback: json['feedback'] ?? true,
    );
  }
}

class RateLimitInfo {
  final int limit;
  final int remaining;
  final int windowSeconds;

  RateLimitInfo({
    this.limit = 20,
    this.remaining = 20,
    this.windowSeconds = 60,
  });

  factory RateLimitInfo.fromJson(Map<String, dynamic> json) {
    return RateLimitInfo(
      limit: json['limit'] ?? 20,
      remaining: json['remaining'] ?? 20,
      windowSeconds: json['window_seconds'] ?? 60,
    );
  }
}

class UiHints {
  final String placeholder;
  final String welcomeMessage;

  UiHints({
    this.placeholder = 'Type a message...',
    this.welcomeMessage = '',
  });

  factory UiHints.fromJson(Map<String, dynamic> json) {
    return UiHints(
      placeholder: json['placeholder'] ?? 'Type a message...',
      welcomeMessage: json['welcome_message'] ?? '',
    );
  }
}
