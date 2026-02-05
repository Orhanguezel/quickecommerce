//===========This class contains Common functions=================
//-----------------------------------------------------------------

import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:geolocator/geolocator.dart';
import 'package:quick_ecommerce/controller/bloc/refresh_token/refresh_token_state.dart';
import '../../config/colors.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/refresh_token/refresh_token_bloc.dart';
import '../../controller/bloc/refresh_token/refresh_token_event.dart';

class CommonFunctions {
  /// this function refers the logout functionality
  /// for all end user. when customer tap on logout
  /// we redirect him/her to login page and
  /// remove all the information saved on local machine.
  static void logOut() async {
    await UserSharedPreference.clearValue(
      SharedPreferenceHelper.token,
    );
  }


  static void showUpSnack({
    required BuildContext context,
    required String message,
    Color color = CustomColors.primaryGreen,
  }) {
    final overlay = Overlay.of(context);
    final overlayEntry = OverlayEntry(
      builder: (context) => Positioned(
        top: MediaQuery.of(context).padding.top + 10, // Top position
        left: 20,
        right: 20,
        child: Container(
          alignment:kIsWeb?Alignment.centerRight:Alignment.center,
          width: kIsWeb
              ? 300
              : MediaQuery.of(context).size.width * 0.9,
          child: Material(
            color: Colors.transparent,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 500),
              curve: Curves.easeOut,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black26,
                    blurRadius:kIsWeb ? 10 : 10.r,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              padding: const EdgeInsets.all(16),
              child: Text(
                message,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: Colors.white,
                  fontSize:kIsWeb ? 14 : 14.sp,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
        ),
      ),
    );
    overlay.insert(overlayEntry);
    // Remove the SnackBar after a delay
    Future.delayed(const Duration(seconds: 2), () {
      overlayEntry.remove();
    });
  }


  static void showCustomSnackBar(BuildContext context, String message,
      {Color color = const Color(0xFFFF2929)}) {
    final overlay = Overlay.of(context);
    final overlayEntry = OverlayEntry(
      builder: (context) => Positioned(
        top: MediaQuery.of(context).padding.top + 40,
        left: 20,
        right: 20,
        child: Container(
          alignment:kIsWeb?Alignment.centerRight:Alignment.center,
          width: kIsWeb
              ? 300
              : MediaQuery.of(context).size.width * 0.9,
          child: Material(
            color: Colors.transparent,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 500),
              curve: Curves.easeOut,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(12),
                boxShadow: const [
                  BoxShadow(
                    color: Colors.grey,
                    blurRadius:1,
                    offset: Offset(0, 1),
                  ),
                ],
              ),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              child: Text(
                message,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ),
      ),
    );
    overlay.insert(overlayEntry);
    Future.delayed(const Duration(seconds: 3)).then((_) {
      if (overlayEntry.mounted) {
        overlayEntry.remove();
      }
    });
  }

  static Future<Position?> perMissionCheck() async {
    Position? position;
    LocationPermission permission = await Geolocator.checkPermission();
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();

    if (!serviceEnabled) {
      // Request to enable location services
      return Future.error("Location services are disabled.");
    }

    if (permission == LocationPermission.deniedForever) {
      // Permissions are permanently denied
      return Future.error(
        "Location permissions are permanently denied. Enable them in settings.",
      );
    }

    if (permission == LocationPermission.denied) {
      // Request permission
      permission = await Geolocator.requestPermission();
      if (permission != LocationPermission.always &&
          permission != LocationPermission.whileInUse) {
        return Future.error("Location permissions are denied.");
      }
    }

    // Fetch current position if permission is granted
    if (permission == LocationPermission.always ||
        permission == LocationPermission.whileInUse) {
      position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
        ),
      );
    }

    return position;
  }

 static bool isTimePassed(String internationalTime) {
    try {
      final trimmed = internationalTime.trim();
      if (trimmed.isEmpty) return true;

      DateTime expiryTime;

      // Handle date-only strings: "YYYY-MM-DD"
      final isDateOnly = RegExp(r'^\d{4}-\d{2}-\d{2}$').hasMatch(trimmed);
      if (isDateOnly) {
        final parsed = DateTime.parse(trimmed);
        expiryTime = DateTime.utc(
          parsed.year,
          parsed.month,
          parsed.day,
          23,
          59,
          59,
        );
      } else {
        expiryTime = DateTime.parse(trimmed);
        if (!expiryTime.isUtc) {
          expiryTime = expiryTime.toUtc();
        }
      }

      final currentTime = DateTime.now().toUtc();
      return currentTime.isAfter(expiryTime);
    } catch (e) {
      return true;
    }
  }

 // static Future<void> checkTokenAndProceed({
 //    required RefreshTokenBloc refreshTokenBloc,
 //    required Future<void> Function() onProceed,
 //  }) async {
 //
 //    final tokenExp = await UserSharedPreference.getValue(SharedPreferenceHelper.tokenExp);
 //    final token = await UserSharedPreference.getValue(SharedPreferenceHelper.token);
 //    if ((token ?? '').isNotEmpty && (tokenExp ?? '').isNotEmpty) {
 //      if (isTimePassed(tokenExp!)) {
 //        refreshTokenBloc.add(RefreshTokenDataEvent(token: token!));
 //        await Future.delayed(const Duration(seconds: 3)).then((_) =>onProceed());
 //      }else{
 //        await onProceed();
 //      }
 //    }else{
 //      await onProceed();
 //    }
 //  }

  static Future<void> checkTokenAndProceeds({
    required RefreshTokenBloc refreshTokenBloc,
    required Future<void> Function() onProceed,
    required Future<void> Function() onLogout,
  }) async {
    final tokenExp = await UserSharedPreference.getValue(SharedPreferenceHelper.tokenExp);
    final token = await UserSharedPreference.getValue(SharedPreferenceHelper.token);

    // If no token or expiry => just proceed
    if ((token ?? '').isEmpty || (tokenExp ?? '').isEmpty) {
      await onProceed();
      return;
    }

    // If token expired => try refresh
    if (isTimePassed(tokenExp!)) {
      final completer = Completer<void>();

      // Listen once for success or failure
      final sub = refreshTokenBloc.stream.listen((state) {
        if (state is RefreshTokenLoaded) {
          completer.complete();
        } else if (state is RefreshTokenFailure) {
          completer.completeError(Exception("Token refresh failed"));
        }
      });

      // Trigger refresh
      refreshTokenBloc.add(RefreshTokenDataEvent(token: token!));

      try {
        await completer.future;
        await onProceed();
      } catch (e) {
        await onLogout();
        rethrow;
      } finally {
        await sub.cancel();
      }
    } else {
      // Token still valid
      await onProceed();
    }
  }

}
