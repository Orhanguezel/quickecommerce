import 'dart:io';

import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';

import '../../config/api_urls.dart';

class SaveRepository {
  final Dio _dio = Dio();

  /// this function is responsible for change email into the app
  /// it needs [userName] and [password] for calling login api
  /// both of them are required parameters.
  Future<Response> editProfile(
    String firstName,
    String lastName,
    String phone,
    String image,
    String birthDay,
    String gender,
    String token,
  ) {
    final response = _dio.post(
      ApiUrls.profileEditUrl(),
      data: {
        "first_name": firstName,
        "last_name": lastName,
        "phone": phone,
        "image": image,
        "birth_day": birthDay,
        "gender": gender
      },
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );
    return response;
  }

  /// this function is responsible for change email into the app
  /// it needs [userName] and [password] for calling login api
  /// both of them are required parameters.
  Future<Response> uploadImage(XFile image, String token) async {
    try {
      FormData formData = FormData.fromMap({
        "file": await MultipartFile.fromFile(
          image.path,
          filename: image.name, // Use the file name from the XFile
        ),
      });
      final response = _dio.post(
        ApiUrls.imageUploadUrl(),
        data: formData,
        options: Options(
          headers: {
            'Content-Type': 'application/json',
            'Vary': 'Accept',
            "Authorization": 'Bearer $token',
          },
          followRedirects: false,
        ),
      );
      return response;
    } catch (e) {
      rethrow;
    }
  }


  Future<Response> chatMessageSend(
      String receiverId,
      String message,
      String receiverType,
      List<PlatformFile> files,
      String token,
      ) async {
    // Create a list to hold MultipartFile objects
    List<MultipartFile> multipartFiles = [];

    for (PlatformFile file in files) {
      if (kIsWeb) {
        multipartFiles.add(
          MultipartFile.fromBytes(
            file.bytes!,
            filename: file.name,
          ),
        );
      } else {
        if (file.path != null && file.path!.isNotEmpty) {
          multipartFiles.add(
            await MultipartFile.fromFile(
              file.path!,
              filename: file.name,
            ),
          );
        }
      }
    }
    FormData formData = FormData.fromMap({
      "receiver_id": receiverId,
      "message": message,
      "receiver_type": receiverType,
      if (multipartFiles.isNotEmpty) "file": multipartFiles,
    });
    final response = _dio.post(ApiUrls.messagesSendUrl(),
      data: formData,
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );
    return response;
  }
  /// this function is responsible for change email into the app
  /// it needs [userName] and [password] for calling login api
  /// both of them are required parameters.
  Future<Response> wishListAdd(String productId, String token) {
    final response = _dio.post(
      ApiUrls.wishListAddUrl(),
      data: {"product_id": productId},
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );

    return response;
  }

  /// this function is responsible for change email into the app
  /// it needs [userName] and [password] for calling login api
  /// both of them are required parameters.
  Future<Response> wishListDelete(String productId, String token) {
    final response = _dio.put(
      ApiUrls.wishListDeleteUrl(),
      data: {"product_id": productId},
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );
    return response;
  }

  /// this function is responsible for change email into the app
  /// it needs [userName] and [password] for calling login api
  /// both of them are required parameters.
  Future<Response> addressAdd(
      String title,
      String type,
      String email,
      String contactNumber,
      String address,
      String latitude,
      String longitude,
      int areaId,
      String road,
      String house,
      String floor,
      String postalCode,
      bool isDefault,
      int status,
      String token) {
    final response = _dio.post(
      ApiUrls.addressAddUrl(),
      data: {
        "title": title,
        "type": type, // home, office, others
        "email": email,
        "contact_number": contactNumber,
        "address": address,
        "latitude": latitude,
        "longitude": longitude,
        "road": road,
        "house": house,
        "floor": floor,
        "postal_code": postalCode,
        "is_default": isDefault,
        "status": status
      },
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );
    return response;
  }

  /// this function is responsible for change email into the app
  /// it needs [userName] and [password] for calling login api
  /// both of them are required parameters.
  Future<Response> addressUpdate(
      String id,
      String title,
      String type,
      String email,
      String contactNumber,
      String address,
      String latitude,
      String longitude,
      String road,
      String house,
      String floor,
      String postalCode,
      bool isDefault,
      int status,
      String token) {
    final response = _dio.post(
      ApiUrls.addressUpdateUrl(),
      data: {
        "id": id,
        "title": title,
        "type": type, // home, office, others
        "email": email,
        "contact_number": contactNumber,
        "address": address,
        "latitude": latitude,
        "longitude": longitude,
        "road": road,
        "house": house,
        "floor": floor,
        "postal_code": postalCode,
        "is_default": isDefault,
        "status": status
      },
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );
    return response;
  }

