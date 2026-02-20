import 'package:equatable/equatable.dart';
import '../../../data/data_model/best_sale_model.dart';


abstract class BestSaleState extends Equatable {
  const BestSaleState();
}

class BestSaleInitial extends BestSaleState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class BestSaleLoading extends BestSaleState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class BestSaleLoaded extends BestSaleState{
  final BestSaleModel bestSaleModel;
  final bool hasConnectionError;
  const BestSaleLoaded({
    required this.bestSaleModel,
     this.hasConnectionError=false,
  });
  @override
  List<Object?> get props => [bestSaleModel];

}

/// this state represents user has no internet

class BestSaleConnectionError extends BestSaleState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class BestSaleFailure extends BestSaleState {
  final BestSaleModel bestSaleModel;
  const BestSaleFailure({required this.bestSaleModel});
  @override
  List<Object?> get props => [bestSaleModel];
}