
import 'package:equatable/equatable.dart';

import '../../../data/data_model/login_model.dart';



abstract class MessageSendState extends Equatable {
  const MessageSendState();
}

class MessageSendInitial extends MessageSendState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class MessageSendLoading extends MessageSendState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class MessageSendLoaded extends MessageSendState{
  final AuthModel authModel;
  final bool hasConnectionError;
  const MessageSendLoaded({required this.authModel,
  this.hasConnectionError=false
  });
  @override
  List<Object?> get props => [authModel];

}

/// this state represents user has no internet

class MessageSendConnectionError extends MessageSendState {
  @override
  List<Object?> get props => [];
}
/// this state represents user has no internet

class MessageSendTokenExp extends MessageSendState {
  @override
  List<Object?> get props => [];
}
/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class MessageSendFailure extends MessageSendState {
  final AuthModel authModel;
  const MessageSendFailure({required this.authModel});
  @override
  List<Object?> get props => [authModel];
}