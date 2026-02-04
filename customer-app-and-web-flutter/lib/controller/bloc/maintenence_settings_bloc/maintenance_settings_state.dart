
import 'package:equatable/equatable.dart';

import '../../../data/data_model/brand_model.dart';
import '../../../data/data_model/maintenance_settings.dart';


abstract class MaintenanceSettingsState extends Equatable {
  const MaintenanceSettingsState();
}

class MaintenanceSettingsInitial extends MaintenanceSettingsState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class MaintenanceSettingsLoading extends MaintenanceSettingsState {
  @override
  List<Object> get props => [];
}



class MaintenanceSettingsLoaded extends MaintenanceSettingsState{
  final MaintenanceSettingsModel maintenanceSettingsModel;
  final bool hasConnectionError;
  const MaintenanceSettingsLoaded({
    required this.maintenanceSettingsModel,
     this.hasConnectionError=false,
  });
  @override
  List<Object?> get props => [maintenanceSettingsModel];

}

/// this state represents user has no internet

class MaintenanceSettingsConnectionError extends MaintenanceSettingsState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class MaintenanceSettingsFailure extends MaintenanceSettingsState {
  final BrandModel brandModel;
  const MaintenanceSettingsFailure({required this.brandModel});
  @override
  List<Object?> get props => [brandModel];
}