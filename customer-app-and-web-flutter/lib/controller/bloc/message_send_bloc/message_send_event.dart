import 'package:equatable/equatable.dart';
import 'package:file_picker/file_picker.dart';
import 'package:image_picker/image_picker.dart';


abstract class MessageSendEvent extends Equatable {
  const MessageSendEvent();
}


class MessageSend extends MessageSendEvent {
  final List <PlatformFile> files;
  final String receiverId,message,receiverType, token;
  const MessageSend({required this.receiverId,required this.message,required this.receiverType,required this.files,required this.token});
  @override
  List<Object?> get props => [receiverId,message,receiverType,files,token];
}

class SendTicketMessage extends MessageSendEvent {
  final String message, ticketId, token;
  final XFile image;
  const SendTicketMessage(
      {required this.message,
        required this.image,
        required this.ticketId,
        required this.token});
  @override
  List<Object?> get props => [message, image, ticketId, token];
}

class UploadConnectionErrorEvent extends MessageSendEvent {
  @override
  List<Object?> get props => [];
}
