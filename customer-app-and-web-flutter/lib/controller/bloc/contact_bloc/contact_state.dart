
import 'package:equatable/equatable.dart';
import '../../../data/data_model/contact_model.dart';


abstract class ContactState extends Equatable {
  const ContactState();
}

class ContactInitial extends ContactState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class ContactLoading extends ContactState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class ContactLoaded extends ContactState{
  final ContactModel contactModel;
  final bool hasConnectionError;
  const ContactLoaded({required this.contactModel,this.hasConnectionError = false,});
  @override
  List<Object?> get props => [contactModel];

}

/// this state represents user has no internet

class ContactConnectionError extends ContactState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class ContactFailure extends ContactState {
  final ContactModel contactModel;
  const ContactFailure({required this.contactModel});
  @override
  List<Object?> get props => [contactModel];
}