
import 'package:equatable/equatable.dart';

import '../../../data/data_model/brand_model.dart';


abstract class BrandState extends Equatable {
  const BrandState();
}

class BrandInitial extends BrandState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class BrandLoading extends BrandState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data


class BrandLoaded extends BrandState{
  final List<BrandModel> brandModel;
  final bool hasConnectionError;
  const BrandLoaded({
    required this.brandModel,
     this.hasConnectionError=false,
  });
  @override
  List<Object?> get props => [brandModel];
}

/// this state represents user has no internet

class BrandConnectionError extends BrandState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class BrandFailure extends BrandState {
  final BrandModel brandModel;
  const BrandFailure({required this.brandModel});
  @override
  List<Object?> get props => [brandModel];
}