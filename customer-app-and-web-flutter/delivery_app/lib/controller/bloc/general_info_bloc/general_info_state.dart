
import 'package:equatable/equatable.dart';
import '../../../data/data_model/coupon_list_model.dart';
import '../../../data/data_model/general_info_model.dart';


abstract class GeneralInfoState extends Equatable {
  const GeneralInfoState();
}

class GeneralInfoInitial extends GeneralInfoState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class GeneralInfoLoading extends GeneralInfoState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class GeneralInfoLoaded extends GeneralInfoState{
  final GeneralInfoModel generalInfoModel;
  const GeneralInfoLoaded({required this.generalInfoModel});
  @override
  List<Object?> get props => [generalInfoModel];

}

/// this state represents user has no internet

class GeneralInfoConnectionError extends GeneralInfoState {
  @override
  List<Object?> get props => [];
}




class CouponLoaded extends GeneralInfoState{
  final CouponListModel couponListModel;
  const CouponLoaded({required this.couponListModel});
  @override
  List<Object?> get props => [couponListModel];

}




class CouponFailure extends GeneralInfoState {
  final CouponListModel couponListModel;
  const CouponFailure({required this.couponListModel});
  @override
  List<Object?> get props => [couponListModel];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class GeneralInfoFailure extends GeneralInfoState {
  final GeneralInfoModel generalInfoModel;
  const GeneralInfoFailure({required this.generalInfoModel});
  @override
  List<Object?> get props => [generalInfoModel];
}