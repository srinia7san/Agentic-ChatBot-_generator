import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/config.dart';

/// API service for communicating with Agentic backend
class AgenticAPI {
  final String token;
  final String apiUrl;

  AgenticAPI({
    required this.token,
    this.apiUrl = 'http://localhost:5000/v1',
  });

  /// Send a query to the chatbot
  Future<Map<String, dynamic>> sendQuery(String query, {String? conversationId}) async {
    final response = await http.post(
      Uri.parse('$apiUrl/embed/$token/query'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'query': query,
        if (conversationId != null) 'conversation_id': conversationId,
      }),
    );

    final result = jsonDecode(response.body);

    if (response.statusCode != 200 || result['success'] != true) {
      throw AgenticApiException(
        code: result['error']?['code'] ?? 'UNKNOWN_ERROR',
        message: result['error']?['message'] ?? 'Request failed',
      );
    }

    return result;
  }

  /// Get widget configuration
  Future<AgenticConfig> getConfig() async {
    final response = await http.get(
      Uri.parse('$apiUrl/embed/$token/config'),
    );

    final result = jsonDecode(response.body);

    if (response.statusCode != 200 || result['success'] != true) {
      throw AgenticApiException(
        code: result['error']?['code'] ?? 'UNKNOWN_ERROR',
        message: result['error']?['message'] ?? 'Failed to get config',
      );
    }

    return AgenticConfig.fromJson(result['data']?['config'] ?? result['config'] ?? {});
  }

  /// Get agent info
  Future<Map<String, dynamic>> getAgentInfo() async {
    final response = await http.get(
      Uri.parse('$apiUrl/embed/$token/info'),
    );

    return jsonDecode(response.body);
  }

  /// Submit feedback for a message
  Future<void> submitFeedback(String messageId, String type, {String comment = ''}) async {
    await http.post(
      Uri.parse('$apiUrl/embed/$token/feedback'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'message_id': messageId,
        'type': type,
        'comment': comment,
      }),
    );
  }

  /// Track analytics event
  Future<void> trackEvent(String event, {Map<String, dynamic>? data}) async {
    try {
      await http.post(
        Uri.parse('$apiUrl/embed/$token/analytics'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'event': event,
          'data': data ?? {},
        }),
      );
    } catch (e) {
      // Silently fail for analytics
      print('Analytics tracking failed: $e');
    }
  }
}

/// Exception for API errors
class AgenticApiException implements Exception {
  final String code;
  final String message;

  AgenticApiException({required this.code, required this.message});

  @override
  String toString() => 'AgenticApiException: [$code] $message';
}
