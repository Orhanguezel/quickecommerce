import 'package:equatable/equatable.dart';
import '../../../data/data_model/notification_model.dart';


abstract class NotificationState extends Equatable {
  const NotificationState();
}

class NotificationInitial extends NotificationState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class NotificationLoading extends NotificationState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class NotificationLoaded extends NotificationState{
  final NotificationModel notificationModel;
  final bool hasConnectionError;
  const NotificationLoaded({required this.notificationModel, this.hasConnectionError=false,});
  @override
  List<Object?> get props => [notificationModel];

}

/// this state represents user has no internet

class NotificationConnectionError extends NotificationState {
  @override
  List<Object?> get props => [];
}


class NotificationTokenExp extends NotificationState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class NotificationFailure extends NotificationState {
  final NotificationModel notificationModel;
  const NotificationFailure({required this.notificationModel});
  @override
  List<Object?> get props => [notificationModel];
}