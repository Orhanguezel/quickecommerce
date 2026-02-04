
import 'package:equatable/equatable.dart';
import '../../../data/data_model/currencies_info_model.dart';



abstract class CurrencyState extends Equatable {
  const CurrencyState();
}

class CurrencyInitial extends CurrencyState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class CurrencyLoading extends CurrencyState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class CurrencyLoaded extends CurrencyState{
  final CurrenciesModel currenciesModel;
  const CurrencyLoaded({required this.currenciesModel});
  @override
  List<Object?> get props => [currenciesModel];

}


/// this state represents user has no internet

class CurrencyConnectionError extends CurrencyState {
  @override
  List<Object?> get props => [];
}


/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class CurrencyFailure extends CurrencyState {
  final CurrenciesModel currenciesModel;
  const CurrencyFailure({required this.currenciesModel});
  @override
  List<Object?> get props => [currenciesModel];
}