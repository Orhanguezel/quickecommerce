

import 'package:equatable/equatable.dart';

abstract class DashboardEvent extends Equatable {
  const DashboardEvent();
}

class Dashboard extends DashboardEvent {
  final String language, token;
  const Dashboard({
    required this.language,
    required this.token,
  });
  @override
  List<Object?> get props => [language,token];
}


/// this event is triggered when internet
/// connection is not active

class DashboardConnectionErrorEvent extends DashboardEvent {
  @override
  List<Object?> get props => [];
}
