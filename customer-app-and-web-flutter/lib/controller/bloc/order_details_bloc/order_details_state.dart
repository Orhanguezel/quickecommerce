
import 'package:equatable/equatable.dart';
import '../../../data/data_model/order_details_model.dart';



abstract class OrderDetailsState extends Equatable {
  const OrderDetailsState();
}

class OrderDetailsInitial extends OrderDetailsState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class OrderDetailsLoading extends OrderDetailsState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class OrderDetailsLoaded extends OrderDetailsState{
  final OrderDetailsModel orderDetailsModel;
  final bool hasConnectionError;
  const OrderDetailsLoaded({
    required this.orderDetailsModel,
  this.hasConnectionError=false
  });
  @override
  List<Object?> get props => [orderDetailsModel];
}

/// this state represents user has no internet

class OrderDetailsConnectionError extends OrderDetailsState {
  @override
  List<Object?> get props => [];
}



class OrderDetailsTokenExp extends OrderDetailsState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class OrderDetailsFailure extends OrderDetailsState {
  final OrderDetailsModel orderDetailsModel;
  const OrderDetailsFailure({required this.orderDetailsModel});
  @override
  List<Object?> get props => [orderDetailsModel];
}