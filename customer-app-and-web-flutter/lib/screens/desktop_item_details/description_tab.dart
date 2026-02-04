import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class DesktopContentRenderer extends StatelessWidget {
  final String content;

  const DesktopContentRenderer({super.key, required this.content});

  bool _containsHtml(String text) {
    final htmlTagsRegex = RegExp(r'<[^>]+>');
    return htmlTagsRegex.hasMatch(text);
  }

  @override
  Widget build(BuildContext context) {
    if (_containsHtml(content)) {
      // Use the HTML widget if HTML tags are found
      return Padding(
        padding: const EdgeInsets.only(top: 10),
        child: Html(
          data: content, // Render the HTML content
          style: {
            "body": Style(
              fontSize: FontSize(14), // Adjust font size as needed
              fontWeight: FontWeight.w400,
              lineHeight: const LineHeight(1.5),
              textAlign: TextAlign.start,
            ),
          },
        ),
      );
    } else {
      return Padding(
        padding: EdgeInsets.only(top: 10.h),
        child: Text(
          content,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w400,
            height: 1.5,
          ),
          textAlign: TextAlign.start,
        ),
      );
    }
  }
}
