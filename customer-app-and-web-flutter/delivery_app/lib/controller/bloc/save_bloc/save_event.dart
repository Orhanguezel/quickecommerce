import 'package:equatable/equatable.dart';
import 'package:image_picker/image_picker.dart';

abstract class SaveEvent extends Equatable {
  const SaveEvent();
}

class ProfileEdit extends SaveEvent {
  final String firstName, lastName, phone, image, birthDay, gender, token;
  const ProfileEdit({
    required this.firstName,
    required this.lastName,
    required this.phone,
    required this.image,
    required this.birthDay,
    required this.gender,
    required this.token,
  });
  @override
  List<Object?> get props =>
      [firstName, lastName, phone, image, birthDay, gender, token];
}



class RequestRefundEvent extends SaveEvent {
  final String orderId, reasonId, note, token;
  final XFile? image;
  const RequestRefundEvent(
      {required this.orderId,
      required this.reasonId,
      required this.note,
       this.image,
      required this.token});
  @override
  List<Object?> get props => [orderId, reasonId, note, image, token];
}



class ContactMessage extends SaveEvent {
  final String name, email, phone, message;

  const ContactMessage(
      {required this.name,
      required this.email,
      required this.phone,
      required this.message});
  @override
  List<Object?> get props => [name, email, phone, message];
}


class AskQuestion extends SaveEvent {
  final String productId, storeId, question,token;

  const AskQuestion(
      {required this.productId,
      required this.storeId,
      required this.question,
      required this.token
      });
  @override
  List<Object?> get props => [productId, storeId, question,token];
}
class AddTicket extends SaveEvent {
  final String departmentId, title, subject, priority, token;

  const AddTicket(
      {required this.departmentId,
        required this.title,
        required this.subject,
        required this.priority,
        required this.token});
  @override
  List<Object?> get props => [departmentId, title, subject, priority, token];
}
class UpdateTicket extends SaveEvent {
  final String id, departmentId, title, subject, priority, token;
  const UpdateTicket(
      {required this.id,
      required this.departmentId,
      required this.title,
      required this.subject,
      required this.priority,
      required this.token});
  @override
  List<Object?> get props =>
      [id, departmentId, title, subject, priority, token];
}

class ResolveTicket extends SaveEvent {
  final String id, token;
  const ResolveTicket(
      {required this.id,
      required this.token});
  @override
  List<Object?> get props =>
      [id,token];
}


class NotificationRead extends SaveEvent {
  final String id, token;
  const NotificationRead({required this.id, required this.token});
  @override
  List<Object?> get props => [id, token];
}

class Deposit extends SaveEvent {
  final String transactionId, transactionDetails,currencyCode, type, purpose,paymentGateway, token;
  final int walletId, status;
  final double amount;
  const Deposit(
      {required this.walletId,
      required this.transactionId,
      required this.transactionDetails,
      required this.amount,
      required this.currencyCode,
      required this.type,
      required this.purpose,
      required this.paymentGateway,
      required this.status,
      required this.token});
  @override
  List<Object?> get props => [
        walletId,
        transactionId,
        transactionDetails,
        amount,
    currencyCode,
        type,
        purpose,
    paymentGateway,
        status,
        token
      ];
}






class ReviewAdd extends SaveEvent {
  final String orderId,storeId,reviewableId,type,review,rating,token;
  const ReviewAdd({
    required this.orderId,
    required this.storeId,
    required this.reviewableId,
    required this.type,
    required this.review,
    required this.rating,
    required this.token
  });
  @override
  List<Object?> get props => [orderId,storeId,reviewableId,type,review,rating,token];
}

class ReviewReaction extends SaveEvent {
  final String reviewId,reactionType,token;
  const ReviewReaction({
    required this.reviewId,
    required this.reactionType,
    required this.token
  });
  @override
  List<Object?> get props => [reviewId,reactionType,token];
}



class ActivateDeactivate extends SaveEvent {
  final String reason, description, type, token;

  const ActivateDeactivate(
      {required this.reason,
      required this.description,
      required this.type,
      required this.token});
  @override
  List<Object?> get props => [reason, description, type, token];
}

class DeleteAccountEvent extends SaveEvent {
  final String  token;

  const DeleteAccountEvent(
      {required this.token});
  @override
  List<Object?> get props => [token];
}




class SendOtpEvent extends SaveEvent {
  final String phone, region;
  const SendOtpEvent(
      {required this.phone,
        required this.region,});
  @override
  List<Object?> get props => [phone,region];
}

class VerifyOtpEvent extends SaveEvent {
  final String phone,region,oTP;
  final bool rememberMe;
  const VerifyOtpEvent(
      {
        required this.phone,
        required this.region,
        required this.oTP,
        required this.rememberMe,
      });
  @override
  List<Object?> get props => [phone,region,oTP,rememberMe];
}


/// this event is triggered when internet
/// connection is not active

class SaveConnectionErrorEvent extends SaveEvent {
  @override
  List<Object?> get props => [];
}
