

import 'package:equatable/equatable.dart';

abstract class DeliveryChargeEvent extends Equatable {
  const DeliveryChargeEvent();
}

class DeliveryCharge extends DeliveryChargeEvent {
  final double cLatitude,cLongitude;
  final  List<int> ariaIds;
  const DeliveryCharge({
    required this.ariaIds,
    required this.cLatitude,
    required this.cLongitude

  });
  @override
  List<Object?> get props => [ariaIds,cLatitude,cLongitude];
}


/// this event is triggered when internet
/// connection is not active

class DeliveryChargeConnectionErrorEvent extends DeliveryChargeEvent {
  @override
  List<Object?> get props => [];
}
