
import 'package:equatable/equatable.dart';

abstract class FlashDealProductEvent extends Equatable {
  const FlashDealProductEvent();
}

class FlashDealProduct extends FlashDealProductEvent {
  final String parPage,language,token;
  final int page;
  const FlashDealProduct({
    required this.parPage,
    required this.language,
    required this.token,
    required this.page,
  });
  @override
  List<Object?> get props => [parPage,page,language,token];
}


/// this event is triggered when internet
/// connection is not active

class FlashDealProductConnectionErrorEvent extends FlashDealProductEvent {
  @override
  List<Object?> get props => [];
}
