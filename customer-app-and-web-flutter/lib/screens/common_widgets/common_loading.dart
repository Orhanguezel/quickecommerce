
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../config/text_styles.dart';

class CommonLoading extends StatelessWidget {
  const CommonLoading({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
        child: Container(
          height:kIsWeb ? 90 : 90.h,
          width: kIsWeb ? 100 :100.w,
          decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(kIsWeb ? 12 :12.r),
              color: Colors.white),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator.adaptive(
                strokeWidth: kIsWeb ? 2 :2.w,
              ),
              SizedBox(
                height:kIsWeb ? 8 : 8.h,
              ),
              Padding(
                padding: EdgeInsets.only(left: kIsWeb ? 12 :12.w, right:kIsWeb ? 12 : 12.w),
                child:  Text(
                  "please wait....",
                  overflow: TextOverflow.ellipsis,
                  style: CustomTextStyles.regularText(kIsWeb ? 14 :14.sp),
                ),
              ),
            ],
          ),
        ));
  }
}
