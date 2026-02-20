
import 'package:equatable/equatable.dart';
import '../../../data/data_model/favorites_model.dart';
import '../../../data/data_model/store_model.dart';



abstract class FavoritesState extends Equatable {
  const FavoritesState();
}

class FavoritesInitial extends FavoritesState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class FavoritesLoading extends FavoritesState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class FavoritesLoaded extends FavoritesState{
  final FavoritesModel favoritesModel;
  final bool hasConnectionError;
  const FavoritesLoaded({required this.favoritesModel, this.hasConnectionError=false,});
  @override
  List<Object?> get props => [favoritesModel];

}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class StoreTypeLoaded extends FavoritesState{
  final List<StoreTypeModel> storeTypeModel;
  final bool hasConnectionError;
  const StoreTypeLoaded({required this.storeTypeModel,
    this.hasConnectionError = false,
  });
  @override
  List<Object?> get props => [storeTypeModel];

}

/// this state represents user has no internet

class FavoritesConnectionError extends FavoritesState {
  @override
  List<Object?> get props => [];
}



class FavoritesTokenExp extends FavoritesState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class FavoritesFailure extends FavoritesState {
  final FavoritesModel favoritesModel;
  const FavoritesFailure({required this.favoritesModel});
  @override
  List<Object?> get props => [favoritesModel];
}


class StoreTypeFailure extends FavoritesState {
  final  List<StoreTypeModel> storeTypeModel;
  const StoreTypeFailure({required this.storeTypeModel});
  @override
  List<Object?> get props => [storeTypeModel];
}