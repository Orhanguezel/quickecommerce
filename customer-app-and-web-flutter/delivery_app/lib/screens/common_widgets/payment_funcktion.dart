import 'package:flutter/foundation.dart';
import 'package:flutter_stripe/flutter_stripe.dart';

import '../../data/service/common_repository.dart';

class PaymentFunction {
  static void stripePayment({
    required double totalAmount,
    required Function(String trId) onPaymentSuccess,
    required CommonRepository commonRepository,
  }) {
    if (totalAmount.round() > 0) {
      var paymentAmount = (totalAmount.round() * 100).toInt();
      makePayment(
        amount: paymentAmount.toString(),
        currency: "usd",
        onPaymentSuccess: (transactionId) {
          onPaymentSuccess(transactionId);
        },
        commonRepository: commonRepository,
      );
    }
  }

  static Future<void> makePayment({
    required String amount,
    required String currency,
    required Function(String trId) onPaymentSuccess,
    required CommonRepository commonRepository,
  }) async {
    Map<String, dynamic>? paymentIntentData;
    try {
      paymentIntentData = await commonRepository.createPaymentIntent(amount, currency);
      if (paymentIntentData != null) {
        const gpay = PaymentSheetGooglePay(
          merchantCountryCode: "US",
          currencyCode: "USD",
          testEnv: true,
        );
        await Stripe.instance.initPaymentSheet(
          paymentSheetParameters: SetupPaymentSheetParameters(
            googlePay: gpay,
            merchantDisplayName: 'Adiwele',
            paymentIntentClientSecret: paymentIntentData['client_secret'],
            customerEphemeralKeySecret: paymentIntentData['ephemeralKey'],
          ),
        );
        try {
          await Stripe.instance.presentPaymentSheet().then((value) {
            String transactionId = "${paymentIntentData?['id']}";
            onPaymentSuccess(transactionId);
          });
        } on StripeException catch (e) {
          debugPrint('Payment failed: ${e.error.localizedMessage}');
        } catch (e) {
          debugPrint('An unexpected error occurred: $e');
        }
      }
    } catch (e, s) {
      debugPrint('exception:$e$s');
    }
  }
}
