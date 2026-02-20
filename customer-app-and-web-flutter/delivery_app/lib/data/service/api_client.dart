import 'package:dio/dio.dart';
import '../../config/api_urls.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  final Dio _dio;

  factory ApiClient() {
    return _instance;
  }

  ApiClient._internal() : _dio = Dio() {
    _dio.options.headers = {
      'Content-Type': 'application/json',
      'Vary': 'Accept',
      'Accept': 'application/json',
    };
    _dio.options.receiveTimeout = const Duration(milliseconds: 30000);
    _dio.options.connectTimeout = const Duration(milliseconds: 30000);

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await UserSharedPreference.getValue(SharedPreferenceHelper.token);
        if (token != null && token.isNotEmpty) {
           options.headers['Authorization'] = 'Bearer $token'; // Automatically add token
        }
        return handler.next(options);
      },
      onError: (DioException e, handler) async {
        if (e.response?.statusCode == 401) {
          // Handle unauthorized error (logout, refresh token, etc.)
          // For now, simpler handling to just pass it through
        }
        return handler.next(e);
      },
    ));
  }

  Dio get dio => _dio;

  // Add more convenient methods for specific operations if needed, 
  // currently repositories use dio instance directly.
}
