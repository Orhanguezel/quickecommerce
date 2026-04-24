import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../config/colors.dart';
import '../../l10n/app_localizations.dart';

class ItemTitle extends StatelessWidget {
  const ItemTitle({
    super.key,
    required this.title,
    required this.onTap,
    required this.subTitle,
    this.isPremium = false,
  });
  final String title;
  final String subTitle;
  final VoidCallback onTap;
  final bool isPremium;
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        RichText(
          text: TextSpan(
            children: [
              TextSpan(
                  text: title,
                  style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                        fontSize: kIsWeb ? 20 : 20.sp,
                        fontWeight:
                            isPremium ? FontWeight.w700 : FontWeight.w600,
                        color: isPremium ? const Color(0xFF0F172A) : null,
                      )),
              TextSpan(
                  text: " ",
                  style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                        fontSize: kIsWeb ? 20 : 20.sp,
                        fontWeight:
                            isPremium ? FontWeight.w700 : FontWeight.w600,
                      )),
              TextSpan(
                  text: subTitle,
                  style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                      fontSize: kIsWeb ? 20 : 20.sp,
                      fontWeight: isPremium ? FontWeight.w700 : FontWeight.w600,
                      color: isPremium
                          ? const Color(0xFF2563EB)
                          : CustomColors.baseColor)),
            ],
          ),
        ),
        const Spacer(),
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(999),
          child: Container(
            padding: isPremium
                ? const EdgeInsets.symmetric(horizontal: 12, vertical: 7)
                : EdgeInsets.zero,
            decoration: isPremium
                ? BoxDecoration(
                    color: const Color(0xFFEFF6FF),
                    borderRadius: BorderRadius.circular(999),
                  )
                : null,
            child: Text(
              AppLocalizations.of(context)!.viewAll,
              style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                  fontWeight: isPremium ? FontWeight.w600 : FontWeight.w400,
                  fontSize: kIsWeb ? 13 : 13.sp,
                  color: isPremium
                      ? const Color(0xFF2563EB)
                      : CustomColors.baseColor),
            ),
          ),
        )
      ],
    );
  }
}
