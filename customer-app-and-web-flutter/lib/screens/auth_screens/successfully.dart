import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_button.dart';

import '../../config/images.dart';
import '../../router/route_name.dart';

class SuccessfullyScreen extends StatelessWidget {
  const SuccessfullyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true,
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(height: 100.h,),
            Image.asset(
              Images.successful,
              height:315.h,
              width:315.w,
            ),
            SizedBox(height: 34.h),
            SizedBox(
              width: 250.w,
              child: Text("New password set Successfully",
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontSize: 24.sp,
                    fontWeight: FontWeight.w700,
                  )),
            ),
            SizedBox(height: 20.h),
            SizedBox(
              width: 275.w,
                child:  Text('Congratulations! Your password has been set successfully. Please proceed to the login screen to verify your account.',
                  textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.displayLarge!.copyWith(
                        fontSize: 14.sp,
                        fontWeight: FontWeight.w400)),
            ),
            SizedBox(height: 20.h),
            CommonButton(
                buttonText: "Sing in",
                onTap: (){
                  context.goNamed(RouteNames.loginScreen);
                }
            )
          ],
        ),
      ),
    );
  }
}
