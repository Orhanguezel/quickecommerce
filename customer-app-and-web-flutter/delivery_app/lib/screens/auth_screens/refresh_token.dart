// import 'package:flutter/material.dart';
// import 'package:flutter_bloc/flutter_bloc.dart';
// import 'package:intl/intl.dart';
// import 'package:sherve_mart/controller/bloc/refresh_token/refresh_token_bloc.dart';
//
// import '../../config/shared_preference_helper.dart';
// import '../../config/user_shared_preference.dart';
// import '../../controller/bloc/refresh_token/refresh_token_event.dart';
//
// class RefreshToken extends StatefulWidget {
//   const RefreshToken({super.key});
//
//   @override
//   State<RefreshToken> createState() => _RefreshTokenState();
// }
//
// class _RefreshTokenState extends State<RefreshToken> {
//   late final RefreshTokenBloc _refreshTokenBloc;
//   final FocusNode passFocusNode = FocusNode();
//   @override
//   void initState() {
//     _refreshTokenBloc = context.read<RefreshTokenBloc>();
//     getUserToken();
//     super.initState();
//   }
//   String _token='';
//   Future<void> getUserToken() async {
//     var token = await UserSharedPreference.getValue(
//       SharedPreferenceHelper.token,
//     );
//     _token = token ?? "";
//     _refreshTokenBloc.add(RefreshTokenDataEvent(token:_token));
//   }
//   @override
//   Widget build(BuildContext context) {
//     return const Scaffold(
//       body: SizedBox(),
//     );
//   }
// }
//
//
//
//
// class TokenUtils {
//   /// Parses expiry date from string
//   static Future<DateTime?> parseExpiryDate(String expiryDateString) async {
//     try {
//       final formatter = DateFormat("yyyy-MM-dd HH:mm:ss.SSSSSSZ");
//       return formatter.parse(expiryDateString);
//     } catch (e) {
//       return null;
//     }
//   }
//
//   /// Checks if a date is expired
//   static bool isExpired(DateTime? expiryDate) {
//     if (expiryDate == null) return true;
//     return expiryDate.isBefore(DateTime.now());
//   }
//
//   /// Checks token expiry and refreshes if needed
//   static Future<bool> checkAndRefreshToken({
//     required RefreshTokenBloc refreshTokenBloc,
//   }) async {
//     try {
//       // Get token and expiry from storage
//       final tokenExp = await UserSharedPreference.getValue(
//           SharedPreferenceHelper.tokenExp);
//       final token = await UserSharedPreference.getValue(
//           SharedPreferenceHelper.token);
//
//       // Validate we have values
//       if (tokenExp == null || token == null) return false;
//
//       // Check expiry
//       final expiryDate = await parseExpiryDate(tokenExp);
//       if (isExpired(expiryDate)) {
//         refreshTokenBloc.add(RefreshTokenDataEvent(token: token));
//         return true; // Refresh was initiated
//       }
//       return false; // No refresh neededA
//     } catch (e) {
//       debugPrint('Token refresh error: $e');
//       return false;
//     }
//   }
// }