
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/config/colors.dart';
import 'package:quick_ecommerce/config/text_styles.dart';
import 'package:quick_ecommerce/controller/bloc/email_verification/email_verification_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/email_verification/email_verification_event.dart';
import 'package:quick_ecommerce/controller/bloc/email_verification/email_verification_state.dart';
import 'package:quick_ecommerce/router/route_name.dart';
import 'package:quick_ecommerce/screens/auth_screens/otp_input.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/reset_password/reset_password_bloc.dart';
import '../../controller/bloc/reset_password/reset_password_event.dart';
import '../../controller/bloc/reset_password/reset_password_state.dart';
import '../../controller/provider/authentication_provider.dart';
import '../../controller/provider/reset_password_provider.dart';

import '../../l10n/app_localizations.dart';
import '../common_widgets/commn_textfield.dart';
import '../common_widgets/common_button.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/field_title.dart';

class EmailVerification extends StatefulWidget {
  const EmailVerification({super.key});

  @override
  State<EmailVerification> createState() => _EmailVerificationState();
}

class _EmailVerificationState extends State<EmailVerification> {
  final TextEditingController emailCon = TextEditingController();
  final TextEditingController otpCon = TextEditingController();
  final FocusNode conPassFocusNode = FocusNode();
  late final ResetPassBloc _resetPassBloc;
  late final EmailVerificationBloc _emailVerificationBloc;

  String _token = '';


