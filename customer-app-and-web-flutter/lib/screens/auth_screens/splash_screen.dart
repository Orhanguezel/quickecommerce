// =============================================================
// FILE: lib/screens/auth_screens/splash_screen.dart
// FINAL — Dynamic logo from GeneralInfoLoaded (com_site_logo)
// - ✅ GeneralInfoDataEvent() initState'de tetiklenir
// - ✅ Logo: network (DB) -> fallback asset (Images.logo)
// - ✅ Maintenance mode akışı korunur
// - ✅ Gereksiz tap-to-home kaldırıldı (Loaded zaten yönlendiriyor)
// =============================================================

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

import 'package:quick_ecommerce/controller/bloc/general_info_bloc/general_info_event.dart';

import '../../config/images.dart';
import '../../controller/bloc/brand_bloc/brand_state.dart';
import '../../controller/bloc/general_info_bloc/general_info_bloc.dart';
import '../../controller/bloc/general_info_bloc/general_info_state.dart';
import '../../controller/bloc/maintenence_settings_bloc/maintenance_settings_bloc.dart';
import '../../controller/bloc/maintenence_settings_bloc/maintenance_settings_event.dart';
import '../../controller/bloc/maintenence_settings_bloc/maintenance_settings_state.dart';
import '../../controller/bloc/refresh_token/refresh_token_bloc.dart';
import '../../l10n/app_localizations.dart';
import '../../router/route_name.dart';
import '../../utils/favicon_updater.dart';
import '../common_widgets/common_funcktion.dart';
import '../home/item_card.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  late final GeneralInfoBloc _generalInfoBloc;
  late final MaintenanceSettingsBloc _maintenanceSettingsBloc;
  late final RefreshTokenBloc _refreshTokenBloc;

  void loadGeneralInfo() {
    _generalInfoBloc.add(GeneralInfoDataEvent());
  }

  @override
  void initState() {
    super.initState();

    _maintenanceSettingsBloc = context.read<MaintenanceSettingsBloc>();
    _refreshTokenBloc = context.read<RefreshTokenBloc>();
    _generalInfoBloc = context.read<GeneralInfoBloc>();

    // 1) Load site general info (logo + maintenance flags etc.)
    loadGeneralInfo();

    // 2) Token check flow (mevcut davranış korunur)
    CommonFunctions.checkTokenAndProceeds(
      refreshTokenBloc: _refreshTokenBloc,
      onProceed: () async {},
      onLogout: () async {
        if (!mounted) return;
        context.goNamed(RouteNames.loginScreen);
      },
    );
  }

  Widget _buildLogo({
    required String? remoteUrl,
    required double height,
    required double width,
  }) {
    if (remoteUrl != null && remoteUrl.trim().isNotEmpty) {
      return Image.network(
        remoteUrl,
        height: height,
        width: width,
        fit: BoxFit.contain,
        errorBuilder: (_, __, ___) => Image.asset(
          Images.logo,
          height: height,
          width: width,
          fit: BoxFit.contain,
        ),
      );
    }

    return Image.asset(
      Images.logo,
      height: height,
      width: width,
      fit: BoxFit.contain,
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;

    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            BlocConsumer<GeneralInfoBloc, GeneralInfoState>(
              listener: (context, state) {
                if (state is GeneralInfoConnectionError) {
                  CommonFunctions.showUpSnack(
                    context: context,
                    message: t.noInternet,
                  );
                  return;
                }

                if (state is CouponFailure) {
                  // Mevcut projede burada handling boş bırakılmış.
                  return;
                }

                if (state is GeneralInfoLoaded) {
                  final maintenanceMode =
                      state.generalInfoModel.siteSettings.comMaintenanceMode;

                  if (maintenanceMode != null && maintenanceMode == "on") {
                    _maintenanceSettingsBloc.add(MaintenanceSettings());
                  } else {
                    context.goNamed(RouteNames.homeScreen);
                  }
                }
              },
              builder: (context, state) {
                final h = 150.h;
                final w = 180.w;

                // Default: asset logo (loading/initial/error)
                String? logoUrl;

                if (state is GeneralInfoLoaded) {
                  // DB’den gelen dinamik logo
                  // İsterseniz "comSiteWhiteLogo" da kullanabilirsiniz (dark theme için)
                  logoUrl = state.generalInfoModel.siteSettings.comSiteLogo;
                  updateFavicon(state.generalInfoModel.siteSettings.comSiteFavicon);
                }

                return _buildLogo(
                  remoteUrl: logoUrl,
                  height: h,
                  width: w,
                );
              },
            ),

            // Maintenance ekranı (mevcut davranış korunur)
            BlocConsumer<MaintenanceSettingsBloc, MaintenanceSettingsState>(
              listener: (context, state) {
                if (state is BrandConnectionError) {
                  CommonFunctions.showUpSnack(
                    message: t.noInternet,
                    context: context,
                  );
                }
              },
              builder: (context, state) {
                if (state is MaintenanceSettingsLoaded) {
                  final data = state.maintenanceSettingsModel.maintenanceSettings;
                  final endDate = data.comMaintenanceEndDate;

                  if (endDate != null && CommonFunctions.isTimePassed(endDate)) {
                    WidgetsBinding.instance.addPostFrameCallback((_) {
                      if (!context.mounted) return;
                      context.goNamed(RouteNames.homeScreen);
                    });
                    return const SizedBox();
                  }

                  return SizedBox(
                    width: double.infinity,
                    height: 500,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          data.comMaintenanceTitle ?? "",
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                fontSize: 14.sp,
                                color: const Color(0xFF0F172A),
                                fontWeight: FontWeight.w600,
                              ),
                        ),
                        SizedBox(height: 6.h),
                        Text(
                          data.comMaintenanceTitle ?? "",
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                fontSize: 12.sp,
                                color: const Color(0xFF0F172A),
                                fontWeight: FontWeight.w400,
                              ),
                        ),
                        SizedBox(height: 6.h),
                        if (data.comMaintenanceEndDate != null)
                          Countdown(
                            targetDate: DateTime.parse(data.comMaintenanceEndDate),
                            bgColor: Colors.white,
                            textColor: Colors.black,
                          ),
                        SizedBox(height: 6.h),
                        CommonImage(
                          imageUrl: data.comMaintenanceImage ?? "",
                          height: 180.h,
                          width: double.infinity,
                        ),
                      ],
                    ),
                  );
                }

                if (state is BrandLoading) {
                  return const ShimmerLoadingWidget();
                }

                return const SizedBox();
              },
            ),
          ],
        ),
      ),
    );
  }
}

