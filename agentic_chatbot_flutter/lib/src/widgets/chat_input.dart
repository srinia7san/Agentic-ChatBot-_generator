import 'package:flutter/material.dart';
import '../models/theme.dart';

/// Chat input widget with text field and send button
class ChatInput extends StatefulWidget {
  final AgenticTheme theme;
  final String placeholder;
  final void Function(String) onSend;
  final bool disabled;

  const ChatInput({
    super.key,
    required this.theme,
    required this.placeholder,
    required this.onSend,
    this.disabled = false,
  });

  @override
  State<ChatInput> createState() => _ChatInputState();
}

class _ChatInputState extends State<ChatInput> {
  final TextEditingController _controller = TextEditingController();

  void _handleSend() {
    if (_controller.text.trim().isNotEmpty && !widget.disabled) {
      widget.onSend(_controller.text.trim());
      _controller.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: widget.theme.inputBackgroundColor,
        border: Border(
          top: BorderSide(color: widget.theme.inputBorderColor),
        ),
      ),
      child: Row(
        children: [
          // Text field
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: widget.theme.backgroundColor,
                border: Border.all(color: widget.theme.inputBorderColor),
                borderRadius: BorderRadius.circular(20),
              ),
              child: TextField(
                controller: _controller,
                enabled: !widget.disabled,
                maxLines: null,
                maxLength: 2000,
                decoration: InputDecoration(
                  hintText: widget.placeholder,
                  hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 10,
                  ),
                  counterText: '',
                ),
                onSubmitted: (_) => _handleSend(),
              ),
            ),
          ),
          const SizedBox(width: 10),
          // Send button
          GestureDetector(
            onTap: _handleSend,
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: _controller.text.trim().isNotEmpty
                    ? widget.theme.primaryColor
                    : const Color(0xFFCBD5E1),
                shape: BoxShape.circle,
              ),
              child: const Center(
                child: Icon(
                  Icons.send,
                  color: Colors.white,
                  size: 18,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    _controller.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}
