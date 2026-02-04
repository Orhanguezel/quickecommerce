import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../config/text_styles.dart';


// ignore: must_be_immutable
class CommonDisabledButton extends StatelessWidget {
  CommonDisabledButton({super.key, required this.buttonText});
  String buttonText;
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        width:  kIsWeb ? 344 :344.w,
        height:  kIsWeb ? 45 :45.h,
        padding: EdgeInsets.all( kIsWeb ? 8 :8.sp),
        decoration: BoxDecoration(
          color: const Color(0xFF7190BD),
          borderRadius: BorderRadius.circular( kIsWeb ? 10 :10.r),
          boxShadow: const [
            BoxShadow(
              color: Color(0x4D1A73E8),
              offset: Offset(
                0.4,
                0.4,
              ),
              blurRadius: 0.0,
              spreadRadius: 0.0,
            )
          ],
        ),
        child: Center(
          child: Text(
            buttonText,
            overflow: TextOverflow.ellipsis,
            style: CustomTextStyles.boldText(
              kIsWeb ?18 : 18.sp,
              color:const Color(0xFFD9D7D7),
            ),
          ),
        ),
      ),
    );
  }
}