  Future<Response> addressDelete(String id, String token) {
    final response = _dio.delete(
      ApiUrls.addressDeleteUrl(id),
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );
    return response;
  }

  /// this function is responsible for change email into the app
  /// it needs [userName] and [password] for calling login api
  /// both of them are required parameters.
  Future<Response> supportTicketAdd(String departmentId, String title,
      String subject, String priority, String token) {
    final response = _dio.post(
      ApiUrls.ticketAddUrl(),
      data: {
        "department_id": departmentId,
        "title": title,
        "subject": subject,
        "priority": priority
      },
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );

    return response;
  }

  Future<Response> contactMessageAdd(
      String name, String email, String phone, String message) {
    final response = _dio.post(
      ApiUrls.contactSendMessageUrl(),
      data: {"name": name, "email": email, "phone": phone, "message": message},
    );
    return response;
  }

  Future<Response> askQuestion(
      String productId, String storeId, String question, String token) {
    final response = _dio.post(
      ApiUrls.askQuestionUrl(),
      data: {
        "product_id": productId,
        "store_id": storeId,
        "question": question
      },
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );

    return response;
  }

  Future<Response> supportTicketUpdate(String id, String departmentId,
      String title, String subject, String priority, String token) {
    final response = _dio.post(
      ApiUrls.ticketUpdateUrl(),
      data: {
        "id": id,
        "department_id": departmentId,
        "title": title,
        "subject": subject,
        "priority": priority
      },
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );

    return response;
  }

  Future<Response> supportTicketResolve(String id, String token) {
    final response = _dio.patch(
      ApiUrls.ticketResolveUrl(),
      data: {
        "ticket_id": id,
      },
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );
    return response;
  }

  Future<Response> sendMessage(
      String message, XFile? image, String ticketId, String token) async {
    FormData formData;

    if (image != null &&
        image.path.isNotEmpty &&
        await File(image.path).exists()) {
      formData = FormData.fromMap({
        "message": message,
        "file": await MultipartFile.fromFile(
          image.path,
          filename: image.name,
        ),
        "ticket_id": ticketId,
      });
    } else {
      formData = FormData.fromMap({
        "message": message,
        "file": "",
        "ticket_id": ticketId,
      });
    }

    try {
      final response = await _dio.post(
        ApiUrls.sendMessageUrl(),
        data: formData,
        options: Options(
          headers: {
            'Content-Type': 'application/json',
            'Vary': 'Accept',
            "Authorization": 'Bearer $token',
          },
          followRedirects: false,
        ),
      );
      return response;
    } catch (_) {
      rethrow;
    }
  }



  Future<Response> deposit(
      int walletId,
      String transactionId,
      String transactionDetails,
      double amount,
      String currencyCode,
      String type,
      String purpose,
      String paymentGateway,
      int status,
      String token) {
    final response = _dio.post(
      ApiUrls.walletDepositUrl(),
      data: {
        "wallet_id": walletId,
        "transaction_ref": transactionId,
        "transaction_details": transactionDetails,
        "amount": amount.round(),
        "currency_code": currencyCode,
        "type": type,
        "purpose": purpose,
        "status": status,
        "payment_gateway": paymentGateway
      },
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );
    return response;
  }

