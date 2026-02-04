
import 'package:equatable/equatable.dart';

abstract class StoreDetailsEvent extends Equatable {
  const StoreDetailsEvent();
}

class StoreDetails extends StoreDetailsEvent {
  final String slug,token;
  const StoreDetails({
    required this.slug,
    required this.token,
  });
  @override
  List<Object?> get props => [];
}



/// this event is triggered when internet
/// connection is not active

class StoreDetailsConnectionErrorEvent extends StoreDetailsEvent {
  @override
  List<Object?> get props => [];
}
