import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class FieldTitle extends StatelessWidget {
  const FieldTitle({super.key, required this.title,  this.star=''});
final String title;
final String star;
  @override
  Widget build(BuildContext context) {
    return  Padding(
      padding: EdgeInsets.only(bottom: kIsWeb ? 5 : 5.h),
      child: RichText(
        text: TextSpan(
          text: title,
          style: Theme.of(context)
              .textTheme
              .bodyMedium
              ?.copyWith(fontWeight: FontWeight.w500, fontSize: kIsWeb ? 14 : 14.sp),
          children: [
            TextSpan(
              text: star,
              style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                color: const Color(0xFFFF5555),
                  fontWeight: FontWeight.w600, fontSize:  kIsWeb ? 12 :12.sp),
            ),
          ],
        ),
      ),
    );
  }
}
