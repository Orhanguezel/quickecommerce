import 'package:equatable/equatable.dart';
import '../../../data/data_model/slider_model.dart';


abstract class SliderListState extends Equatable {
  const SliderListState();
}

class SliderListInitial extends SliderListState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class SliderListLoading extends SliderListState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class SliderListLoaded extends SliderListState{
  final SliderModel sliderModel;
  final bool hasConnectionError;
  const SliderListLoaded({
    required this.sliderModel,
     this.hasConnectionError=false,
  });
  @override
  List<Object?> get props => [sliderModel];

}

/// this state represents user has no internet

class SliderListConnectionError extends SliderListState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class SliderListFailure extends SliderListState {
  final SliderModel sliderModel;
  const SliderListFailure({required this.sliderModel});
  @override
  List<Object?> get props => [sliderModel];
}