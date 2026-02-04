
import 'package:equatable/equatable.dart';
import '../../../data/data_model/flush_deal_model.dart';



abstract class FlashDealState extends Equatable {
  const FlashDealState();
}

class FlashDealInitial extends FlashDealState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class FlashDealLoading extends FlashDealState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class FlashDealLoaded extends FlashDealState{
  final FlashDealModel flashDealModel;
  const FlashDealLoaded({required this.flashDealModel});
  @override
  List<Object?> get props => [flashDealModel];

}


/// this state represents user has no internet

class FlashDealConnectionError extends FlashDealState {
  @override
  List<Object?> get props => [];
}


/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class FlashDealFailure extends FlashDealState {
  final FlashDealModel flashDealModel;
  const FlashDealFailure({required this.flashDealModel});
  @override
  List<Object?> get props => [flashDealModel];
}