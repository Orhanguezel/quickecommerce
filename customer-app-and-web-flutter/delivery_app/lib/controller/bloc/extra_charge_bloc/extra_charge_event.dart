

import 'package:equatable/equatable.dart';

abstract class ExtraChargeEvent extends Equatable {
  const ExtraChargeEvent();
}

class ExtraChargeData extends ExtraChargeEvent {
  final List<int> productIds;
  const ExtraChargeData({required this.productIds});
  @override
  List<Object?> get props => [productIds];
}


/// this event is triggered when internet
/// connection is not active

class ExtraChargeConnectionErrorEvent extends ExtraChargeEvent {
  @override
  List<Object?> get props => [];
}
