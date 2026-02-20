
import 'package:equatable/equatable.dart';
import '../../../data/data_model/home_section_title_model.dart';



abstract class HomeTitleState extends Equatable {
  const HomeTitleState();
}

class HomeTitleInitial extends HomeTitleState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class HomeTitleLoading extends HomeTitleState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class HomeTitleLoaded extends HomeTitleState{
  final HomeSectionTitleModel homeSectionTitleModel;
  const HomeTitleLoaded({required this.homeSectionTitleModel});
  @override
  List<Object?> get props => [homeSectionTitleModel];

}


/// this state represents user has no internet

class HomeTitleConnectionError extends HomeTitleState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class HomeTitleFailure extends HomeTitleState {
  final HomeSectionTitleModel homeSectionTitleModel;
  const HomeTitleFailure({required this.homeSectionTitleModel});
  @override
  List<Object?> get props => [homeSectionTitleModel];
}