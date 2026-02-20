
import 'package:equatable/equatable.dart';
import '../../../data/data_model/flush_deal_product_model.dart';



abstract class FlashDealProductState extends Equatable {
  const FlashDealProductState();
}

class FlashDealProductInitial extends FlashDealProductState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class FlashDealProductLoading extends FlashDealProductState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class FlashDealProductLoaded extends FlashDealProductState{
  final FlashDealProductModel flashDealProductModel;
  final bool hasConnectionError;
  const FlashDealProductLoaded({
    required this.flashDealProductModel,
     this.hasConnectionError=false,

  });
  @override
  List<Object?> get props => [flashDealProductModel];

}


/// this state represents user has no internet

class FlashDealProductConnectionError extends FlashDealProductState {
  @override
  List<Object?> get props => [];
}


/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class FlashDealProductFailure extends FlashDealProductState {
  final FlashDealProductModel flashDealProductModel;
  const FlashDealProductFailure({required this.flashDealProductModel});
  @override
  List<Object?> get props => [flashDealProductModel];
}