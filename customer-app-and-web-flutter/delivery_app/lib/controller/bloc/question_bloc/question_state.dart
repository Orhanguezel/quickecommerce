
import 'package:equatable/equatable.dart';
import '../../../data/data_model/question_mode.dart';


abstract class QuestionState extends Equatable {
  const QuestionState();
}

class QuestionInitial extends QuestionState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class QuestionLoading extends QuestionState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class QuestionLoaded extends QuestionState{
  final QuestionModel questionModel;
  const QuestionLoaded({required this.questionModel});
  @override
  List<Object?> get props => [questionModel];

}

/// this state represents user has no internet

class QuestionConnectionError extends QuestionState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class QuestionFailure extends QuestionState {
  final QuestionModel questionModel;
  const QuestionFailure({required this.questionModel});
  @override
  List<Object?> get props => [questionModel];
}