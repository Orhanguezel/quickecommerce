import 'package:dio/dio.dart';
import '../../config/api_urls.dart';
import 'api_client.dart';

class CommonRepository {
  final Dio _dio = ApiClient().dio;

  Future<Response> homePageSettings() {
    final response = _dio.get(
      ApiUrls.homePageSettingsUrl(),
    );
    return response;
  }

  Future<Response> generalInfo() {
    final response = _dio.get(
      ApiUrls.generalInfoUrl(),
    );
    return response;
  }

  Future<Response> productDetailsSetting(String language) {
    final response = _dio.get(
      ApiUrls.productDetailsSettingUrl(),
      data: {
        "language": language,
      },
    );
    return response;
  }

  Future<Response> couponList(
    String searchKey,
    String discountType,
    bool expireSoon,
    bool newest,
    int page,
    String language,
    String token,
  ) {
    final response = _dio.get(
      ApiUrls.couponListUrl(),
      data: {
        "search": searchKey,
        "discount_type": discountType, // percentage or amount
        "sort_by_discount": false, // true or false
        "start_date": "",
        "end_date": "",
        "expire_soon": expireSoon, // true or false
        "newest": newest, // true or false
        "per_page": "10",
        "page": page,
        "language": language
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

  Future<Response> addressList(
      String id, String type, String status, String token) {
    final response = _dio.get(
      ApiUrls.addressListUrl(),
      data: {"id": id, "type": type, "status": status},
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

  Future<Response> profile(String token) {
    final response = _dio.get(
      ApiUrls.profileUrl(),
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

  Future<Response> supportTicketList(
      String departmentId, String status, String perPage, String token) {
    final response = _dio.get(
      ApiUrls.ticketListUrl(),
      data: {
        "department_id": departmentId,
        "status": status,
        "per_page": perPage
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

  Future<Response> supportTicketDetails(String id, String token) {
    final response = _dio.get(
      ApiUrls.ticketDetailsUrl(id),
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

  Future<Response> chatList(String search, String type, String token) {
    final response = _dio.get(
      ApiUrls.chatListUrl(),
      queryParameters: {"search": search, "type": type},
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

  Future<Response> messagesDetails(
      String receiverId, String receiverType, String search, String token) {
    final response = _dio.get(
      ApiUrls.messagesDetailsUrl(),
      queryParameters: {
        "receiver_id": receiverId,
        "receiver_type": receiverType, // admin,deliveryman,customer
        "search": search
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

  Future<Response> departmentList(String token) {
    final response = _dio.get(
      ApiUrls.departmentListUrl(),
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

  Future<Response> storeDetails(String slug, String token) {
    final response = _dio.get(
      ApiUrls.storeDetailsUrl(slug),
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

  Future<Response> orderTracking(String orderId, String token) {
    final response = _dio.post(
      ApiUrls.orderTrackUrl(),
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

  Future<Response> getMessages(String ticketId, String token) {
    final response = _dio.get(
      ApiUrls.getMessageUrl(ticketId),
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

  Future<Response> getWallet(String token) {
    final response = _dio.get(
      ApiUrls.walletUrl(),
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

  Future<Response> getWalletTransactions(String token) {
    final response = _dio.get(
      ApiUrls.walletTransactionsUrl(),
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );
    //  print("token ===$token");
    return response;
  }

  Future<Response> currencyInfo(String token) {
    final response = _dio.get(
      ApiUrls.currencyInfoUrl(),
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

  Future<Response> currencyList(String token) {
    final response = _dio.get(
      ApiUrls.currencyListUrl(),
      data: {"filter": ""},
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

  Future<Response> getPaymentGateways() {
    final response = _dio.get(ApiUrls.paymentGatewaysUrl());
    return response;
  }

  Future<Map<String, dynamic>?> createPaymentIntent(
      String amount, String currency) async {
    try {
      // Initialize Dio
      Dio dio = ApiClient().dio;

      // Set headers
      dio.options.headers = {
        'Authorization': 'Bearer ${ApiUrls.secretKey}',
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      // Define body parameters
      Map<String, dynamic> body = {
        'amount':
            amount, // Ensure this is an integer value in the smallest currency unit (e.g., cents for USD)
        'currency': currency,
        'payment_method_types[]':
            'card', // Use correct array syntax for payment method types
      };

      // Make the POST request
      Response response = await dio.post(
        'https://api.stripe.com/v1/payment_intents',
        data: body,
        options: Options(
          contentType: Headers.formUrlEncodedContentType,
        ),
      );
      return response.data;
    } catch (e) {
      return null;
    }
  }

  Future<Response> checkCoupon(
      String couponCode, String subtotal, String currencyCode, String token) {
    final response = _dio.post(
      ApiUrls.checkCouponUrl(),
      data: {
        "coupon_code": couponCode,
        "sub_total": subtotal,
        "currency_code": currencyCode,
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

  // Future<Response> deliveryCharge(
  //     List<int> areaIds, double cLatitude, double cLongitude) {
  //   final response = _dio.get(
  //     ApiUrls.deliveryChargeUrl(),
  //     options: Options(
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Vary': 'Accept',
  //         "Authorization": 'Bearer ',
  //       },
  //       followRedirects: false,
  //     ),
  //   );
  //   return response;
  // }

  Future<Response> deliveryCharge(
    List<int> areaIds,
    double cLatitude,
    double cLongitude,
  ) async {
    try {
      final params = {
        'area_ids[]': areaIds,
        'customer_latitude': cLatitude,
        'customer_longitude': cLongitude,
      };
      final response = await _dio.get(
        ApiUrls.deliveryChargeUrl(),
        queryParameters: params,
        options: Options(
          headers: {
            'Content-Type': 'application/json',
          },
        ),
      );
      return response;
    } on DioException catch (_) {
      rethrow;
    }
  }

  Future<Response> extraCharge(List<int> productIds) {
    final response = _dio.get(
      ApiUrls.extraChargeUrl(),
      data: {
        "product_ids": productIds,
      },
    );
    return response;
  }

  Future<Response> generateHMac(String orderId, String token) {
    final response = _dio.get(
      ApiUrls.generateHMacUrl(),
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

  Future<Response> walletGenerateHMac(String historyId, String token) {
    final response = _dio.get(
      ApiUrls.walletGenerateHMacUrl(),
      data: {
        "wallet_history_id": historyId,
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

  Future<Response> contactUs(String language) {
    final response = _dio.get(
      ApiUrls.contactUrl(),
      queryParameters: {"theme_name": "theme_one", "language": "en"},
    );
    return response;
  }

  Future<Response> question(String productId, String search, String perPage) {
    final response = _dio.get(
      ApiUrls.searchQuestionUrl(),
      queryParameters: {"product_id": productId, "search": "", "per_page": ""},
    );
    return response;
  }

  Future<Response> dashboard(String language, String token) {
    final response = _dio.get(
      ApiUrls.dashboardUrl(),
      data: {"language": language},
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

  Future<Response> taxInfo(List storeIds, String token) {
    final response = _dio.post(
      ApiUrls.taxInfoUrl(),
      data: {"store_ids": storeIds},
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

  Future<Response> orderList(
      String language, String status, int page, String token) {
    final response = _dio.get(
      ApiUrls.orderListUrl(),
      data: {"status": status, "page": page, "language": language},
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

  Future<Response> orderDetails(
      String language, String orderId, String token) async {
    try {
      final response = await _dio.get(
        ApiUrls.orderDetailsUrl(orderId),
        data: {"language": language},
        options: Options(
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
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

  Future<Response> notification(String language, String token) {
    final response = _dio.get(
      ApiUrls.notificationUrl(),
      data: {"language": language},
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

  Future<Response> notificationRead(String language, String token) {
    final response = _dio.patch(
      ApiUrls.notificationReadUrl(),
      data: {"language": language},
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

  Future<Response> createStripeSession(
      String currencyCode, String orderMasterId, String token) {
    final response = _dio.post(
      ApiUrls.createStripeSessionUrl(),
      data: {
        "currency_code": currencyCode,
        "order_master_id": orderMasterId,
        "payment_gateway": "stripe"
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

  Future<Response> createWalletStripeSession(
      String historyId, String walletId, String token) {
    final response = _dio.post(
      ApiUrls.createWalletStripeSessionUrl(),
      data: {
        //"currency_code":currencyCode,
        "wallet_history_id": historyId,
        "wallet_id": walletId,
        "payment_gateway": "stripe"
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

  Future<Response> refundReasonList(String token) {
    final response = _dio.get(
      ApiUrls.refundReasonListUrl(),
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

  Future<Response> tramsAndConditionAndPrivacyPolicy(
      String base, String language, String token) {
    final response = _dio.get(
      ApiUrls.tramsAndConditionAndPrivacyPolicyUrl(base),
      data: {"language": language},
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
}
