import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:quick_ecommerce/config/colors.dart';

class ChildButton extends StatelessWidget {
  final Widget widget;
  final VoidCallback onPressed;
  final Color? color;
  final Color? borderColor;
  final EdgeInsetsGeometry? padding;

  const ChildButton({
    super.key,
    required this.widget,
    required this.onPressed,
    this.color,
    this.borderColor,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onPressed,
      child: Container(
        padding:
        padding ?? EdgeInsets.symmetric(vertical: kIsWeb ? 10 :10.h, horizontal:kIsWeb ? 32 : 32.w),
        decoration: BoxDecoration(
          color: color ?? CustomColors.baseColor,
          borderRadius: BorderRadius.circular(kIsWeb ? 5 :5.r),
          border: Border.all(
              width: kIsWeb ? 0.2 :0.2.w,
              color:  borderColor ?? color ?? CustomColors.baseColor
          ),
        ),
        child: widget,
      ),
    );
  }
}