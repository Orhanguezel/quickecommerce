
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../config/images.dart';
import '../../l10n/app_localizations.dart';

class NoDataWidget extends StatelessWidget {
  final double height;
  final double width;

  const NoDataWidget({
    super.key,
    this.height = 150,
    this.width = 150,
  });
  @override
  Widget build(BuildContext context) {
    return  Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Image.asset(
          Images.noData,
          height:kIsWeb ? height : height.h,
          width: kIsWeb ? width :width.w,
          fit: BoxFit.fill,
        ),
        Text(
          AppLocalizations.of(context)!.noDataFound,
          style: Theme.of(context)
              .textTheme
              .headlineLarge!
              .copyWith(fontSize: kIsWeb ? 14 :14.sp, fontWeight: FontWeight.w500),
        ),
      ],
    );
  }
}
