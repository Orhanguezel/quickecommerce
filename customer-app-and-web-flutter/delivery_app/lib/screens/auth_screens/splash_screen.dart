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
  getUserToken() async {
    _generalInfoBloc.add(GeneralInfoDataEvent());
  }

  @override
  void initState() {
    _maintenanceSettingsBloc = context.read<MaintenanceSettingsBloc>();
    _refreshTokenBloc = context.read<RefreshTokenBloc>();
    _generalInfoBloc = context.read<GeneralInfoBloc>();
    getUserToken();
    CommonFunctions.checkTokenAndProceeds(
        refreshTokenBloc: _refreshTokenBloc,
        onProceed: () async {},
        onLogout: () async {
          context.goNamed(RouteNames.loginScreen);
        });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
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
                      message: AppLocalizations.of(context)!.noInternet);
                } else if (state is CouponFailure) {
                } else if (state is GeneralInfoLoaded) {
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
                if (state is GeneralInfoLoading) {
                  return Image.asset(
                    Images.logo,
                    height: 150.h,
                    width: 180.w,
                  );
                }
                return GestureDetector(
                  onTap: () {
                    context.goNamed(RouteNames.homeScreen);
                  },
                  child: Image.asset(
                    Images.logo,
                    height: 150.h,
                    width: 180.w,
                  ),
                );
              },
            ),
            BlocConsumer<MaintenanceSettingsBloc, MaintenanceSettingsState>(
              listener: (context, state) {
                if (state is BrandConnectionError) {
                  CommonFunctions.showUpSnack(
                    message: AppLocalizations.of(context)!.noInternet,
                    context: context,
                  );
                }
              },
              builder: (context, state) {
                if (state is MaintenanceSettingsLoaded) {
                  var data = state.maintenanceSettingsModel.maintenanceSettings;
                  final endDate = data.comMaintenanceEndDate;
                  if (CommonFunctions.isTimePassed(endDate)) {
                    WidgetsBinding.instance.addPostFrameCallback((_) {
                      context.goNamed(RouteNames.homeScreen);
                    });
                  } else {
                    return SizedBox(
                      width: double.infinity,
                      height: 500,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Text(
                            data.comMaintenanceTitle ?? "",
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(
                                    fontSize: 14.sp,
                                    color: const Color(0xFF0F172A),
                                    fontWeight: FontWeight.w600),
                          ),
                          SizedBox(
                            height: 6.h,
                          ),
                          Text(
                            data.comMaintenanceTitle ?? "",
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(
                                    fontSize: 12.sp,
                                    color: const Color(0xFF0F172A),
                                    fontWeight: FontWeight.w400),
                          ),
                          SizedBox(
                            height: 6.h,
                          ),
                          Countdown(
                            targetDate:
                                DateTime.parse(data.comMaintenanceEndDate),
                            bgColor: Colors.white,
                            textColor: Colors.black,
                          ),
                          SizedBox(
                            height: 6.h,
                          ),
                          CommonImage(
                            imageUrl: data.comMaintenanceImage ?? "",
                            height: 180.h,
                            width: double.infinity,
                          )
                        ],
                      ),
                    );
                  }
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
  const Countdown(
      {super.key,
      required this.targetDate,
      required this.bgColor,
      required this.textColor});

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
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      _updateTimeLeft();
    });
  }

  void _updateTimeLeft() {
    final now = DateTime.now();
    final distance = widget.targetDate.difference(now);

    if (distance.isNegative) {
      _timer?.cancel();
      setState(() {
        timeLeft = [0, 0, 0, 0]; // Countdown has ended
      });
      return;
    }
    final days = distance.inDays;
    final hours = distance.inHours % 24;
    final minutes = distance.inMinutes % 60;
    final seconds = distance.inSeconds % 60;

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

        return Column(
          children: [
            Container(
              margin: EdgeInsets.only(right: 6.w),
              padding: EdgeInsets.symmetric(horizontal: 4.w),
              // width: 45.w,
              height: 28.h,
              decoration: BoxDecoration(
                color: widget.bgColor,
                borderRadius: BorderRadius.circular(5),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    value.toString().padLeft(2, '0'),
                    style: TextStyle(
                      fontSize: 20.sp,
                      fontWeight: FontWeight.bold,
                      // color: Colors.black,
                      color: widget.textColor,
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(height: 6.h),
            Text(
              index == 0
                  ? AppLocalizations.of(context)!.days
                  : index == 1
                      ? AppLocalizations.of(context)!.hours
                      : index == 2
                          ? AppLocalizations.of(context)!.minutes
                          : AppLocalizations.of(context)!.seconds,
              style: TextStyle(
                fontSize: 5.sp,
                fontWeight: FontWeight.w500,
                color: widget.textColor,
                // color: Colors.black,
                letterSpacing: 1.2,
              ),
            ),
          ],
        );
      }).toList(),
    );
  }
}