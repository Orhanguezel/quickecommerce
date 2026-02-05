import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../controller/bloc/general_info_bloc/general_info_bloc.dart';
import '../controller/bloc/general_info_bloc/general_info_state.dart';
import '../controller/bloc/maintenence_settings_bloc/maintenance_settings_bloc.dart';
import '../controller/bloc/maintenence_settings_bloc/maintenance_settings_event.dart';
import '../controller/bloc/maintenence_settings_bloc/maintenance_settings_state.dart';
import '../screens/home/item_card.dart';

class MaintenanceGate extends StatefulWidget {
  const MaintenanceGate({
    super.key,
    required this.child,
  });

  final Widget child;

  @override
  State<MaintenanceGate> createState() => _MaintenanceGateState();
}

class _MaintenanceGateState extends State<MaintenanceGate> {
  bool _requestedSettings = false;

  DateTime? _parseDate(String? value, {bool endOfDay = false}) {
    if (value == null) return null;
    final trimmed = value.trim();
    if (trimmed.isEmpty) return null;

    try {
      final isDateOnly =
          RegExp(r'^\d{4}-\d{2}-\d{2}$').hasMatch(trimmed);
      if (isDateOnly) {
        final parsed = DateTime.parse(trimmed);
        return DateTime.utc(
          parsed.year,
          parsed.month,
          parsed.day,
          endOfDay ? 23 : 0,
          endOfDay ? 59 : 0,
          endOfDay ? 59 : 0,
        );
      }

      var dt = DateTime.parse(trimmed);
      if (!dt.isUtc) {
        dt = dt.toUtc();
      }
      return dt;
    } catch (_) {
      return null;
    }
  }

  bool _isWithinMaintenanceWindow(String? start, String? end) {
    final now = DateTime.now().toUtc();
    final startDate = _parseDate(start, endOfDay: false);
    final endDate = _parseDate(end, endOfDay: true);

    if (startDate == null && endDate == null) {
      return true; // no range -> always active when maintenance mode on
    }
    if (startDate == null && endDate != null) {
      return now.isBefore(endDate) || now.isAtSameMomentAs(endDate);
    }
    if (startDate != null && endDate == null) {
      return now.isAfter(startDate) || now.isAtSameMomentAs(startDate);
    }
    if (startDate != null && endDate != null) {
      // invalid range -> fail-safe (show maintenance)
      if (startDate.isAfter(endDate)) {
        return true;
      }
      return (now.isAfter(startDate) || now.isAtSameMomentAs(startDate)) &&
          (now.isBefore(endDate) || now.isAtSameMomentAs(endDate));
    }
    return false;
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<GeneralInfoBloc, GeneralInfoState>(
      builder: (context, state) {
        if (state is GeneralInfoLoaded) {
          final maintenanceMode =
              state.generalInfoModel.siteSettings.comMaintenanceMode;

          if (maintenanceMode != null && maintenanceMode == "on") {
            if (!_requestedSettings) {
              _requestedSettings = true;
              context.read<MaintenanceSettingsBloc>().add(MaintenanceSettings());
            }
            return _buildMaintenanceView(context);
          }
        }

        _requestedSettings = false;
        return widget.child;
      },
    );
  }

  Widget _buildMaintenanceView(BuildContext context) {
    return BlocBuilder<MaintenanceSettingsBloc, MaintenanceSettingsState>(
      builder: (context, state) {
        if (state is MaintenanceSettingsLoaded) {
          final data = state.maintenanceSettingsModel.maintenanceSettings;
          final startDate = data.comMaintenanceStartDate;
          final endDate = data.comMaintenanceEndDate;

          if (!_isWithinMaintenanceWindow(startDate, endDate)) {
            return widget.child;
          }

          return Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    data.comMaintenanceTitle ?? "Maintenance",
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontSize: 18.sp,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  SizedBox(height: 8.h),
                  Text(
                    data.comMaintenanceDescription ?? "",
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.w400,
                        ),
                  ),
                  SizedBox(height: 16.h),
                  if ((data.comMaintenanceImage ?? "").toString().isNotEmpty)
                    CommonImage(
                      imageUrl: data.comMaintenanceImage ?? "",
                      height: 220.h,
                      width: 320.w,
                      fit: BoxFit.contain,
                    ),
                ],
              ),
            ),
          );
        }

        if (state is MaintenanceSettingsLoading) {
          return const Center(child: CircularProgressIndicator.adaptive());
        }

        return const Center(child: CircularProgressIndicator.adaptive());
      },
    );
  }
}