  getUserToken() async {
    String? token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    String? email = await UserSharedPreference.getValue(
      SharedPreferenceHelper.email,
    );
    _token = token ?? '';
    emailCon.text= email ?? '';
  }
  @override
  void initState() {
    _resetPassBloc = context.read<ResetPassBloc>();
    _emailVerificationBloc = context.read<EmailVerificationBloc>();
    getUserToken();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      conPassFocusNode.requestFocus();
    });
    super.initState();
  }
  //=========== removing text controller on disposed ===================
  //--------------------------------------------------------------------

  @override
  void dispose() {
    emailCon.dispose();
    otpCon.dispose();
    super.dispose();
  }
  @override
  Widget build(BuildContext context) {
    var resetEmailCon = Provider.of<ResetPasswordCon>(context);
    var authProvider = Provider.of<AuthenticationProvider>(context);
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
       context.goNamed(RouteNames.homeScreen);
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text(AppLocalizations.of(context)!.emailVerification,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontSize: 18.sp,
            ),
          ),
        ),
        body: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(height:14.h ,),
            resetEmailCon.isTokenFieldOpen?
            Padding(
              padding: EdgeInsets.only(left: 12.w, right: 12.w),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    AppLocalizations.of(context)!.enterToken,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontSize: 18.sp,
                      fontWeight: FontWeight.w700,
                    ),

                  ),
                  SizedBox(height: 14.h),
                  OTPInput(
                    otpCon: otpCon,
                    height: 48,
                    width: 45,
                  ),
                  SizedBox(height: 10.h),
                  resetEmailCon.isValidOtp == false
                      ? Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text(
                        resetEmailCon.remainingTime,
                        style: CustomTextStyles.mediumText(
                          16.sp,
                          color: CustomColors.baseColor,
                        ),
                      ),
                      const Spacer(),
                      resetEmailCon.secondsRemaining == 0
                          ? InkWell(
                        splashColor: Colors.white,
                        onTap: () {
                          _emailVerificationBloc.add(ResendEmailVerification(
                              email: emailCon.text.trim(),
                              token: _token
                          ));
                          resetEmailCon.stopTimer();
                          resetEmailCon.startTimer(180);
                        },
                        child: Container(
                          margin: EdgeInsets.only(
                              left: 12.w,
                              right: 12.w,
                              top: 6.h),
                          padding: EdgeInsets.all(5.sp),
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
                              AppLocalizations.of(context)!.resend,
                              style: CustomTextStyles
                                  .mediumText(
                                16.sp,
                                color:
                                CustomColors.baseColor,
                              ),
                            ),
                          ),
                        ),
                      )
                          : Container(
                        margin: EdgeInsets.only(
                            left: 12.w,
                            right: 12.w,
                            top: 6.h),
                        padding: EdgeInsets.all(5.sp),
                        decoration: BoxDecoration(
                          borderRadius:
                          BorderRadius.circular(12.r),
                          border: Border.all(
                              width: 1.w,
                              color: const Color(0x1A2196F3)),
                        ),
                        child: Center(
                          child: Text(
                            AppLocalizations.of(context)!.resend,
                            style:
                            CustomTextStyles.mediumText(
                              16.sp,
                              color: const Color(0x1A2196F3),
                            ),
                          ),
                        ),
                      ),
                    ],
                  )
                      : const SizedBox(),
                  SizedBox(height: 25.h),
                  BlocConsumer<ResetPassBloc, ResetPassState>(
                    builder: (_, state) {
                      if (state is ResetPassLoading) {
                        return const CommonLoadingButton();
                      }
                      return CommonButton(
                        buttonText: AppLocalizations.of(context)!.send,
                        onTap: () {
                          if ( otpCon.text.trim().isNotEmpty){
                            if (otpCon.text.trim().length==6) {
                              _resetPassBloc.add(VerifyEmails(
                                  vToken: otpCon.text.trim(),
                                  token: _token
                              ));
                            }
                            else {
                              CommonFunctions.showCustomSnackBar(
                                  context, AppLocalizations.of(context)!.enterValidToken
                              );
                            }
                          }
                          else {
                            CommonFunctions.showCustomSnackBar(
                                context,
                                "${AppLocalizations.of(context)!.token} ${AppLocalizations.of(context)!.fieldRequired}"
                            );
                          }
                        },
                      );
                    },
                    listener: (context, state) {
                      if (state is ResetPassFailure) {
                        CommonFunctions.showUpSnack(
                          message: state.authModel.message,
                          context: context,
                        );
                      }
                      if (state is ResetPassLoaded){
                        CommonFunctions.showUpSnack(
                            context: context, message: state.authModel.message);
                        WidgetsBinding.instance.addPostFrameCallback((_) {
                          resetEmailCon.setTokenFieldOpen(false);
                          context.goNamed(RouteNames.homeScreen);
                        });

                      }
                      if (state is ResetPassConnectionError) {
                        CommonFunctions.showUpSnack(
                          message: AppLocalizations.of(context)!.noInternet,
                          context: context,
                        );
                      }
                    },
                  ),
                  SizedBox(height: 40.h),
                ],
              ),
            )
                :Padding(
              padding: EdgeInsets.only(left: 12.w, right: 12.w),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Text(AppLocalizations.of(context)!.emailVerification,
                      style: Theme.of(context)
                          .textTheme
                          .bodyMedium
                          ?.copyWith(fontWeight: FontWeight.w600, fontSize: 20.sp),
                    ),
                  ),
                  SizedBox(height: 14.h),
                  FieldTitle(
                    title:  AppLocalizations.of(context)!.email, star: '*',),
                  CommonTextField(
                      controler: emailCon,
                      hint: AppLocalizations.of(context)!.enterEmail,
                      textAlign: TextAlign.start,
                      redOnly: true),
                  SizedBox(height: 25.h),
                  BlocConsumer<EmailVerificationBloc, EmailVerificationState>(
                    builder: (_, state) {
                      if (state is EmailVerificationLoading) {
                        return const CommonLoadingButton();
                      }
                      return  CommonButton(
                        buttonText: AppLocalizations.of(context)!.proceed,
                        onTap: () {
                          authProvider.checkEmailValidity(emailCon.text);
                          bool validUserEmail = authProvider.isValidEmail;
                          if ( emailCon.text.trim().isNotEmpty){
                            if (validUserEmail) {
                              FocusNode currentScope = FocusScope.of(context);
                              if (!currentScope.hasPrimaryFocus &&
                                  currentScope.hasFocus) {
                                FocusManager.instance.primaryFocus?.unfocus();
                              }
                              _emailVerificationBloc.add(SendEmailVerification(
                                  email: emailCon.text.trim(),
                                  token: _token
                              ));
                            }
                            else {
                              CommonFunctions.showCustomSnackBar(
                                  context, AppLocalizations.of(context)!.enterValidEmail
                              );
                            }
                          } else {
                            CommonFunctions.showCustomSnackBar(
                                context,
                                "${AppLocalizations.of(context)!.newEmail} ${AppLocalizations.of(context)!.fieldRequired}"
                            );
                          }
                        },
                      );
                    },
                    listener: (context, state) {
                      if (state is EmailVerificationFailure) {
                        CommonFunctions.showUpSnack(
                          message: state.authModel.message,
                          context: context,
                        );
                      }
                      if (state is EmailVerificationLoaded) {
                        CommonFunctions.showUpSnack(
                            context: context, message: state.authModel.message);
                          resetEmailCon.setTokenFieldOpen(true);
                          resetEmailCon.startTimer(180);
                          resetEmailCon.setOtpFieldTrue(true);                    }
                      if (state is EmailVerificationConnectionError) {
                        CommonFunctions.showUpSnack(
                          message: AppLocalizations.of(context)!.noInternet,
                          context: context,
                        );
                      }
                    },
                  ),
                  SizedBox(height: 40.h),
                ],
              ),
            ),
            SizedBox(height: 40.h),
          ],
        ),
      ),
    );
  }
}
