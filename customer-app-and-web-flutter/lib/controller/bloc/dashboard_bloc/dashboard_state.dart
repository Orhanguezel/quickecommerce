
import 'package:equatable/equatable.dart';
import 'package:quick_ecommerce/data/data_model/dashboard_model.dart';


abstract class DashboardState extends Equatable {
  const DashboardState();
}

class DashboardInitial extends DashboardState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class DashboardLoading extends DashboardState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class DashboardLoaded extends DashboardState{
  final DashboardModel dashboardModel;
  const DashboardLoaded({required this.dashboardModel});
  @override
  List<Object?> get props => [dashboardModel];

}

/// this state represents user has no internet

class DashboardConnectionError extends DashboardState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class DashboardFailure extends DashboardState {
  final DashboardModel dashboardModel;
  const DashboardFailure({required this.dashboardModel});
  @override
  List<Object?> get props => [dashboardModel];
}