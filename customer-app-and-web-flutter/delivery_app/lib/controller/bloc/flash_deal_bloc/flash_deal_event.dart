
import 'package:equatable/equatable.dart';

abstract class FlashDealEvent extends Equatable {
  const FlashDealEvent();
}

class FlashDeal extends FlashDealEvent {
  @override
  List<Object?> get props => [];
}


/// this event is triggered when internet
/// connection is not active

class FlashDealConnectionErrorEvent extends FlashDealEvent {
  @override
  List<Object?> get props => [];
}
