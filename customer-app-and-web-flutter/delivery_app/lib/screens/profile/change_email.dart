
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/screens/auth_screens/otp_input.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/reset_password/reset_password_bloc.dart';
import '../../controller/bloc/reset_password/reset_password_event.dart';
import '../../controller/bloc/reset_password/reset_password_state.dart';
import '../../controller/provider/authentication_provider.dart';
import '../../controller/provider/common_provider.dart';
import '../../controller/provider/reset_password_provider.dart';

import '../../l10n/app_localizations.dart';
import '../common_widgets/commn_textfield.dart';
import '../common_widgets/common_button.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/field_title.dart';

class ChangeEmail extends StatefulWidget {
  const ChangeEmail({super.key});

  @override
  State<ChangeEmail> createState() => _ChangeEmailState();
}

class _ChangeEmailState extends State<ChangeEmail> {
  final TextEditingController newEmailCon = TextEditingController();
  final TextEditingController oldEmailCon = TextEditingController();
  final TextEditingController otpCon = TextEditingController();
  final FocusNode conPassFocusNode = FocusNode();
  late final ResetPassBloc _resetPassBloc;

  String _token = '';


  getUserToken() async {
    String? token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    String? email = await UserSharedPreference.getValue(
      SharedPreferenceHelper.email,
    );
    _token = token ?? '';
    oldEmailCon.text= email ?? '';
  }
  @override
  void initState() {
    _resetPassBloc = context.read<ResetPassBloc>();
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
    newEmailCon.dispose();
    oldEmailCon.dispose();
    otpCon.dispose();
    super.dispose();
  }
  @override
  Widget build(BuildContext context) {
    var resetEmailCon = Provider.of<ResetPasswordCon>(context);
    var commonProvider = Provider.of<CommonProvider>(context);
    var authProvider = Provider.of<AuthenticationProvider>(context);
    return Scaffold(
      appBar: AppBar(
        title: Text(
            AppLocalizations.of(context)!.changeEmail,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
          fontSize: 18.sp,
        ),
        ),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.start,
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
                SizedBox(height: 25.h),
                BlocConsumer<ResetPassBloc, ResetPassState>(
                  builder: (_, state) {
                    if (state is ResetPassLoading) {
                      return const CommonLoadingButton();
                    }
                    return CommonButton(
                      buttonText: AppLocalizations.of(context)!.send,
                      onTap: () {
                        authProvider.checkEmailValidity(newEmailCon.text);
                        bool validUserEmail = authProvider.isValidEmail;
                        if ( newEmailCon.text.trim().isNotEmpty){
                        if (validUserEmail) {
                          FocusNode currentScope = FocusScope.of(context);
                          if (!currentScope.hasPrimaryFocus &&
                              currentScope.hasFocus) {
                            FocusManager.instance.primaryFocus?.unfocus();
                          }
                          _resetPassBloc.add(ChangeEmails(
                              email: newEmailCon.text.trim(),
                              vToken: otpCon.text.trim(),
                              token: _token
                          ));
                        }
                        else {
                          CommonFunctions.showCustomSnackBar(
                              context, AppLocalizations.of(context)!.enterValidEmail
                          );
                        }
                        }
                        else {
                          CommonFunctions.showCustomSnackBar(
                              context,
                              "${AppLocalizations.of(context)!.email} ${AppLocalizations.of(context)!.fieldRequired}"
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
                    if (state is ResetPassLoaded) {
                      context.pop();
                      CommonFunctions.showUpSnack(
                          context: context, message: state.authModel.message);
                      WidgetsBinding.instance.addPostFrameCallback((_) {
                        resetEmailCon.setTokenFieldOpen(false);
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
                Text(AppLocalizations.of(context)!.changeEmail,
              style: Theme.of(context)
              .textTheme
              .bodyMedium
              ?.copyWith(fontWeight: FontWeight.w600, fontSize: 20.sp),
                ),
                SizedBox(height: 14.h),
                FieldTitle(
                  title:  AppLocalizations.of(context)!.oldEmail,
                  star: '*',),
                CommonTextField(
                    controler: oldEmailCon,
                    hint: AppLocalizations.of(context)!.enterEmail,
                    textAlign: TextAlign.start,
                    redOnly: true),
                SizedBox(height: 14.h),
                FieldTitle(
                  title:  AppLocalizations.of(context)!.newEmail,
                  star: '*',),
                CommonTextField(
                    controler: newEmailCon,
                    hint: AppLocalizations.of(context)!.enterNewEmail,
                    textAlign: TextAlign.start,
                    redOnly: false),
                SizedBox(height: 25.h),
                BlocConsumer<ResetPassBloc, ResetPassState>(
                  builder: (_, state) {
                    if (state is ResetPassLoading) {
                      return const CommonLoadingButton();
                    }
                    return  CommonButton(
                      buttonText: AppLocalizations.of(context)!.proceed,
                      onTap: () {
                        //resetEmailCon.setTokenFieldOpen(true);
                        authProvider.checkEmailValidity(newEmailCon.text);
                        bool validUserEmail = authProvider.isValidEmail;
                        if ( newEmailCon.text.trim().isNotEmpty){
                          if (validUserEmail) {
                            FocusNode currentScope = FocusScope.of(context);
                            if (!currentScope.hasPrimaryFocus &&
                                currentScope.hasFocus) {
                              FocusManager.instance.primaryFocus?.unfocus();
                            }
                            commonProvider.setLoading(true);
                            _resetPassBloc.add(SendVerificationEmails(
                                email: newEmailCon.text.trim(),
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
                    if (state is ResetPassFailure) {
                      CommonFunctions.showUpSnack(
                        message: state.authModel.message,
                        context: context,
                      );
                    }
                    if (state is ResetPassLoaded) {
                      CommonFunctions.showUpSnack(
                          context: context, message: state.authModel.message);
                      WidgetsBinding.instance.addPostFrameCallback((_) {
                        resetEmailCon.setTokenFieldOpen(true);
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
          ),
          SizedBox(height: 40.h),
        ],
      ),
    );
  }
}
