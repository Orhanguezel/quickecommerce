import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:quick_ecommerce/router/route_name.dart';
import 'package:quick_ecommerce/screens/settings/deactivate__or_delete_account.dart';


import '../../config/icons.dart';
import '../../l10n/app_localizations.dart';
import '../common_widgets/common_card.dart';


class SettingsScreens extends StatefulWidget {
  const SettingsScreens({super.key});

  @override
  State<SettingsScreens> createState() => _SettingsScreensState();
}

class _SettingsScreensState extends State<SettingsScreens> {
    @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          AppLocalizations.of(context)!.settings,
          style: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(fontWeight: FontWeight.w700, fontSize: 20.sp),
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          CommonCard(
              widget: Column(
                children: [
                  SettingMenuItem(
                    onTap: () {
                      context.pushNamed(RouteNames.changeEmail);
                    },
                    title: AppLocalizations.of(context)!.changeEmail,
                    icon: AssetsIcons.email,
                  ),
                  SettingMenuItem(
                    onTap: () {
                      context.pushNamed(RouteNames.passwordChange,);
                    },
                    title: AppLocalizations.of(context)!.changePassword,
                    icon: AssetsIcons.password,
                  ),
                  SettingMenuItem(
                    onTap: () {
                      Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const DeactivateOrDeleteAccount()));
                      //ChangeEmail
                    },
                    title: AppLocalizations.of(context)!.deactivateDeleteAccount,
                    icon: AssetsIcons.delete,
                  ),
                ],
              )),
        ],
      ),
    );
  }
}


class SettingMenuItem extends StatelessWidget {
  final String title;
  final String icon;
  final VoidCallback onTap;

  const SettingMenuItem({
    super.key,
    required this.title,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        InkWell(
          onTap: onTap,
          child: Row(
            children: [
              Container(
                height: 38.h,
                width: 38.w,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Color(0xFF7292D9),
                ),
                child: Center(
                  child: Image.asset(
                    icon,
                    height: 20.h,
                    width: 20.w,
                    color: Colors.white,
                    fit: BoxFit.contain,
                  ),
                ),
              ),
              SizedBox(width: 10.w),
              Text(
                title,
                style: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.copyWith(fontWeight: FontWeight.w300, fontSize: 16.sp),
              ),
              const Spacer(),
              const Icon(Icons.arrow_forward_ios_rounded)
            ],
          ),
        ),
        Divider(thickness: 1.h, color: const Color(0xFFCECECE))
      ],
    );
  }
}