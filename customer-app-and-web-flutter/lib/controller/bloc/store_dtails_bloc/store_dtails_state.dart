
import 'package:equatable/equatable.dart';
import '../../../data/data_model/store_details_model.dart';



abstract class StoreDetailsState extends Equatable {
  const StoreDetailsState();
}

class StoreDetailsInitial extends StoreDetailsState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class StoreDetailsLoading extends StoreDetailsState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class StoreDetailsLoaded extends StoreDetailsState{
  final StoreDetailsModel storeDetailsModel;
  final bool hasConnectionError;
  const StoreDetailsLoaded({
    required this.storeDetailsModel,
     this.hasConnectionError=false,

  });
  @override
  List<Object?> get props => [storeDetailsModel];

}


/// this state represents user has no internet

class StoreDetailsConnectionError extends StoreDetailsState {
  @override
  List<Object?> get props => [];
}



class StoreDetailsTokenExp extends StoreDetailsState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class StoreDetailsFailure extends StoreDetailsState {
  final StoreDetailsModel storeDetailsModel;
  const StoreDetailsFailure({required this.storeDetailsModel});
  @override
  List<Object?> get props => [storeDetailsModel];
}