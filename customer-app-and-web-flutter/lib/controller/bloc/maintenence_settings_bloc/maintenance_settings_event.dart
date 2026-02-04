

import 'package:equatable/equatable.dart';

abstract class MaintenanceSettingsEvent extends Equatable {
  const MaintenanceSettingsEvent();
}

class MaintenanceSettings extends MaintenanceSettingsEvent {
  @override
  List<Object?> get props => [];
}

/// this event is triggered when internet
/// connection is not active

class MaintenanceSettingsConnectionErrorEvent extends MaintenanceSettingsEvent {
  @override
  List<Object?> get props => [];
}
