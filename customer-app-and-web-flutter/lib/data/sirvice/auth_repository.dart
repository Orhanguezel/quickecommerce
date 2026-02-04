import 'package:dio/dio.dart';
import 'package:flutter_facebook_auth/flutter_facebook_auth.dart';
import '../../config/api_urls.dart';

class AuthRepository {
  final Dio _dio = Dio();

  /// this function is responsible for login into the app
  /// it needs [userName] and [password] for calling login api
  /// both of them are required parameters.
  Future<Response> registrationWithUsernameAndEmail(
      String firstName, String lastName, String email, String password, Map role, String token) {
    final response = _dio.post(
      ApiUrls.registration(),
      data: {
        "first_name": firstName,
        "last_name": lastName,
        "email": email,
        "password": password,
        "roles": role
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


  /// this function is responsible for login into the app
  /// it needs [userName] and [password] for calling login api
  /// both of them are required parameters.
  Future<Response> loginWithEmailAndPassword(String email, String password,String fcToken) {
    final response = _dio.post(
      ApiUrls.loginUrl(),
      data: {
        "email": email,
        "password": password,
        "firebase_device_token": fcToken,
      },
    );
    return response;
  }
  /// it needs [userName] and [password] for calling login api
  /// both of them are required parameters.
  Future<Response> logout(String token) {
    final response = _dio.post(
      ApiUrls.logoutUrl(),
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          if (token.isNotEmpty) "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );
    return response;
  }

  /// this function is responsible for login into the app
  /// it needs [userName] and [password] for calling login api
  /// both of them are required parameters.
  Future<Response> forgetWithEmail(
       String email) {
    final response = _dio.post(
      ApiUrls.forgetUrl(),
      data: {
        "email": email,
      },
    );
    return response;
  }




  /// this function is responsible for login into the app
  /// it needs [userName] and [password] for calling login api
  /// both of them are required parameters.
  Future<Response> verifyWithOTP(
      String email,String token) {
    final response = _dio.post(
      ApiUrls.verifyTokenUrl(),
      data: {
        "email": email,
        "token": token,
      },
    );
    return response;
  }



  /// this function is responsible for login into the app
  /// it needs [userName] and [password] for calling login api
  /// both of them are required parameters.
  Future<Response> resetWithPassword(
      String email,String token, String password,String conPassword) {
    final response = _dio.patch(
      ApiUrls.resetPasswordUrl(),
      data: {
        "email": email,
        "token": token,
        "password": password,
        "password_confirmation": conPassword,
      },
    );
    return response;
  }



  /// this function is responsible for change Password the app
  /// it needs [userName] and [password] for calling login api
  /// both of them are required parameters.
  Future<Response> changePassword(
      String oldPassword, String newPassword,String newConPassword,String token) {
    final response = _dio.patch(
      ApiUrls.changePasswordUrl(),
      data: {
        "old_password": oldPassword,
        "new_password": newPassword,
        "new_password_confirmation": newConPassword,
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
  Future<Response> changeEmail(
      String email,String vToken,String token) {
     final response = _dio.post(
      ApiUrls.changeEmailUrl(),
      data: {
       "email": email,
        "token": vToken
      },
       options: Options(
         headers: {
           'Content-Type': 'application/json',
           'Vary': 'Accept',
           'Authorization': 'Bearer $token',
         },
         followRedirects: false,
       ),
    );
    return response;
  }



  Future<Response> sendForEmailVerification(
      String email,String token) {
    final response = _dio.post(
      ApiUrls.sendEmailVerificationUrl(),
      data: {
        "email": email,
      },
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          'Authorization': 'Bearer $token',
        },
        followRedirects: false,
      ),
    );
    return response;
  }


  Future<Response> resendForEmailVerification(
      String email,String token) {
    final response = _dio.post(
      ApiUrls.resendEmailVerificationUrl(),
      data: {
        "email": email,
      },
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          'Authorization': 'Bearer $token',
        },
        followRedirects: false,
      ),
    );
    return response;
  }


  Future<Response> verifyEmail(
      String vToken,String token) {
    final response = _dio.post(
      ApiUrls.verificationEmailUrl(),
      data: {
        "token": vToken
      },
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          'Authorization': 'Bearer $token',
        },
        followRedirects: false,
      ),
    );
    return response;
  }




  Future<Response> loginWithFacebook(Map<String, dynamic> data) async {
    return _dio.post('your_facebook_login_endpoint', data: data);
  }

  Future<Map<String, dynamic>?> signInWithFacebook() async {
    final LoginResult result = await FacebookAuth.instance.login();
    if (result.status == LoginStatus.success) {
      return await FacebookAuth.instance.getUserData();
    }
    return null;
  }



  Future<Response?> loginWithGoogle(
      String idToken,String email, String fcmToken) async {
    final response = _dio.post(ApiUrls.loginUrl(), data: {
      "firebase_device_token": fcmToken,
      "social_login": true,
      "email":email,
      "platform": "mobile",
      "access_token": idToken,
      "type": "google",
      "role":"customer"
    });
    return response;
  }

  Future<Response> refreshToken(String token) {
    final response = _dio.post(
      ApiUrls.refreshTokenUrl(),
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          'Authorization': 'Bearer $token',
        },
        followRedirects: false,
      ),
    );
    return response;
  }

}
