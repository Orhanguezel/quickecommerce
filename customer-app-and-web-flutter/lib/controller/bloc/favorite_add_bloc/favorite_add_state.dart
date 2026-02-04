
import 'package:equatable/equatable.dart';

import '../../../data/data_model/login_model.dart';


abstract class FavoriteAddState extends Equatable {
  const FavoriteAddState();
}

class FavoriteAddInitial extends FavoriteAddState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class FavoriteAddLoading extends FavoriteAddState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class FavoriteAddLoaded extends FavoriteAddState{
  final AuthModel authModel;
  final bool hasConnectionError;
  const FavoriteAddLoaded({
    required this.authModel,
     this.hasConnectionError=false,
  });
  @override
  List<Object?> get props => [authModel];

}

/// this state represents user has no internet

class FavoriteAddConnectionError extends FavoriteAddState {
  @override
  List<Object?> get props => [];
}
/// this state represents user has no internet

class FavoriteAddTokenExp extends FavoriteAddState {
  @override
  List<Object?> get props => [];
}
/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class FavoriteAddFailure extends FavoriteAddState {
  final AuthModel authModel;
  const FavoriteAddFailure({required this.authModel});
  @override
  List<Object?> get props => [authModel];
}