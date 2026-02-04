import 'package:equatable/equatable.dart';
import '../../../data/data_model/banner_list_model.dart';


abstract class BannerState extends Equatable {
  const BannerState();
}

class BannerInitial extends BannerState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class BannerLoading extends BannerState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class BannerLoaded extends BannerState{
  final BannerListModel bannerListModel;
  final bool hasConnectionError;
  const BannerLoaded({
    required this.bannerListModel,
     this.hasConnectionError=false,

  });
  @override
  List<Object?> get props => [bannerListModel];

}

/// this state represents user has no internet

class BannerConnectionError extends BannerState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class BannerFailure extends BannerState {
  final BannerListModel bannerListModel;
  const BannerFailure({required this.bannerListModel});
  @override
  List<Object?> get props => [bannerListModel];
}