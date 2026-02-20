import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';



class CommonCard extends StatelessWidget {
  final Widget widget;
  final double pLeft;
  final double pRight;
  final double pTop;
  final double pBottom;
  final double mHorizontal;
  final double mVertical;
  const CommonCard({
    super.key,
    required this.widget,
    this.pLeft = 10,
    this.pRight = 10,
    this.pTop = 12,
    this.pBottom = 10,
    this .mHorizontal=12,
    this .mVertical=12,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
          left:kIsWeb ? pLeft : pLeft.w, right: kIsWeb ? pRight : pRight.w, top:kIsWeb ? pTop :  pTop.h, bottom:kIsWeb ? pBottom :  pBottom.h),
      margin: EdgeInsets.symmetric(horizontal: mHorizontal.w, vertical: mVertical.h),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(kIsWeb ? 8 : 8.r),
        border: Border.all(
          width:kIsWeb ? 1 :  1.w,
          color: Theme.of(context).dividerColor
        ),
      ),
      child: widget,
    );
  }
}