  Future<Response> depositUpdate(int walletHistoryId, String transactionId,
      String transactionDetails, String hMacSignature,int timestamp,String token) {
    final response = _dio.post(
      ApiUrls.paymentUpdateUrl(),
      data: {
        "wallet_history_id": walletHistoryId,
        "transaction_ref": transactionId,
        "transaction_details": transactionDetails,
        "timestamp": timestamp
      },
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
          'X-HMAC': hMacSignature,
        },
        followRedirects: false,
      ),
    );
    return response;
  }

  Future<Response> placeOrder(
      double latitude,
      double longitude,
      int addressId,
      String name,
      String email,
      String contactNumber,
      String paymentGateway,
      String comment,
      String couponCode,
      String currencyCode,
      List packages,
      String token) {
    var data= {
      "customer_latitude": latitude,
      "customer_longitude": longitude,
      "shipping_address_id": addressId,
      "name":name,
      "email": email,
      "contact_number": contactNumber,
      "payment_gateway": paymentGateway,
      "order_notes": comment,
      "coupon_code": couponCode,
      "currency_code": currencyCode,
      "packages": packages,
    };

    final response = _dio.post(
      ApiUrls.placeOrderUrl(),
      data: data,
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );
    return response;
  }

  Future<Response> cancelOrder(String orderId, String token) {
    final response = _dio.post(
      ApiUrls.cancelOrderUrl(),
      data: {
        "order_id": orderId,
      },
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );

    return response;
  }

  Future<Response> reviewAdd(String orderId,String storeId,
      String reviewableId,String type,String review,String rating, String token) {
    final response = _dio.post(
      ApiUrls.reviewAddUrl(),
      data: {
        "order_id": orderId,
        "store_id": storeId,
        "reviewable_id": reviewableId,
        "reviewable_type": type,
        "review": review,
        "rating": rating
      },
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );
    return response;
  }


  Future<Response> reviewReaction(String reviewId,String reactionType,
      String token) {
    final response = _dio.post(
      ApiUrls.reviewReactionUrl(),
      data: {
        "review_id": reviewId,
        "reaction_type": reactionType,
      },
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );
    return response;
  }


  /// This function is responsible for submitting a refund request.
  /// It needs [orderId], [reasonId], [note], and optionally [image].
  /// [token] is required for authentication.
  Future<Response> requestRefund(String orderId, String reasonId, String note,
      XFile? image, String token) async {
    try {
      final formData = FormData.fromMap({
        "order_id": orderId,
        "order_refund_reason_id": reasonId,
        "customer_note": note,
        if (image != null)
          "file": await MultipartFile.fromFile(
            image.path,
            filename: image.name,
          ),
      });

      final response = await _dio.post(
        ApiUrls.requestRefundUrl(),
        data: formData,
        options: Options(
          headers: {
            'Vary': 'Accept',
            "Authorization": 'Bearer $token',
          },
          followRedirects: false,
        ),
      );
      return response;
    } on DioException catch (_) {
      rethrow;
    }
  }

  Future<Response> paymentStatusUpdate(
      String orderId, String transactionId,String timestamp,
      String hMacSignature, String token) {
    final response = _dio.put(
      ApiUrls.paymentStatusUpdateUrl(),
      data: {"order_id": orderId,
        "transaction_ref": transactionId,
        "timestamp": timestamp,
      },
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
          'X-HMAC': hMacSignature,
        },
        followRedirects: false,
      ),
    );
    return response;
  }


  Future<Response> stripeWebhook(Map<String, dynamic> objectData,String token) {
    final response = _dio.post(ApiUrls.stripeWebhookUrl(),
      data: {
        "object": "event",
        "type": "checkout.session.completed",
        "data": {
          "object":objectData
        }
      },
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          'Accept': '*/*',
          "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );
    return response;
  }


  Future<Response> activateDeactivate(
      String reason, String description, String type, String token) {
    final response = _dio.patch(
      ApiUrls.activateDeactivateUrl(),
      data: {"type": type, "reason": reason, "description": description},
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );
    return response;
  }

  Future<Response> deleteAccount(String token) {
    final response = _dio.get(
      ApiUrls.deleteAccountUrl(),
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );
    return response;
  }


  Future<Response> sendOTP(String phone,String region,) {
    final response = _dio.post(
      ApiUrls.sendOTPUrl(),
      data: {
        "phone":phone,
        "region": region,
        "user_type":"customer",
      },
    );
    return response;
  }
  Future<Response> verifyOTP(String phone,String region,String otp,bool rememberMe) {
    final Map<String, dynamic> data = {
      "phone": phone,
      "region": region,
      "otp": otp,
      "user_type": "customer",
    };
    if (rememberMe) {
      data["remember_me"] = "";
    }
    final response = _dio.post(
      ApiUrls.verifyOTPUrl(),
      data:data,
    );
    return response;
  }

  Future<Response> resendOTP(String phone,String region,) {
    final response = _dio.post(
      ApiUrls.resendOTPUrl(),
      data: {
        "phone":phone,
        "region": region,
        "user_type":"customer",
      },
    );
    return response;
  }


  Future<Response> notificationRead(String id, String token) {
    final response = _dio.patch(
      ApiUrls.notificationReadUrl(),
      data: {"id": id},
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );
    return response;
  }
}
