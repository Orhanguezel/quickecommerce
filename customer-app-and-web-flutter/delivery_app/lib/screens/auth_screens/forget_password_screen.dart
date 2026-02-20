import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/config/text_styles.dart';
import 'package:quick_ecommerce/screens/auth_screens/otp_input.dart';
import 'package:quick_ecommerce/screens/common_widgets/commn_textfield.dart';

import '../../config/colors.dart';
import '../../config/images.dart';
import '../../controller/bloc/reset_password/reset_password_bloc.dart';
import '../../controller/bloc/reset_password/reset_password_event.dart';
import '../../controller/bloc/reset_password/reset_password_state.dart';
import '../../controller/provider/authentication_provider.dart';
import '../../controller/provider/common_provider.dart';
import '../../controller/provider/reset_password_provider.dart';
import '../../l10n/app_localizations.dart';
import '../../router/route_name.dart';
import '../common_widgets/common_button.dart';

import '../common_widgets/common_funcktion.dart';
import '../common_widgets/field_title.dart';

class ForgetPasswordScreen extends StatefulWidget {
  const ForgetPasswordScreen({super.key});

  @override
  State<ForgetPasswordScreen> createState() => _ForgetPasswordScreenState();
}

class _ForgetPasswordScreenState extends State<ForgetPasswordScreen> {
  final TextEditingController emailCon = TextEditingController();
  final TextEditingController tokenCon = TextEditingController();
  final TextEditingController otpCon = TextEditingController();

