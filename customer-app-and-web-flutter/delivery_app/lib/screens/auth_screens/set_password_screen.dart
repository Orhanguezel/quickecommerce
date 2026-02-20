import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/screens/auth_screens/social_button.dart';
import 'package:quick_ecommerce/screens/common_widgets/commn_textfield.dart';
import '../../config/icons.dart';
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
import '../common_widgets/common_loading.dart';
import '../common_widgets/field_title.dart';

class SetPasswordScreen extends StatefulWidget {
  const SetPasswordScreen(
      {super.key, required this.email, required this.token});
  final String email, token;
  @override
  State<SetPasswordScreen> createState() => _SetPasswordScreenState();
}

class _SetPasswordScreenState extends State<SetPasswordScreen> {
  final TextEditingController passwordCon = TextEditingController();
  final TextEditingController conPasswordCon = TextEditingController();
  final FocusNode conPassFocusNode = FocusNode();
  late final ResetPassBloc _resetPassBloc;

  @override
  void initState() {
    _resetPassBloc = context.read<ResetPassBloc>();
    // getUserToken();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      conPassFocusNode.requestFocus();
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    var commonProvider = Provider.of<CommonProvider>(context);
    var resetPassCon = Provider.of<ResetPasswordCon>(context);
    var authCon = Provider.of<AuthenticationProvider>(context);
    return Scaffold(
      resizeToAvoidBottomInset: true,
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            SizedBox(height: 60.h),
            Image.asset(
              Images.logo,
              height: 30.35.h,
              width: 30.12.w,
            ),
            SizedBox(
              height: 10.h,
            ),
            Text(AppLocalizations.of(context)!.quickEcommerce,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontSize: 12.sp,
                      fontWeight: FontWeight.w700,
                    )),
            SizedBox(height: 20.h),
            Text(AppLocalizations.of(context)!.newPassword,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontSize: 24.sp,
                      fontWeight: FontWeight.w700,
                    )),
            SizedBox(height: 21.h),
            Padding(
              padding: EdgeInsets.only(left: 12.w, right: 12.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  FieldTitle(
                    title:  AppLocalizations.of(context)!.password,
                    star: '*',),
                  CommonTextField(
                      iconData: IconButton(
                          onPressed: () {
                            if (resetPassCon.isPasswordHidden == true) {
                              resetPassCon.passwordHidden(false);
                            } else {
                              resetPassCon.passwordHidden(true);
                            }
                          },
                          icon: resetPassCon.isPasswordHidden == true
                              ? const ImageIcon(
                                  AssetImage(
                                    AssetsIcons.eye,
                                  ),
                                  color: Colors.grey,
                                )
                              : const Icon(
                                  Icons.remove_red_eye_outlined,
                                  color: Colors.grey,
                                )),
                      prefixIcon: IconButton(
                          onPressed: () {}, icon: const Icon(Icons.password)),
                      isPasswordHidden: resetPassCon.isPasswordHidden,
                      controler: passwordCon,
                      hint: "Enter your new Password",
                      textAlign: TextAlign.start,
                      redOnly: false),
                  SizedBox(height: 20.h),
                   FieldTitle(title:AppLocalizations.of(context)!.confirmPassword,star: '*',),
                  SizedBox(height: 4.h),
                  CommonTextField(
                      iconData: IconButton(
                          onPressed: () {
                            if (resetPassCon.isConfPasswordHidden == true) {
                              resetPassCon.confPasswordHidden(false);
                            } else {
                              resetPassCon.confPasswordHidden(true);
                            }
                          },
                          icon: resetPassCon.isConfPasswordHidden == true
                              ? const ImageIcon(
                                  AssetImage(
                                    AssetsIcons.eye,
                                  ),
                                  color: Colors.grey,
                                )
                              : const Icon(
                                  Icons.remove_red_eye_outlined,
                                  color: Colors.grey,
                                )),
                      prefixIcon: IconButton(
                          onPressed: () {}, icon: const Icon(Icons.password)),
                      isPasswordHidden: resetPassCon.isConfPasswordHidden,
                      focusNode: conPassFocusNode,
                      controler: conPasswordCon,
                      hint:AppLocalizations.of(context)!.enterConfirmPassword,
                      textAlign: TextAlign.start,
                      redOnly: false),
                ],
              ),
            ),
            SizedBox(height: 20.h),
            commonProvider.isLoading
                ? BlocConsumer<ResetPassBloc, ResetPassState>(
                    builder: (_, state) {
                      if (state is ResetPassLoading) {
                        return const CommonLoading();
                      }
                      return Container();
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
                            context: context, message: state.authModel.message);
                        WidgetsBinding.instance.addPostFrameCallback((_) {
                          commonProvider.setLoading(false);
                          context.goNamed(RouteNames.successfullyScreen,);
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
                  )
                : CommonButton(
              buttonText: AppLocalizations.of(context)!.resetPassword,
              onTap: () {
                resetPassCon.setOtpFieldTrue(false);
                authCon.checkPassAndConfPass(
                    passwordCon.text, conPasswordCon.text);
                authCon.checkPass(passwordCon.text);
                authCon.checkConfPass(conPasswordCon.text);
                if (authCon.isValidPass) {
                  if (authCon.isValidCofPass) {
                    if (authCon.isValidPassAndCofPass) {
                      FocusNode currentScope = FocusScope.of(context);
                      if (!currentScope.hasPrimaryFocus && currentScope.hasFocus) {
                        FocusManager.instance.primaryFocus?.unfocus();
                      }
                      commonProvider.setLoading(true);

                      _resetPassBloc.add(SetPassword(
                          email: widget.email,
                          token: widget.token,
                          password: passwordCon.text.trim(),
                          conPassword: conPasswordCon.text.trim()));
                    }
                    else {
                      CommonFunctions.showUpSnack(
                        message: AppLocalizations.of(context)!
                            .passwordAndConfirmPasswordNotMatch,
                        context: context,
                      );
                    }
                  } else {
                    CommonFunctions.showUpSnack(
                      message: AppLocalizations.of(context)!
                          .passwordCharacters,
                      context: context,
                    );
                  }
                }
                else {
                  CommonFunctions.showUpSnack(
                    message: AppLocalizations.of(context)!
                        .passwordCharacters,
                    context: context,
                  );
                }
              },
            ),
            const SocialButton(),
          ],
        ),
      ),
    );
  }
}
