import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_child_button.dart';

import '../../l10n/app_localizations.dart';
class CommonConfirmationDialog extends StatelessWidget {
  final String title;
  final String message;
  final VoidCallback onConfirm;

  const CommonConfirmationDialog({
    super.key,
    required this.title,
    required this.message,
    required this.onConfirm,
  });

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      title: Center(
        child: Text(title,
          style: Theme.of(context)
              .textTheme
              .bodyMedium
              ?.copyWith(fontWeight: FontWeight.w600, fontSize:kIsWeb ?14 : 14.sp),
        ),
      ),
      content: Text(message,
        textAlign: TextAlign.center,
        style: Theme.of(context)
            .textTheme
            .bodyMedium
            ?.copyWith(fontWeight: FontWeight.w400, fontSize:kIsWeb ?12 : 12.sp),
      ),
      actions: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ChildButton(
                color: const Color(0xFF969BA2),
                widget: Text(
                  AppLocalizations.of(context)!.no,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w400,
                    fontSize:kIsWeb ?14 : 14.sp,
                  ),
                ),
                onPressed: () {
                  Navigator.pop(context);
                }),
            SizedBox(width:kIsWeb ?10 : 10.w,),
            ChildButton(
                color: const Color(0xFFEC7373),
                widget: Text(
                  AppLocalizations.of(context)!.yes,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w400,
                    fontSize:kIsWeb ?14 : 14.sp,
                  ),
                ),
                onPressed: () {
                  Navigator.pop(context);
                  onConfirm();
                }),
          ],
        ),
      ],
    );
  }
}
