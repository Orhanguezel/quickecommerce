
import 'package:equatable/equatable.dart';

abstract class GetMessageEvent extends Equatable {
  const GetMessageEvent();
}

class GetMessage extends GetMessageEvent {
  final String ticketId,token;
  const GetMessage({
    required this.ticketId,
    required this.token,
  });
  @override
  List<Object?> get props => [];
}

class GetTaxInfo extends GetMessageEvent {
  final String token;
  final List storeIds;
  const GetTaxInfo({
    required this.storeIds,
    required this.token,
  });
  @override
  List<Object?> get props => [storeIds,token];
}


/// this event is triggered when internet
/// connection is not active

class StoreDetailsConnectionErrorEvent extends GetMessageEvent {
  @override
  List<Object?> get props => [];
}
