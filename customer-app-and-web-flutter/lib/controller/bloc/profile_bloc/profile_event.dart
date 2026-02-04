
import 'package:equatable/equatable.dart';

abstract class ProfileEvent extends Equatable {
  const ProfileEvent();
}

class Profile extends ProfileEvent {

  final String token;
  const Profile({
    required this.token,
  });
  @override
  List<Object?> get props => [token];
}

class OrderTrack extends ProfileEvent {

  final String orderId, token;
  const OrderTrack({
    required this.orderId,
    required this.token,
  });
  @override
  List<Object?> get props => [orderId,token];
}

class DepartmentList extends ProfileEvent {

  final String token;
  const DepartmentList({
    required this.token,
  });
  @override
  List<Object?> get props => [token];
}
/// this event is triggered when internet
/// connection is not active

class ProfileConnectionErrorEvent extends ProfileEvent {
  @override
  List<Object?> get props => [];
}
