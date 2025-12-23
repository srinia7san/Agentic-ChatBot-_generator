import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAgent } from "../context/AgentContext";
import Navbar from "../components/Navbar";
import { MessageSquare, Send, ArrowLeft, FileText, ChevronDown, ChevronUp } from "lucide-react";

export default function AgentChat() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { agents } = useAgent();
  const agent = agents.find((a) => a.name === decodeURIComponent(name));

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [showSources, setShowSources] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center animate-fadeIn">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-gray-400" />
            </div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Agent not found</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">"{decodeURIComponent(name)}" doesn't exist</p>
            <button onClick={() => navigate('/home')} className="btn btn-primary">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);
    setStreamingText("");

    try {
      // Try streaming endpoint first
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/agents/${encodeURIComponent(agent.name)}/query/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: userMessage })
      });

      if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
        // Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                setMessages((prev) => [...prev, { role: "assistant", text: fullText }]);
                setStreamingText("");
              } else {
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.token) {
                    fullText += parsed.token;
                    setStreamingText(fullText);
                  }
                } catch { }
              }
            }
          }
        }
      } else {
        // Fallback to regular query
        const { queryAgent } = await import("../api");
        const result = await queryAgent(agent.name, userMessage);

        // Simulate typing effect
        const words = result.answer.split(' ');
        let currentText = "";

        for (let i = 0; i < words.length; i++) {
          currentText += (i === 0 ? '' : ' ') + words[i];
          setStreamingText(currentText);
          await new Promise(r => setTimeout(r, 30));
        }

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: result.answer,
            sources: result.source_documents || [],
          },
        ]);
        setStreamingText("");
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Error: ${err.message}`,
          isError: true,
        },
      ]);
      setStreamingText("");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <Navbar />

      {/* Agent Header */}
      <div className="bg-slate-50 dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{agent.name}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{agent.domain || "General"}</span>
                <span>·</span>
                <span>{agent.num_documents} chunks</span>
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/home')} className="btn btn-secondary text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
          {messages.length === 0 && !streamingText && (
            <div className="text-center py-16 animate-fadeIn">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Start a conversation</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Ask questions about your documents</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}>
              <div className={`max-w-[70%] rounded-xl px-4 py-3 ${m.role === "user"
                ? "bg-blue-600 text-white"
                : m.isError
                  ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800"
                  : "bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-gray-900 dark:text-white shadow-sm"
                }`}>
                <p className="text-sm whitespace-pre-wrap">{m.text}</p>

                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      onClick={() => setShowSources(showSources === i ? null : i)}
                    >
                      <FileText className="w-3 h-3" />
                      {m.sources.length} sources
                      {showSources === i ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {showSources === i && (
                      <div className="mt-2 space-y-2">
                        {m.sources.map((source, idx) => (
                          <div key={idx} className="text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Source {idx + 1}:</span>
                            <p className="mt-1">{source.length > 200 ? source.substring(0, 200) + "..." : source}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Streaming message */}
          {streamingText && (
            <div className="flex justify-start animate-fadeIn">
              <div className="max-w-[70%] bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm">
                <p className="text-sm whitespace-pre-wrap text-gray-900 dark:text-white">
                  {streamingText}
                  <span className="inline-block w-2 h-4 bg-blue-600 ml-1 animate-pulse" />
                </p>
              </div>
            </div>
          )}

          {loading && !streamingText && (
            <div className="flex justify-start animate-fadeIn">
              <div className="bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-slate-50 dark:bg-gray-800 border-t border-slate-200 dark:border-gray-700 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={loading}
          />
          <button
            className="btn btn-primary px-6"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