  late final ResetPassBloc _resetPassBloc;
  @override
  void initState() {
    _resetPassBloc = context.read<ResetPassBloc>();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    var resetPassCon = Provider.of<ResetPasswordCon>(context);
    var commonProvider = Provider.of<CommonProvider>(context);
    var authProvider =
        Provider.of<AuthenticationProvider>(context, listen: false);

    return Scaffold(
      resizeToAvoidBottomInset: false,
      appBar: !kIsWeb
          ? AppBar(
              title: Text(
                resetPassCon.isOpenOTPField
                    ? "Verification"
                    : "Forget Password",
                style: CustomTextStyles.mediumText(kIsWeb ? 18 : 18.sp,
                    color: Colors.white),
              ),
            )
          : null,
      body: SingleChildScrollView(
        child: Center(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (kIsWeb)
                Row(
                  children: [
                    IconButton(
                      onPressed: () {
                        resetPassCon.startTimer(0);
                        resetPassCon.setOtpFieldTrue(false);
                        Navigator.pop(context);
                      },
                      icon: const Icon(
                        Icons.close,
                        color: Colors.black,
                      ),
                    ),
                    const SizedBox(
                      width: 20,
                    ),
                    Text(
                      resetPassCon.isOpenOTPField
                          ?AppLocalizations.of(context)!.verification
                          : AppLocalizations.of(context)!.forgetPassword,
                      style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                          fontSize: kIsWeb ? 14 : 14.sp,
                          color: CustomColors.baseColor,
                          fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
              SizedBox(height: kIsWeb ? 25 : 100.h),
              Image.asset(
                Images.logo,
                height: kIsWeb ? 80 : 80.35.h,
                width: kIsWeb ? 80 : 80.12.w,
              ),
              SizedBox(
                height: kIsWeb ? 5 : 10.h,
              ),
              resetPassCon.isOpenOTPField
                  ? Padding(
                      padding: EdgeInsets.only(
                          left: kIsWeb ? 12 : 12.w, right: kIsWeb ? 12 :12.w),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          SizedBox(height: kIsWeb ? 20 : 20.h),
                          Text(AppLocalizations.of(context)!.emailVerification,
                              style: Theme.of(context)
                                  .textTheme
                                  .bodyMedium
                                  ?.copyWith(
                                    fontSize: kIsWeb ? 24 : 24.sp,
                                    fontWeight: FontWeight.w700,
                                  )),
                          SizedBox(height: kIsWeb ? 8 : 8.h),
                          SizedBox(
                            width: kIsWeb ? 250 : 250.w,
                            child: Text(
                                AppLocalizations.of(context)!
                                    .enterVerificationCode,
                                textAlign: TextAlign.center,
                                style: Theme.of(context)
                                    .textTheme
                                    .displayLarge!
                                    .copyWith(
                                        fontSize: kIsWeb ? 14 : 14.sp,
                                        height: 1.2.h,
                                        fontWeight: FontWeight.w400)),
                          ),
                          SizedBox(height: kIsWeb ? 20 : 20.h),
                          OTPInput(
                            otpCon: otpCon,
                            height: 44,
                            width: 40,
                          ),
                          SizedBox(height: kIsWeb ? 28 : 28.h),
                          resetPassCon.isValidOtp == false
                              ? Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    Text(
                                      resetPassCon.remainingTime,
                                      style: CustomTextStyles.mediumText(
                                        kIsWeb ? 16 : 16.sp,
                                        color: CustomColors.baseColor,
                                      ),
                                    ),
                                    const Spacer(),
                                    resetPassCon.secondsRemaining == 0
                                        ? InkWell(
                                            splashColor: Colors.white,
                                            onTap: () {
                                              _resetPassBloc.add(
                                                  ResetPassWithEmail(
                                                      email: emailCon.text
                                                          .trim()));
                                              resetPassCon.stopTimer();
                                              resetPassCon.startTimer(180);
                                            },
                                            child: Container(
                                              margin: EdgeInsets.only(
                                                  left: kIsWeb ? 12 : 12.w,
                                                  right: kIsWeb ? 12 : 12.w,
                                                  top: kIsWeb ? 6 : 6.h),
                                              padding: EdgeInsets.all(
                                                  kIsWeb ? 5 : 5.sp),
                                              decoration: BoxDecoration(
                                                borderRadius:
                                                    BorderRadius.circular(12.r),
                                                border: Border.all(
                                                    width: 1,
                                                    color:
                                                        CustomColors.baseColor),
                                              ),
                                              child: Center(
                                                child: Text(
                                                  AppLocalizations.of(context)!
                                                      .resend,
                                                  style: CustomTextStyles
                                                      .mediumText(
                                                    kIsWeb ? 16 : 16.sp,
                                                    color:
                                                        CustomColors.baseColor,
                                                  ),
                                                ),
                                              ),
                                            ),
                                          )
                                        : Container(
                                            margin: EdgeInsets.only(
                                                left: kIsWeb ? 12 : 12.w,
                                                right: kIsWeb ? 12 : 12.w,
                                                top: kIsWeb ? 6 : 6.h),
                                            padding: EdgeInsets.all(
                                                kIsWeb ? 5 : 5.sp),
                                            decoration: BoxDecoration(
                                              borderRadius:
                                                  BorderRadius.circular(
                                                      kIsWeb ? 12 : 12.r),
                                              border: Border.all(
                                                  width: kIsWeb ? 1 : 1.w,
                                                  color:
                                                      const Color(0x1A2196F3)),
                                            ),
                                            child: Center(
                                              child: Text(
                                                AppLocalizations.of(context)!
                                                    .resend,
                                                style:
                                                    CustomTextStyles.mediumText(
                                                  kIsWeb ? 16 : 16.sp,
                                                  color:
                                                      const Color(0x1A2196F3),
                                                ),
                                              ),
                                            ),
                                          ),
                                  ],
                                )
                              : const SizedBox(),
                          SizedBox(height: kIsWeb ? 20 : 20.h),
                          CommonButton(
                            buttonText:
                                AppLocalizations.of(context)!.verifyCode,
                            onTap: () {
                              if (otpCon.text.trim().isNotEmpty) {
                                commonProvider.setLoading(true);
                                _resetPassBloc.add(VerifyToken(
                                  email: emailCon.text.trim(),
                                  token: otpCon.text.trim(),
                                ));
                              }
                            },
                          ),
                          SizedBox(height: kIsWeb ? 10 : 10.h),
                        ],
                      ),
                    )
                  : Padding(
                      padding: EdgeInsets.only(
                          left: kIsWeb ? 12 : 12.w, right: kIsWeb ? 12 : 12.w),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          SizedBox(height: kIsWeb ? 10 : 30.h),
                          Align(
                            alignment: Alignment.centerLeft,
                            child: FieldTitle(
                              title: AppLocalizations.of(context)!.email,
                              star: '*',
                            ),
                          ),
                          SizedBox(height: kIsWeb ? 4 : 4.h),
                          CommonTextField(
                              controler: emailCon,
                              hint: "jhone@gmail.com",
                              textAlign: TextAlign.start,
                              redOnly: false),
                          SizedBox(height: kIsWeb ? 25 : 25.h),
                          BlocConsumer<ResetPassBloc, ResetPassState>(
                            builder: (_, state) {
                              if (state is ResetPassLoading) {
                                return const CommonLoadingButton();
                              }

                              return  CommonButton(
                                buttonText: AppLocalizations.of(context)!.continueT,
                                onTap: () {
                                  authProvider.checkEmailValidity(emailCon.text);
                                  bool validUserEmail = authProvider.isValidEmail;
                                  if(emailCon.text.trim().isNotEmpty){
                                    if (validUserEmail) {
                                      FocusNode currentScope = FocusScope.of(context);
                                      if (!currentScope.hasPrimaryFocus &&
                                          currentScope.hasFocus) {
                                        FocusManager.instance.primaryFocus?.unfocus();
                                      }
                                      _resetPassBloc.add(ResetPassWithEmail(
                                          email: emailCon.text.trim()));

                                    }
                                    else {
                                      CommonFunctions.showCustomSnackBar(
                                          context,
                                          AppLocalizations.of(context)!
                                              .enterValidEmail);
                                    }
                                  }
                                  else {
                                    CommonFunctions.showCustomSnackBar(context,
                                        "${AppLocalizations.of(context)!.email} ${AppLocalizations.of(context)!.fieldRequired}");
                                  }

                                },
                              );
                            },
                            listener: (context, state) {
                              if (state is ResetPassFailure) {
                                commonProvider.setLoading(false);
                                CommonFunctions.showUpSnack(
                                  message: state.authModel.message,
                                  context: context,
                                );
                              }
                              if (state is ResetPassLoaded) {
                                CommonFunctions.showUpSnack(
                                    context: context,
                                    message: state.authModel.message);
                                WidgetsBinding.instance.addPostFrameCallback((_) {
                                  commonProvider.setLoading(false);
                                  if (resetPassCon.isOpenOTPField) {
                                    context.goNamed(
                                      RouteNames.setPasswordScreen,
                                      extra: {
                                        'email': emailCon.text.trim(),
                                        'token': otpCon.text.trim(),
                                      },
                                    );
                                  } else {
                                    resetPassCon.startTimer(180);
                                    resetPassCon.setOtpFieldTrue(true);
                                  }
                                });
                              }
                              if (state is ResetPassConnectionError) {
                                commonProvider.setLoading(false);
                                CommonFunctions.showUpSnack(
                                  message: "noInternet",
                                  context: context,
                                );
                              }
                            },
                          ),

                          SizedBox(height: kIsWeb ? 40 : 40.h),
                          if (!kIsWeb) Align(
                            alignment: Alignment.topRight,
                            child: InkWell(
                              onTap: () {
                                context.goNamed(RouteNames.loginScreen);
                              },
                              child: Center(
                                  child: RichText(
                                text: TextSpan(
                                  text: AppLocalizations.of(context)!
                                      .backToSignIn,
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyMedium!
                                      .copyWith(
                                          fontSize: kIsWeb ? 14 : 14.sp,
                                          color: CustomColors.baseColor,
                                          fontWeight: FontWeight.w500),
                                ),
                              )),
                            ),
                          ),
                        ],
                      ),
                    ),
            ],
          ),
        ),
      ),
    );
  }
}
