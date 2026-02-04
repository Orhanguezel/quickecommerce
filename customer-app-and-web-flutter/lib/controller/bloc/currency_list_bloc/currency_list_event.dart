
import 'package:equatable/equatable.dart';

abstract class CurrencyListEvent extends Equatable {
  const CurrencyListEvent();
}

class CurrencyList extends CurrencyListEvent {
  final String token;
  const CurrencyList({
    required this.token,
  });
  @override
  List<Object?> get props => [token];
}


/// this event is triggered when internet
/// connection is not active

class CurrencyListConnectionErrorEvent extends CurrencyListEvent {
  @override
  List<Object?> get props => [];
}
