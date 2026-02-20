
import 'package:equatable/equatable.dart';

import '../../../data/data_model/coupon_model.dart';


abstract class CouponState extends Equatable {
  const CouponState();
}

class CouponInitial extends CouponState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class CouponLoading extends CouponState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class CouponLoaded extends CouponState{
  final CouponModel couponModel;
  final bool hasConnectionError;
  const CouponLoaded({required this.couponModel,this.hasConnectionError = false,});
  @override
  List<Object?> get props => [couponModel];

}

/// this state represents user has no internet

class CouponConnectionError extends CouponState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class CouponFailure extends CouponState {
  final CouponModel couponModel;
  const CouponFailure({required this.couponModel});
  @override
  List<Object?> get props => [couponModel];
}