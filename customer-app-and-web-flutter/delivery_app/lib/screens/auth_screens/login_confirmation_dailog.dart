import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:quick_ecommerce/router/route_name.dart';

import '../../l10n/app_localizations.dart';

class ConfirmationDialog extends StatelessWidget {
  const ConfirmationDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      elevation: 1,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      title: Text(
        AppLocalizations.of(context)!.confirmation,
        style:
            Theme.of(context).textTheme.bodyMedium!.copyWith(fontSize:kIsWeb ?18 :18.sp),
      ),
      content: Text(
        AppLocalizations.of(context)!.toContinue,
        style: Theme.of(context)
            .textTheme
            .bodyMedium!
            .copyWith(fontSize:kIsWeb ?14 :14.sp, fontWeight: FontWeight.w400),
      ),
      actions: [
        InkWell(
          onTap: (){
            Navigator.of(context).pop();
          },
          child: Text(AppLocalizations.of(context)!.cancel,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w500,
              color: Colors.red,
              fontSize: kIsWeb ?14 :14.sp,
            ),
          ),
        ),
        SizedBox(width:kIsWeb ?20 : 20.w,),
        InkWell(
          onTap: (){
            if(kIsWeb){
              context.pushNamed(RouteNames.webLogin);
            }else{
              context.pushNamed(RouteNames.loginScreen);
            }
            Navigator.pop(context);
          },
          child: Text(AppLocalizations.of(context)!.goToSignIn,
            style: Theme.of(context).textTheme.headlineLarge?.copyWith(
              fontWeight: FontWeight.w500,
              fontSize:kIsWeb ?14 : 14.sp,
            ),
          ),
        ),

      ],
    );
  }
}
