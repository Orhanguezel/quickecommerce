
import 'package:equatable/equatable.dart';

import '../../../data/data_model/payment_gateways_model.dart';
import '../../../data/data_model/product_details_settings_model.dart';


abstract class PaymentGatewaysState extends Equatable {
  const PaymentGatewaysState();
}

class PaymentGatewaysInitial extends PaymentGatewaysState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class PaymentGatewaysLoading extends PaymentGatewaysState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class PaymentGatewaysLoaded extends PaymentGatewaysState{
  final PaymentGatewaysModel paymentGatewaysModel;
  final bool hasConnectionError;
  const PaymentGatewaysLoaded({
    required this.paymentGatewaysModel,
  this.hasConnectionError=false
  });
  @override
  List<Object?> get props => [paymentGatewaysModel];
}


class ProductDetailsSettingLoaded extends PaymentGatewaysState{
  final ProductDetailsSettingsModel productDetailsSettingsModel;
  final bool hasConnectionError;
  const ProductDetailsSettingLoaded({
    required this.productDetailsSettingsModel,
    this.hasConnectionError=false
  });
  @override
  List<Object?> get props => [productDetailsSettingsModel];
}

/// this state represents user has no internet

class PaymentGatewaysConnectionError extends PaymentGatewaysState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class PaymentGatewaysFailure extends PaymentGatewaysState {
  final PaymentGatewaysModel paymentGatewaysModel;
  const PaymentGatewaysFailure({required this.paymentGatewaysModel});
  @override
  List<Object?> get props => [paymentGatewaysModel];
}