class Countdown extends StatefulWidget {
  final DateTime targetDate;
  final Color bgColor;
  final Color textColor;

  const Countdown({
    super.key,
    required this.targetDate,
    required this.bgColor,
    required this.textColor,
  });

  @override
  CountdownState createState() => CountdownState();
}

class CountdownState extends State<Countdown> {
  Timer? _timer;
  List<int> timeLeft = [0, 0, 0, 0]; // [days, hours, minutes, seconds]

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _updateTimeLeft();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => _updateTimeLeft());
  }

  void _updateTimeLeft() {
    final now = DateTime.now();
    final distance = widget.targetDate.difference(now);

    if (distance.isNegative) {
      _timer?.cancel();
      if (!mounted) return;
      setState(() {
        timeLeft = [0, 0, 0, 0];
      });
      return;
    }

    final days = distance.inDays;
    final hours = distance.inHours % 24;
    final minutes = distance.inMinutes % 60;
    final seconds = distance.inSeconds % 60;

    if (!mounted) return;
    setState(() {
      timeLeft = [days, hours, minutes, seconds];
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: timeLeft.asMap().entries.map((entry) {
        final index = entry.key;
        final value = entry.value;

        final label = index == 0
            ? AppLocalizations.of(context)!.days
            : index == 1
                ? AppLocalizations.of(context)!.hours
                : index == 2
                    ? AppLocalizations.of(context)!.minutes
                    : AppLocalizations.of(context)!.seconds;

        return Column(
          children: [
            Container(
              margin: EdgeInsets.only(right: 6.w),
              padding: EdgeInsets.symmetric(horizontal: 4.w),
              height: 28.h,
              decoration: BoxDecoration(
                color: widget.bgColor,
                borderRadius: BorderRadius.circular(5),
              ),
              child: Center(
                child: Text(
                  value.toString().padLeft(2, '0'),
                  style: TextStyle(
                    fontSize: 20.sp,
                    fontWeight: FontWeight.bold,
                    color: widget.textColor,
                  ),
                ),
              ),
            ),
            SizedBox(height: 6.h),
            Text(
              label,
              style: TextStyle(
                fontSize: 5.sp,
                fontWeight: FontWeight.w500,
                color: widget.textColor,
                letterSpacing: 1.2,
              ),
            ),
          ],
        );
      }).toList(),
    );
  }
}
