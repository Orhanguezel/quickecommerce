
import 'package:equatable/equatable.dart';

abstract class CurrencyEvent extends Equatable {
  const CurrencyEvent();
}

class Currency extends CurrencyEvent {
  final String token;
  const Currency({
    required this.token,
  });
  @override
  List<Object?> get props => [token];
}


/// this event is triggered when internet
/// connection is not active

class CurrencyConnectionErrorEvent extends CurrencyEvent {
  @override
  List<Object?> get props => [];
}
