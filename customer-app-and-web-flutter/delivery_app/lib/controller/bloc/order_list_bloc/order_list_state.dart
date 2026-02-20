
import 'package:equatable/equatable.dart';
import '../../../data/data_model/order_list.dart';



abstract class OrderListState extends Equatable {
  const OrderListState();
}

class OrderListInitial extends OrderListState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class OrderListLoading extends OrderListState {
  @override
  List<Object> get props => [];
}
/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class OrderListLoaded extends OrderListState{
  final OrderListModel orderListModel;
  final bool hasConnectionError;
  const OrderListLoaded({required this.orderListModel,
    this.hasConnectionError = false,
  });
  @override
  List<Object?> get props => [orderListModel];
}

/// this state represents user has no internet

class OrderListConnectionError extends OrderListState {
  @override
  List<Object?> get props => [];
}



class OrderListTokenExp extends OrderListState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class OrderListFailure extends OrderListState {
  final OrderListModel orderListModel;
  const OrderListFailure({required this.orderListModel});
  @override
  List<Object?> get props => [orderListModel];
}