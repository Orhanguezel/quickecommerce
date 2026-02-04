import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../l10n/app_localizations.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/config/icons.dart';
import 'package:quick_ecommerce/controller/bloc/login_bloc/login_event.dart';
import 'package:quick_ecommerce/screens/auth_screens/otp_login.dart';
import 'package:quick_ecommerce/screens/auth_screens/social_button.dart';
import 'package:quick_ecommerce/screens/common_widgets/commn_textfield.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_button.dart';

import '../../config/colors.dart';
import '../../config/images.dart';
import '../../widgets/brand_logo.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/strings.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/login_bloc/login_bloc.dart';
import '../../controller/bloc/login_bloc/login_state.dart';
import '../../controller/bloc/profile_bloc/profile_bloc.dart';
import '../../controller/bloc/profile_bloc/profile_event.dart';
import '../../controller/provider/authentication_provider.dart';
import '../../controller/provider/checkout_controler.dart';
import '../../controller/provider/common_provider.dart';
import '../../controller/provider/reset_password_provider.dart';
import '../../router/route_name.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/field_title.dart';


class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController emailCon = TextEditingController();
  final TextEditingController passwordCon = TextEditingController();
  late final LoginBloc _loginBloc;
  late final ProfileBloc _profileBloc;
  final FocusNode passFocusNode = FocusNode();
  @override
  void initState() {
    _loginBloc = context.read<LoginBloc>();
    _profileBloc = context.read<ProfileBloc>();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      passFocusNode.requestFocus();
    });
    getUserToken();
    super.initState();
  }
  String _fcToken='';
  Future<void> getUserToken() async {
    var fcToken = await UserSharedPreference.getValue(
      SharedPreferenceHelper.fCMToken,
    );
    _fcToken = fcToken ?? "";
  }
  @override
  Widget build(BuildContext context) {
    var authProvider = Provider.of<AuthenticationProvider>(context);
    var commonProvider = Provider.of<CommonProvider>(context);
    var resetPassCon = Provider.of<ResetPasswordCon>(context);
    final checkoutCon = context.watch<CheckoutController>();
    return SafeArea(
      child: Scaffold(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        resizeToAvoidBottomInset: false,
        body: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
             mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SizedBox(height: 30.h),
              SizedBox(
                height: 80.35.h,
                width: 80.12.w,
                child: BrandLogo(
                  height: 80.35.h,
                  fallbackAsset: Images.logo,
                ),
              ),
              SizedBox(height: 10.h),
              Text(AppLocalizations.of(context)!.welcomeBack,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontSize: 24.sp,
                    fontWeight: FontWeight.w700,
                  )),
              SizedBox(height: 8.h),
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    AppLocalizations.of(context)!.doYouWantToCreateAnAccount,
                    style: Theme.of(context).textTheme.displayLarge!.copyWith(
                        fontSize: 14.sp,
                        fontWeight: FontWeight.w500),
                  ),
                  Text(
                  " ? ",
                    style: Theme.of(context).textTheme.headlineLarge!.copyWith(
                        fontSize: 18.sp,
                        fontWeight: FontWeight.w700),
                  ),
                  InkWell(
                    onTap: () {
                      context.pushNamed(RouteNames.registration);
                    },
                    child: Text(
                      AppLocalizations.of(context)!.singUp,
                      style: Theme.of(context).textTheme.headlineLarge!.copyWith(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.w500),
                    ),
                  ),
                ],
              ),

              Padding(
                padding: EdgeInsets.only(left: 12.w, right: 12.w, top: 20.h),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    FieldTitle(title: AppLocalizations.of(context)!.email,star:"*"),
                    SizedBox(height: 4.h),
                    CommonTextField(
                        controler: emailCon,
                        hint:AppLocalizations.of(context)!.enterEmail,
                        textAlign: TextAlign.start,
                        inputFormatters: [
                          LengthLimitingTextInputFormatter(255),
                        ],
                        redOnly: false),
                    SizedBox(height: 14.h),
                    FieldTitle(title: AppLocalizations.of(context)!.password,star:"*"),
                    SizedBox(height: 4.h),
                    CommonTextField(
                        iconData: IconButton (
                            onPressed: (){
                              if (resetPassCon.isPasswordHidden == true) {
                                resetPassCon.passwordHidden(false);
                              } else {
                                resetPassCon.passwordHidden(true);
                              }
                            },
                            icon:  resetPassCon.isPasswordHidden == true
                                ? const ImageIcon(
                              AssetImage(
                                AssetsIcons.eye,
                              ),
                              color: Colors.grey,
                            )
                                : const Icon(
                              Icons.remove_red_eye_outlined,
                              color: Colors.grey,
                            )
                        ),
                        isPasswordHidden: resetPassCon.isPasswordHidden,
                       // focusNode: passFocusNode,
                        controler: passwordCon,
                        hint: AppLocalizations.of(context)!.enterPassword,
                        inputFormatters: [
                          LengthLimitingTextInputFormatter(12),
                        ],
                        textAlign: TextAlign.start,
                        redOnly: false),
                  ],
                ),
              ),
              Row(
               // mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Checkbox(
                    value: checkoutCon.isConditionAccept,
                    checkColor: Colors.white,
                    side: BorderSide(
                      color: checkoutCon.isConditionAccept
                          ? Colors
                          .blue // Border color when checked
                          : Colors
                          .grey, // Border color when unchecked
                      width: 1.0,
                    ),
                    onChanged: (value) {
                      checkoutCon.setConditionAccept(value!);
                    },
                  ),
                  Text(
                      AppLocalizations.of(context)!.rememberMe,
                    style: Theme.of(context).textTheme.bodyMedium
                        ?.copyWith(
                        fontWeight: FontWeight.w400, fontSize: 12.sp),
                  ),
                  const Spacer(),
                  InkWell(
                    onTap: () {
                      context.pushNamed(RouteNames.forgetPassword);
                    },
                    child: Text(AppLocalizations.of(context)!.forgetPassword,
                      style: Theme.of(context)
                          .textTheme
                          .bodyMedium!
                          .copyWith(
                          fontSize: 14.sp,
                          color: CustomColors.baseColor,
                          fontWeight: FontWeight.w500),
                    ),
                  ),
                  SizedBox(
                    width: 14.w,
                  ),
                ],
              ),

              BlocConsumer<LoginBloc, LoginState>(
                      builder: (_, state) {
                        if (state is LoginLoading) {
                          return const CommonLoadingButton();
                        }
                        return CommonButton(
                            buttonText: AppLocalizations.of(context)!.signIn,
                            onTap: () {
                              authProvider.checkEmailValidity(emailCon.text);
                              authProvider.checkPass(passwordCon.text);
                              bool validUserEmail = authProvider.isValidEmail;
                              if ( emailCon.text.trim().isNotEmpty){
                                if(validUserEmail){
                                  if ( passwordCon.text.trim().isNotEmpty) {
                                    if (authProvider.isValidPass){
                                      FocusNode currentScope = FocusScope.of(context);
                                      if (!currentScope.hasPrimaryFocus &&
                                          currentScope.hasFocus) {
                                        FocusManager.instance.primaryFocus?.unfocus();
                                      }
                                      commonProvider.setLoading(true);
                                      _loginBloc.add(
                                        LoginWithEmailAndPassword(
                                          email: emailCon.text.trim(),
                                          password: passwordCon.text.trim(),
                                          fcToken: _fcToken,
                                        ),
                                      );
                                    }
                                    else{
                                      CommonFunctions.showCustomSnackBar(
                                          context, AppLocalizations.of(context)!.enterValidPassword
                                      );
                                    }
                                  }
                                  else {
                                    CommonFunctions.showCustomSnackBar(
                                        context,
                                        "${AppLocalizations.of(context)!.password} ${AppLocalizations.of(context)!.fieldRequired}"
                                    );
                                  }
                                }
                                else {
                                  CommonFunctions.showCustomSnackBar(
                                      context, AppLocalizations.of(context)!.enterValidEmail
                                  );
                                }
                              } else {
                                CommonFunctions.showCustomSnackBar(
                                    context,
                                    "${AppLocalizations.of(context)!.email} ${AppLocalizations.of(context)!.fieldRequired}"
                                );
                              }


                            });
                      },
                      listener: (context, state){
                        if (state is LoginFailure) {
                          CommonFunctions.showCustomSnackBar(
                              context, state.authModel.message,
                          );
                        }
                        else if (state is LoginLoaded) {
                          CommonFunctions.showUpSnack(
                            message: state.authModel.message,
                            context: context,
                          );
                          if(state.authModel.emailVerificationSettings=="on"){
                            if(state.authModel.emailVerified){
                              _profileBloc.add(Profile(token: Utils.formatString(state.authModel.token)));
                              commonProvider.setLogin(true);
                              commonProvider.setEmailVerified(true);
                              if(Navigator.canPop(context)){
                                Navigator.pop(context);
                              }
                              else{
                                context.goNamed(RouteNames.homeScreen);
                              }
                            }else{
                              context.goNamed(RouteNames.emailVerification);
                            }
                          }else{
                            commonProvider.setLogin(true);
                            commonProvider.setEmailVerified(true);
                            _profileBloc.add(Profile(token: Utils.formatString(state.authModel.token)));
                            context.goNamed(RouteNames.homeScreen);
                          }

                          _handleLoginSuccess();
                          // Show success message
                          CommonFunctions.showUpSnack(
                            context: context,
                            message: state.authModel.message,
                          );
                        }
                        else if (state is LoginConnectionError) {
                          CommonFunctions.showUpSnack(
                            message: AppLocalizations.of(context)!.noInternet,
                            context: context,
                          );
                        }
                      },
                    )
                   ,
              SizedBox(height: 12.h),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  SizedBox(width: 12.h),
                  Expanded(
                    child: Container(
                      height: 1,
                      color: Colors.grey,
                    ),
                  ),
                  SizedBox(width: 8.h),
                  Text(
                    "Or",
                    style: Theme.of(context)
                        .textTheme
                        .displayLarge!
                        .copyWith(fontSize: 12.sp, fontWeight: FontWeight.w400),
                  ),
                  SizedBox(width: 8.h),
                  Expanded(
                    child: Container(
                      height: 1,
                      color: Colors.grey,
                    ),
                  ),
                  SizedBox(width: 12.h),
                ],
              ),
              SizedBox(height: 12.h),
              CommonButton(
                  bgColor: Colors.white,
                  textColor: Colors.black,
                  buttonText: AppLocalizations.of(context)!.loginWithOTP,
                  onTap: () {
                    Navigator.push(context,
                        MaterialPageRoute(builder: (_) => const OTPLogin()));
                  }),
              const SocialButton(),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _handleLoginSuccess() async {
    // Save email and password to shared preferences
    await UserSharedPreference.putValue(
      SharedPreferenceHelper.email,
      emailCon.text.trim(),
    );
  }
}
