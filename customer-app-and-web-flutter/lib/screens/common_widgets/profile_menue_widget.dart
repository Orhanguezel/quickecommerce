import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class CommonMenuItem extends StatelessWidget {
  final String title;
  final String icon;
  final Color color;
  final Widget? widget;
  final VoidCallback onTap;

  const CommonMenuItem({
    super.key,
    required this.title,
    required this.icon,
    required this.color,
     this.widget,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        InkWell(
          onTap: onTap,
          child: Row(
            children: [
              Container(
                height:kIsWeb ? 38 : 38.h,
                width:kIsWeb ? 38 : 38.w,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(7.5),
                  color: color,
                ),
                child: Center(
                  child: Image.asset(
                    icon,
                    height:kIsWeb ? 22 : 22.h,
                    width:kIsWeb ?22 : 22.w,
                    fit: BoxFit.contain,
                  ),
                ),
              ),
              SizedBox(width: kIsWeb ? 10 :10.w),
              Text(
                title,
                style: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.copyWith(fontWeight: FontWeight.w300, fontSize:kIsWeb ? 16 : 16.sp),
              ),
              const Spacer(),
              SizedBox(
                child: widget,
              )
            ],
          ),
        ),
        Divider(thickness: kIsWeb ? 1 :1.h, color: const Color(0xFFE8E5E5))
      ],
    );
  }
}