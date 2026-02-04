import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../config/colors.dart';
import '../../l10n/app_localizations.dart';

class ItemTitle extends StatelessWidget {
  const ItemTitle({super.key, required this.title, required this.onTap, required this.subTitle});
final String title;
final String subTitle;
final VoidCallback onTap;
  @override
  Widget build(BuildContext context) {
    return  Row(
      children: [
        RichText(
          text: TextSpan(
            children: [
              TextSpan(text: title, style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                fontSize:kIsWeb ? 20 : 20.sp,
                fontWeight: FontWeight.w600,
              )),
              TextSpan(text: " ", style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                  fontSize: kIsWeb ? 20 :20.sp,
                  fontWeight: FontWeight.w600,
              )),
              TextSpan(text: subTitle, style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                  fontSize: kIsWeb ? 20 :20.sp,
                  fontWeight: FontWeight.w600,
                  color:CustomColors.baseColor
              )),
            ],
          ),
        ),
        const Spacer(),
        InkWell(
          onTap:onTap,
          child:Text(AppLocalizations.of(context)!.viewAll,
            style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                fontWeight: FontWeight.w400,fontSize:kIsWeb ? 13 : 13.sp, color:CustomColors.baseColor
            ),
          ),
        )
      ],
    );
  }
}
