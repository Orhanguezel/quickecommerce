

import 'package:dio/dio.dart';
import 'package:intl/intl.dart';
import 'package:quick_ecommerce/data/data_model/all_product_model.dart';

import '../controller/provider/currencie_controler.dart';



class Utils {
  /// Formats a dynamic value as a String.
  static String formatString(dynamic value) {
    return value != null ? value.toString() : "";
  }
  static String formatToUppercaseInitial(dynamic value, {String fallback = "A.T"}) {
    return value != null && value.toString().isNotEmpty
        ? value.toString()[0].toUpperCase()
        : fallback;
  }
  /// Formats a dynamic value as an int.
  /// Returns 0 if the value is null or cannot be parsed as an int.
  static int formatInt(dynamic value) {
    if (value == null) return 0;
    try {
      return int.parse(value.toString());
    } catch (e) {
      return 0; // Default value for invalid int
    }
  }

  /// Formats a dynamic value as a double.
  /// Returns 0.0 if the value is null or cannot be parsed as a double.
  static double formatDouble(dynamic value) {
    if (value == null) return 0.0;
    try {
      return double.parse(value.toString());
    } catch (e) {
      return 0.0; // Default value for invalid double
    }
  }

  static String maskPhoneNumber(String completeNumber) {
    // Ensure it starts with '+'
    if (!completeNumber.startsWith('+')) {
      return 'Invalid number';
    }

    // Extract country code (assumes country code is up to 4 digits after '+')
    final match = RegExp(r'^\+(\d{1,4})').firstMatch(completeNumber);
    if (match == null) {
      return 'Invalid number';
    }

    String countryCode = match.group(0)!; // e.g. +880
    String numberOnly = completeNumber.substring(countryCode.length);

    // Remove non-digit characters
    String digitsOnly = numberOnly.replaceAll(RegExp(r'[^0-9]'), '');

    // If too short, just return masked
    if (digitsOnly.length < 3) return '$countryCode*******';

    String lastThree = digitsOnly.substring(digitsOnly.length - 3);
    String masked = '*' * (digitsOnly.length - 3);

    return '$countryCode$masked$lastThree';
  }


  static String formatUnderscore(String input) {
    if (input.isEmpty) return ''; // Handle empty strings
    return input
        .split('_')
        .map((word) => word[0].toUpperCase() + word.substring(1).toLowerCase())
        .join(' ');
  }


  static String capitalizeFirstLetter(dynamic input) {
    if (input == null || input.isEmpty) {
      return '';
    }
    return input[0].toUpperCase() + input.substring(1);
  }

  static String formatDate(dynamic isoDateString) {
    if (isoDateString == null || isoDateString.toString().isEmpty) {
      return ""; // Default value for null or empty dates
    }
    try {
      final dateTime = _parseDate(isoDateString);
      return DateFormat('d MMMM yyyy').format(dateTime);
    } catch (e) {
      return '';
    }
  }

  static String formatTime(dynamic isoDateString) {
    if (isoDateString == null || isoDateString.toString().isEmpty) {
      return ""; // Default value for null or empty dates
    }
    try {
      final dateTime = _parseDate(isoDateString);
      return DateFormat('hh:mm a').format(dateTime);
    } catch (e) {
      return '';
    }
  }

  static DateTime _parseDate(dynamic date) {
    final dateString = date.toString();

    try {
      return DateTime.parse(dateString);
    } catch (_) {
      try {
        return DateFormat("MMMM dd, yyyy hh:mm a").parse(dateString);
      } catch (_) {
        return DateTime.now(); // fallback
      }
    }
  }


  static String parseDioError(dynamic error) {
    if (error is DioException) {
      final responseData = error.response?.data;

      // If it's HTML content, something went wrong at server level
      if (responseData is String) {
        if (responseData.trimLeft().startsWith('<!DOCTYPE html>') ||
            responseData.trimLeft().startsWith('<html')) {
          return 'A server error occurred. Please try again later.';
        }
        return responseData;
      }

      // If it's a JSON map
      if (responseData is Map<String, dynamic>) {
        // Preferred error response
        if (responseData.containsKey('errors') &&
            responseData['errors'] is List) {
          final List errors = responseData['errors'];
          return errors.map((e) => e['message'] ?? '').join('\n');
        }
        if (responseData.containsKey('message') && responseData['message'] is Map) {
          final Map<String, dynamic> fieldErrors = responseData['message'];
          return fieldErrors.values
              .expand((e) => e is List ? e : [e])
              .join('\n');
        }

        // Fallback message
        if (responseData.containsKey('message')) {
          return responseData['message'].toString();
        }

        // Try to parse other formats
        try {
          final errorMessages = responseData.values
              .expand((e) => e is List ? e : [e])
              .join('\n');
          return errorMessages;
        } catch (_) {
          return 'An unknown error occurred.';
        }
      }

      return 'Something went wrong. Please try again.';
    }

    return 'Unexpected error occurred. Please check your connection.';
  }


  static T? parseApiResponse<T>(dynamic data, T Function(Map<String, dynamic>) fromJson) {
    if (data is Map<String, dynamic>) {
      final status = data['status'];
      final statusCode = data['status_code'];
      final emailVerified = data['email_verified'];
      if (status == false && statusCode == 403 && emailVerified == false) {
        return null;
      }
      return fromJson(data);
    }
    return null;
  }



  static FlashSaleResult flashSalePriceCalculate(double regularPrice ,double spPrice,FlashSale? flashSale){
    final currencyCon=CurrencyController();
    bool isFlashSale = flashSale != null;
    double discountAmount = 0.0;
    double flashSalePrice = 0.0;

    if (isFlashSale) {
      double price =spPrice > 0 ? spPrice : regularPrice;
      final discountValue = Utils.formatDouble(flashSale.discountAmount);

      if (flashSale.discountType == "percentage") {
        discountAmount = (discountValue / 100) * price;
      } else {
        discountAmount = discountValue;
      }

      double flashSales = price - discountAmount.round();
      flashSalePrice=currencyCon.decimalPoint == "YES"?
      flashSales:flashSales.roundToDouble();
    }
    return FlashSaleResult(
      discountAmount: discountAmount,
      flashSalePrice: flashSalePrice,
    isFlashSale: isFlashSale
    );
  }

}
class FlashSaleResult {
  final double discountAmount;
  final double flashSalePrice;
  final bool isFlashSale;

  FlashSaleResult({
    required this.discountAmount,
    required this.flashSalePrice,
    required this.isFlashSale,
  });
}