# Agentic Chatbot Flutter SDK

Embed AI-powered chatbots in your Flutter apps with minimal setup.

## Installation

Add to your `pubspec.yaml`:

```yaml
dependencies:
  agentic_chatbot_flutter:
    path: ../agentic_chatbot_flutter
```

Then run:

```bash
flutter pub get
```

## Quick Start

```dart
import 'package:flutter/material.dart';
import 'package:agentic_chatbot_flutter/agentic_chatbot_flutter.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        body: AgenticChatbot(
          token: 'YOUR_EMBED_TOKEN',
          apiUrl: 'http://your-api.com/v1',
          theme: AgenticTheme.light,
        ),
      ),
    );
  }
}
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `token` | `String` | **required** | Embed token from dashboard |
| `apiUrl` | `String` | `http://localhost:5000/v1` | API base URL |
| `theme` | `AgenticTheme` | `AgenticTheme.light` | Theme config |
| `showHeader` | `bool` | `true` | Show/hide header |
| `headerTitle` | `String?` | Agent name | Custom header title |
| `placeholder` | `String?` | From config | Input placeholder |
| `onMessageSent` | `Function?` | - | Callback on message sent |
| `onMessageReceived` | `Function?` | - | Callback on response |
| `onError` | `Function?` | - | Error callback |

## Custom Theming

### Using Presets

```dart
AgenticChatbot(
  token: 'YOUR_TOKEN',
  theme: AgenticTheme.dark, // or AgenticTheme.light
)
```

### Custom Colors

```dart
AgenticChatbot(
  token: 'YOUR_TOKEN',
  theme: AgenticTheme.light.copyWith(
    primaryColor: Color(0xFF8B5CF6),
    userBubbleColor: Color(0xFF8B5CF6),
    backgroundColor: Color(0xFFFAF5FF),
  ),
)
```

## Using API Service Directly

For custom UI implementations:

```dart
import 'package:agentic_chatbot_flutter/agentic_chatbot_flutter.dart';

final api = AgenticAPI(
  token: 'YOUR_TOKEN',
  apiUrl: 'http://your-api.com/v1',
);

// Send query
final response = await api.sendQuery('Hello!');
print(response['data']['answer']);

// Get config
final config = await api.getConfig();
print(config.agent.name);

// Submit feedback
await api.submitFeedback('msg-123', 'positive');

// Track analytics
await api.trackEvent('widget_open');
```

## Models

### Message

```dart
Message(
  id: 'unique-id',
  role: MessageRole.user, // or MessageRole.assistant
  content: 'Hello!',
  timestamp: DateTime.now(),
)
```

### AgenticTheme

```dart
AgenticTheme(
  primaryColor: Color(0xFF2563EB),
  backgroundColor: Color(0xFFFFFFFF),
  userBubbleColor: Color(0xFF2563EB),
  userTextColor: Color(0xFFFFFFFF),
  assistantBubbleColor: Color(0xFFF1F5F9),
  assistantTextColor: Color(0xFF1E293B),
)
```

## Error Handling

```dart
AgenticChatbot(
  token: 'YOUR_TOKEN',
  onError: (error) {
    if (error is AgenticApiException) {
      print('API Error: ${error.code} - ${error.message}');
    }
  },
)
```

## License

MIT
