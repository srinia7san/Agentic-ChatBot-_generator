import 'package:flutter/material.dart';

/// Theme configuration for the chatbot - Premium Black & White
class AgenticTheme {
  final Color primaryColor;
  final Color backgroundColor;
  final Color userBubbleColor;
  final Color userTextColor;
  final Color assistantBubbleColor;
  final Color assistantTextColor;
  final Color inputBackgroundColor;
  final Color inputBorderColor;
  final Color headerBackgroundColor;
  final Color headerTextColor;
  final String? fontFamily;

  const AgenticTheme({
    this.primaryColor = const Color(0xFF000000),
    this.backgroundColor = const Color(0xFFFFFFFF),
    this.userBubbleColor = const Color(0xFF000000),
    this.userTextColor = const Color(0xFFFFFFFF),
    this.assistantBubbleColor = const Color(0xFFF5F5F5),
    this.assistantTextColor = const Color(0xFF000000),
    this.inputBackgroundColor = const Color(0xFFFAFAFA),
    this.inputBorderColor = const Color(0xFFE5E5E5),
    this.headerBackgroundColor = const Color(0xFF000000),
    this.headerTextColor = const Color(0xFFFFFFFF),
    this.fontFamily,
  });

  /// Light theme preset - Premium Black on White
  static const light = AgenticTheme();

  /// Dark theme preset - Premium White on Black
  static const dark = AgenticTheme(
    primaryColor: Color(0xFFFFFFFF),
    backgroundColor: Color(0xFF000000),
    userBubbleColor: Color(0xFFFFFFFF),
    userTextColor: Color(0xFF000000),
    assistantBubbleColor: Color(0xFF141414),
    assistantTextColor: Color(0xFFFFFFFF),
    inputBackgroundColor: Color(0xFF0A0A0A),
    inputBorderColor: Color(0xFF262626),
    headerBackgroundColor: Color(0xFF000000),
    headerTextColor: Color(0xFFFFFFFF),
  );

  /// Create a copy with overrides
  AgenticTheme copyWith({
    Color? primaryColor,
    Color? backgroundColor,
    Color? userBubbleColor,
    Color? userTextColor,
    Color? assistantBubbleColor,
    Color? assistantTextColor,
    Color? inputBackgroundColor,
    Color? inputBorderColor,
    Color? headerBackgroundColor,
    Color? headerTextColor,
    String? fontFamily,
  }) {
    return AgenticTheme(
      primaryColor: primaryColor ?? this.primaryColor,
      backgroundColor: backgroundColor ?? this.backgroundColor,
      userBubbleColor: userBubbleColor ?? this.userBubbleColor,
      userTextColor: userTextColor ?? this.userTextColor,
      assistantBubbleColor: assistantBubbleColor ?? this.assistantBubbleColor,
      assistantTextColor: assistantTextColor ?? this.assistantTextColor,
      inputBackgroundColor: inputBackgroundColor ?? this.inputBackgroundColor,
      inputBorderColor: inputBorderColor ?? this.inputBorderColor,
      headerBackgroundColor: headerBackgroundColor ?? this.headerBackgroundColor,
      headerTextColor: headerTextColor ?? this.headerTextColor,
      fontFamily: fontFamily ?? this.fontFamily,
    );
  }
}
