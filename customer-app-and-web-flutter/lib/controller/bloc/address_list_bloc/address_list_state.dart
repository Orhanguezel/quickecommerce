
import 'package:equatable/equatable.dart';
import '../../../data/data_model/address_model.dart';



abstract class AddressListState extends Equatable {
  const AddressListState();
}

class AddressListInitial extends AddressListState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class AddressListLoading extends AddressListState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class AddressListLoaded extends AddressListState{
  final List<AddressListModel> addressList;
  final bool hasConnectionError;
  const AddressListLoaded({
    required this.addressList,
    this.hasConnectionError = false,});
  @override
  List<Object?> get props => [addressList];

}


/// this state represents user has no internet

class AddressListConnectionError extends AddressListState {
  @override
  List<Object?> get props => [];
}



class AddressListTokenExp extends AddressListState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class AddressListFailure extends AddressListState {
  final List<AddressListModel> addressList;
  const AddressListFailure({required this.addressList});
  @override
  List<Object?> get props => [addressList];
}