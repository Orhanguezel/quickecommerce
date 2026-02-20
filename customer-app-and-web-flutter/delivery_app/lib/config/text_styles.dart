import 'package:flutter/material.dart';

/// This class will be holding the common text styles
///
/// that will be use in base erp mobile
///
/// we could able to use is in a customized way too

class CustomTextStyles {
  static TextStyle regularText(
    double size, {
    Color color = Colors.black,
    double lineHeight = 1.0,
  }) {
    return TextStyle(
      fontSize: size,
      color: color,
      fontFamily: 'Barlow',
      height: lineHeight,
      fontWeight: FontWeight.w400,
    );
  }

  static TextStyle mediumText(
    double size, {
    Color color = Colors.black,
    double lineHeight = 1.0,
  }) {
    return TextStyle(
      fontSize: size,
      color: color,
      fontFamily: 'Barlow',
      height: lineHeight,
      fontWeight: FontWeight.w500,
    );
  }

  static TextStyle semiBoldText(
    double size, {
    Color color = Colors.black,
    double lineHeight = 1.0,
  }) {
    return TextStyle(
      fontSize: size,
      color: color,
      fontFamily: 'Barlow',
      height: lineHeight,
      fontWeight: FontWeight.w600,
    );
  }

  static TextStyle boldText(
    double size, {
    Color color = Colors.black,
    double lineHeight = 1.0,
  }) {
    return TextStyle(
      fontSize: size,
      color: color,
      fontFamily: 'Barlow',
      height: lineHeight,
      fontWeight: FontWeight.w700,
    );
  }

  static TextStyle extraBoldText(
    double size, {
    Color color = Colors.black,
    double lineHeight = 1.0,
  }) {
    return TextStyle(
      fontSize: size,
      color: color,
      fontFamily: 'Barlow',
      height: lineHeight,
      fontWeight: FontWeight.w800,
    );
  }
}
