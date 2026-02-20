
import 'package:equatable/equatable.dart';

abstract class AddressListEvent extends Equatable {
  const AddressListEvent();
}

class AddressList extends AddressListEvent {
  final String id, type,status,token;
  const AddressList({
    required this.id,
    required this.type,
    required this.status,
    required this.token,
  });
  @override
  List<Object?> get props => [];
}



/// this event is triggered when internet
/// connection is not active

class AddressListConnectionErrorEvent extends AddressListEvent {
  @override
  List<Object?> get props => [];
}
