import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';



class ResponsiveWidget extends StatelessWidget {

  final Widget mobile;
  final Widget desktop;

  const ResponsiveWidget({
    super.key,
    required this.mobile,
    required this.desktop,
  });
  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    if (width < 500 && !kIsWeb) {
      return mobile;
    }
    return desktop;
  }
}


