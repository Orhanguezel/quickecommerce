
import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_facebook_auth/flutter_facebook_auth.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/api_urls.dart';
import '../../config/icons.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/login_bloc/login_bloc.dart';
import '../../controller/bloc/login_bloc/login_event.dart';
import '../../l10n/app_localizations.dart';

class SocialButton extends StatefulWidget {
  const SocialButton({super.key});

  @override
  State<SocialButton> createState() => _SocialButtonState();
}

class _SocialButtonState extends State<SocialButton> {
  late final LoginBloc _loginBloc;
  String _fcmToken = '';
  @override
  void initState() {
    _loginBloc = context.read<LoginBloc>();
    getUserRout();
    super.initState();
  }

  getUserRout() async {
    var fcmToken = await UserSharedPreference.getValue(
      SharedPreferenceHelper.fCMToken,
    );
    _fcmToken = fcmToken ?? "";
  }

  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: [
      'email',
      'profile',
    ],
  );

  /// Signs in the user with Google and returns the Google account information
  ///
  /// Returns `null` if the sign-in process is canceled or fails
  Future<GoogleSignInAccount?> signInWithGoogle() async {
    try {
      final googleUser = await _googleSignIn.signIn();
      return googleUser;
    } catch (e) {
      return null;
    }
  }

  Future<void> signInWithFacebook() async {
    try {
      final LoginResult result = await FacebookAuth.instance.login(
        permissions: ['email', 'public_profile'],
      );

      if (result.status == LoginStatus.success) {
        final AccessToken accessToken = result.accessToken!;

        print("accessToken$accessToken");

      } else {
        print("Facebook Login Failed: ${result.status}");
      }
    } catch (e) {
      print("Error during Facebook login: $e");
    }
  }






  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(height:kIsWeb ? 20 : 20.h),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            SizedBox(width:kIsWeb ? 12 : 12.h),
            Expanded(
              child: Container(
                height: 1,
                color: Colors.grey,
              ),
            ),
            SizedBox(width:kIsWeb ? 8 : 8.h),
            Text(
              AppLocalizations.of(context)!.orContinueWith,
              style: Theme.of(context)
                  .textTheme
                  .displayLarge!
                  .copyWith(fontSize:kIsWeb ? 12 : 12.sp, fontWeight: FontWeight.w400),
            ),
            SizedBox(width: kIsWeb ? 8 :8.h),
            Expanded(
              child: Container(
                height: 1,
                color: Colors.grey,
              ),
            ),
            SizedBox(width: kIsWeb ? 12 :12.h),
          ],
        ),
        SizedBox(height: kIsWeb ? 30 :30.h),
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            socialCard(
                  () async {
                final googleUser = await signInWithGoogle();
                if (googleUser != null) {
                  final auth = await googleUser.authentication;
                  _loginBloc.add(LoginWithGoogle(
                      idToken: auth.accessToken.toString(),
                      email: googleUser.email,
                      fcmToken: _fcmToken));
                }
              },
              AssetsIcons.google,
            ),
            SizedBox(
              width: kIsWeb ? 10 :10.h,
            ),
            socialCard(() {
              signInWithFacebook();
            }, AssetsIcons.facebook),
          ],
        ),
        SizedBox(height: kIsWeb ? 14 :14.h),
      ],
    );
  }

  void handleFacebookLogin() async {
    final url = ApiUrls.facebookUrl();
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    } else {
      throw 'Could not launch $url';
    }
  }

  Widget socialCard(VoidCallback onTap, String image) {
    return InkWell(
      onTap: onTap,
      child: Container(
        width:kIsWeb ? 50 : 50.w,
        height: kIsWeb ? 45 :45.h,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(kIsWeb ? 5 :5.r),
          border: Border.all(width:kIsWeb ? 1: 1.w, color: Colors.grey),
        ),
        child: Center(
          child: Image.asset(
            image,
            height:kIsWeb ? 20 : 20.h,
            width: kIsWeb ? 20 :20.w,
          ),
        ),
      ),
    );
  }
}
