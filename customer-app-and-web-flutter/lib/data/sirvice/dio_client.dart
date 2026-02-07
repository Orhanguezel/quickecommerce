import 'package:dio/dio.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';

class DioClient {
  static final DioClient _instance = DioClient._internal();
  late final Dio dio;

  factory DioClient() => _instance;

  DioClient._internal() {
    dio = Dio();
    dio.interceptors.add(_LanguageInterceptor());
  }

  /// Shortcut to get the shared Dio instance
  static Dio get instance => _instance.dio;
}

class _LanguageInterceptor extends Interceptor {
  @override
  void onRequest(
      RequestOptions options, RequestInterceptorHandler handler) async {
    // Read saved language, default to 'tr'
    final language = await UserSharedPreference.getValue(
          SharedPreferenceHelper.languageCode,
        ) ??
        'tr';

    // Add or override language if missing or empty
    final existing = options.queryParameters['language'];
    if (existing == null || existing.toString().isEmpty) {
      options.queryParameters['language'] = language;
    }

    handler.next(options);
  }
}
