
import 'package:equatable/equatable.dart';
import '../../../data/data_model/store_list_model.dart';



abstract class StoreListState extends Equatable {
  const StoreListState();
}

class StoreListInitial extends StoreListState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class StoreListLoading extends StoreListState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class StoreListLoaded extends StoreListState{
  final StoreListModel storeListModel;
  final bool hasConnectionError;
  const StoreListLoaded({
    required this.storeListModel,
    this.hasConnectionError=false
  });
  @override
  List<Object?> get props => [storeListModel];

}


/// this state represents user has no internet

class StoreListConnectionError extends StoreListState {
  @override
  List<Object?> get props => [];
}


/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class StoreListFailure extends StoreListState {
  final StoreListModel storeListModel;
  const StoreListFailure({required this.storeListModel});
  @override
  List<Object?> get props => [storeListModel];
}