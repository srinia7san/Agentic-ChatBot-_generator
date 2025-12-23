# React Native Agentic Chatbot SDK

Embed AI-powered chatbots in your React Native apps with minimal setup.

## Installation

```bash
npm install react-native-agentic-chatbot
# or
yarn add react-native-agentic-chatbot
```

## Quick Start

```jsx
import { AgenticChatbot } from 'react-native-agentic-chatbot';

export default function App() {
  return (
    <AgenticChatbot
      token="YOUR_EMBED_TOKEN"
      apiUrl="http://your-api.com/v1"
      theme="light"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `token` | `string` | **required** | Your embed token from the dashboard |
| `apiUrl` | `string` | `http://localhost:5000/v1` | API base URL |
| `theme` | `'light' \| 'dark'` | `'light'` | Color theme |
| `customTheme` | `object` | `{}` | Custom theme overrides |
| `placeholder` | `string` | `'Type a message...'` | Input placeholder text |
| `showHeader` | `boolean` | `true` | Show/hide header |
| `headerTitle` | `string` | Agent name | Custom header title |
| `onMessageSent` | `function` | - | Callback when message sent |
| `onMessageReceived` | `function` | - | Callback when response received |
| `onError` | `function` | - | Error callback |

## Custom Theme

```jsx
<AgenticChatbot
  token="YOUR_TOKEN"
  customTheme={{
    primaryColor: '#8b5cf6',
    backgroundColor: '#faf5ff',
    userBubbleColor: '#8b5cf6',
    assistantBubbleColor: '#f3e8ff',
  }}
/>
```

## Using Hooks

For custom UI, use the hooks directly:

```jsx
import { useAgenticChat, useAgenticAPI } from 'react-native-agentic-chatbot';

function MyCustomChat() {
  const { messages, sendMessage, isTyping } = useAgenticChat({
    token: 'YOUR_TOKEN',
    apiUrl: 'http://your-api.com/v1',
  });

  return (
    <View>
      {messages.map(msg => (
        <Text key={msg.id}>{msg.content}</Text>
      ))}
      {/* Your custom input */}
    </View>
  );
}
```

## API Reference

### useAgenticChat

| Return Value | Type | Description |
|--------------|------|-------------|
| `messages` | `Message[]` | Array of messages |
| `isTyping` | `boolean` | True when AI is responding |
| `agentInfo` | `object` | Agent information |
| `config` | `object` | Widget configuration |
| `sendMessage` | `function` | Send a message |
| `submitFeedback` | `function` | Submit 👍/👎 feedback |
| `clearChat` | `function` | Clear chat history |

### useAgenticAPI

| Return Value | Type | Description |
|--------------|------|-------------|
| `sendQuery` | `function` | Send query to API |
| `getConfig` | `function` | Get widget config |
| `getAgentInfo` | `function` | Get agent info |
| `submitFeedback` | `function` | Submit feedback |
| `trackEvent` | `function` | Track analytics event |
| `loading` | `boolean` | Loading state |
| `error` | `Error` | Error object |

## License

MIT
