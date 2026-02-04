

import 'package:equatable/equatable.dart';

abstract class ContactEvent extends Equatable {
  const ContactEvent();
}

class ContactUsEvent extends ContactEvent {
  final String language;
  const ContactUsEvent({required this.language});
  @override
  List<Object?> get props => [language];
}


/// this event is triggered when internet
/// connection is not active

class ContactConnectionErrorEvent extends ContactEvent {
  @override
  List<Object?> get props => [];
}
