// ignore_for_file: must_be_immutable

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:quick_ecommerce/config/colors.dart';



class CommonButton extends StatelessWidget {
  CommonButton({super.key, required this.buttonText, required this.onTap,this.bgColor,this.textColor});
  String buttonText;
  VoidCallback onTap;
  Color? bgColor;
  Color? textColor;
  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Center(
        child: Container(
          width: kIsWeb ? 344 :344.w,
          height: kIsWeb ? 45 :45.h,
          decoration: BoxDecoration(
            color: bgColor?? Theme.of(context).disabledColor,
            borderRadius: BorderRadius.circular(kIsWeb ? 10 :10.r),
            border: Border.all(width: .1, color: Theme.of(context).focusColor),
          ),
          child: Center(
            child: Text(
              buttonText,
              style:Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w500,fontSize: kIsWeb ? 14 :14.sp,color: textColor?? Colors.white
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class CommonLoadingButton extends StatelessWidget {
  const CommonLoadingButton({super.key,});
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        width:kIsWeb ? 344 : 344.w,
        height: kIsWeb ? 45 :45.h,
        decoration: BoxDecoration(
          color: CustomColors.baseColor,
          borderRadius: BorderRadius.circular(kIsWeb ? 10 :10.r),
          border: Border.all(width: .3, color: Theme.of(context).focusColor),
        ),
        child: Center(
          child: CircularProgressIndicator(
            strokeWidth:kIsWeb ? 1.1 : 1.1.w,
            color: const Color(0xFFD3E4FB),
          ),
        ),
      ),
    );
  }
}