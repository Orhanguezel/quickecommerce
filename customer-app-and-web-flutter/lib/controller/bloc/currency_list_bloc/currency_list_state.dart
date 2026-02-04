
import 'package:equatable/equatable.dart';
import 'package:quick_ecommerce/data/data_model/currency_list_model.dart';



abstract class CurrencyListState extends Equatable {
  const CurrencyListState();
}

class CurrencyListInitial extends CurrencyListState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class CurrencyListLoading extends CurrencyListState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class CurrencyListLoaded extends CurrencyListState{
  final CurrencyListModel currencyListModel;
  const CurrencyListLoaded({required this.currencyListModel});
  @override
  List<Object?> get props => [currencyListModel];

}


/// this state represents user has no internet

class CurrencyListConnectionError extends CurrencyListState {
  @override
  List<Object?> get props => [];
}


/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class CurrencyListFailure extends CurrencyListState {
  final String message ;
  const CurrencyListFailure({required this.message});
  @override
  List<Object?> get props => [message];
}