
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/screens/web_ui/web_auth/web_sign_up.dart';
import '../../../config/colors.dart';
import '../../../config/icons.dart';
import '../../../config/images.dart';
import '../../../widgets/brand_logo.dart';
import '../../../config/shared_preference_helper.dart';
import '../../../config/strings.dart';
import '../../../config/user_shared_preference.dart';
import '../../../controller/bloc/login_bloc/login_bloc.dart';
import '../../../controller/bloc/login_bloc/login_event.dart';
import '../../../controller/bloc/login_bloc/login_state.dart';
import '../../../controller/bloc/profile_bloc/profile_bloc.dart';
import '../../../controller/bloc/profile_bloc/profile_event.dart';
import '../../../controller/provider/authentication_provider.dart';
import '../../../controller/provider/checkout_controler.dart';
import '../../../controller/provider/common_provider.dart';
import '../../../controller/provider/home_screen_provider.dart';
import '../../../controller/provider/reset_password_provider.dart';
import '../../../l10n/app_localizations.dart';
import '../../../router/route_name.dart';
import '../../auth_screens/forget_password_screen.dart';
import '../../auth_screens/otp_login.dart';
import '../../auth_screens/social_button.dart';
import '../../common_widgets/commn_textfield.dart';
import '../../common_widgets/common_button.dart';
import '../../common_widgets/common_funcktion.dart';
import '../../common_widgets/field_title.dart';

class WebLogin extends StatefulWidget {
  const WebLogin({super.key});

  @override
  State<WebLogin> createState() => _WebLoginState();
}

class _WebLoginState extends State<WebLogin> {
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

  String _fcToken = '';
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
    final homeCon = Provider.of<HomeScreenProvider>(context);
    var resetPassCon = Provider.of<ResetPasswordCon>(context);
    final checkoutCon = context.watch<CheckoutController>();
    double screenWidth = MediaQuery.of(context).size.width;
    return Scaffold(
      body: Row(
        children: [
          if (screenWidth > 500)
            Container(
              color: Colors.white,
              child: Image.asset(
                Images.signIn,
                fit: BoxFit.cover,
                width: MediaQuery.of(context).size.width * 0.4,
                height: MediaQuery.of(context).size.height * 0.5,
              ),
            ),
          Expanded(
            flex: 2,
            child: SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(height: 30),
                    SizedBox(
                      height: 80.35,
                      width: 80.12,
                      child: BrandLogo(
                        height: 80.35,
                        fallbackAsset: Images.logo,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(AppLocalizations.of(context)!.welcomeBack,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              fontSize: 24,
                              fontWeight: FontWeight.w700,
                            )),
                    const SizedBox(height: 8),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          AppLocalizations.of(context)!
                              .doYouWantToCreateAnAccount,
                          style: Theme.of(context)
                              .textTheme
                              .displayLarge!
                              .copyWith(
                                  fontSize: 14, fontWeight: FontWeight.w500),
                        ),
                        Text(
                          " ? ",
                          style: Theme.of(context)
                              .textTheme
                              .headlineLarge!
                              .copyWith(
                                  fontSize: 18, fontWeight: FontWeight.w700),
                        ),
                        InkWell(
                          onTap: () {
                            Navigator.push(
                                context,
                                MaterialPageRoute(
                                    builder: (_) => const WebSignUp()));
                          },
                          child: Text(
                            AppLocalizations.of(context)!.singUp,
                            style: Theme.of(context)
                                .textTheme
                                .headlineLarge!
                                .copyWith(
                                    fontSize: 14, fontWeight: FontWeight.w500),
                          ),
                        ),
                      ],
                    ),
                    Padding(
                      padding:
                          const EdgeInsets.only(left: 12, right: 12, top: 20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          FieldTitle(
                              title: AppLocalizations.of(context)!.email,
                              star: "*"),
                          const SizedBox(height: 4),
                          CommonTextField(
                              controler: emailCon,
                              hint: AppLocalizations.of(context)!.enterEmail,
                              textAlign: TextAlign.start,
                              inputFormatters: [
                                LengthLimitingTextInputFormatter(255),
                              ],
                              redOnly: false),
                          const SizedBox(height: 14),
                          FieldTitle(
                              title: AppLocalizations.of(context)!.password,
                              star: "*"),
                          const SizedBox(height: 4),
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
                                ? Colors.blue // Border color when checked
                                : Colors.grey, // Border color when unchecked
                            width: 1.0,
                          ),
                          onChanged: (value) {
                            checkoutCon.setConditionAccept(value!);
                          },
                        ),
                        Text(
                          AppLocalizations.of(context)!.rememberMe,
                          style: Theme.of(context)
                              .textTheme
                              .bodyMedium
                              ?.copyWith(
                                  fontWeight: FontWeight.w400, fontSize: 12),
                        ),
                        const Spacer(),
                        InkWell(
                          onTap: () {
                            showDialog(
                                context: context,
                                // barrierDismissible: false,
                                builder: (BuildContext context) {
                                  return  const AlertDialog(
                                    contentPadding: EdgeInsets.zero,
                                    content: SizedBox(
                                        width:350,
                                        height: 400,
                                        child: ForgetPasswordScreen()),
                                  );
                                });

                          },
                          child: Text(
                            AppLocalizations.of(context)!.forgetPassword,
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium!
                                .copyWith(
                                    fontSize: 14,
                                    color: CustomColors.baseColor,
                                    fontWeight: FontWeight.w500),
                          ),
                        ),
                        const SizedBox(
                          width: 14,
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
                              if (emailCon.text.trim().isNotEmpty) {
                                if (validUserEmail) {
                                  if (passwordCon.text.trim().isNotEmpty) {
                                    if (authProvider.isValidPass) {
                                      FocusNode currentScope =
                                          FocusScope.of(context);
                                      if (!currentScope.hasPrimaryFocus &&
                                          currentScope.hasFocus) {
                                        FocusManager.instance.primaryFocus
                                            ?.unfocus();
                                      }
                                      commonProvider.setLoading(true);
                                      _loginBloc.add(
                                        LoginWithEmailAndPassword(
                                          email: emailCon.text.trim(),
                                          password: passwordCon.text.trim(),
                                          fcToken: _fcToken,
                                        ),
                                      );
                                    } else {
                                      CommonFunctions.showCustomSnackBar(
                                          context,
                                          AppLocalizations.of(context)!
                                              .enterValidPassword);
                                    }
                                  } else {
                                    CommonFunctions.showCustomSnackBar(context,
                                        "${AppLocalizations.of(context)!.password} ${AppLocalizations.of(context)!.fieldRequired}");
                                  }
                                } else {
                                  CommonFunctions.showCustomSnackBar(
                                      context,
                                      AppLocalizations.of(context)!
                                          .enterValidEmail);
                                }
                              } else {
                                CommonFunctions.showCustomSnackBar(context,
                                    "${AppLocalizations.of(context)!.email} ${AppLocalizations.of(context)!.fieldRequired}");
                              }
                            });
                      },
                      listener: (context, state) {
                        if (state is LoginFailure) {
                          CommonFunctions.showCustomSnackBar(
                            context,
                            state.authModel.message,
                          );
                        } else if (state is LoginLoaded) {
                          CommonFunctions.showUpSnack(
                            message: state.authModel.message,
                            context: context,
                          );
                          if (state.authModel.emailVerificationSettings ==
                              "on") {
                            if (state.authModel.emailVerified) {
                              _profileBloc.add(Profile(
                                  token: Utils.formatString(
                                      state.authModel.token)));
                              homeCon.setTabType("Home");
                              commonProvider.setLogin(true);
                              commonProvider.setEmailVerified(true);
                              if (Navigator.canPop(context)) {
                                Navigator.pop(context);
                              } else {
                                context.goNamed(RouteNames.webHomeScreen);
                              }
                            } else {
                              context.goNamed(RouteNames.emailVerification);
                            }
                          } else {
                            commonProvider.setLogin(true);
                            commonProvider.setEmailVerified(true);
                            _profileBloc.add(Profile(
                                token:
                                    Utils.formatString(state.authModel.token)));
                            context.goNamed(RouteNames.homeScreen);
                          }

                          _handleLoginSuccess();
                          // Show success message
                          CommonFunctions.showUpSnack(
                            context: context,
                            message: state.authModel.message,
                          );
                        } else if (state is LoginConnectionError) {
                          CommonFunctions.showUpSnack(
                            message: AppLocalizations.of(context)!.noInternet,
                            context: context,
                          );
                        }
                      },
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const SizedBox(width: 12),
                        Expanded(
                          child: Container(
                            height: 1,
                            color: Colors.grey,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          "Or",
                          style: Theme.of(context)
                              .textTheme
                              .displayLarge!
                              .copyWith(
                                  fontSize: 12, fontWeight: FontWeight.w400),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Container(
                            height: 1,
                            color: Colors.grey,
                          ),
                        ),
                        const SizedBox(width: 12),
                      ],
                    ),
                    const SizedBox(height: 12),
                    CommonButton(
                        bgColor: Colors.white,
                        textColor: Colors.black,
                        buttonText: AppLocalizations.of(context)!.loginWithOTP,
                        onTap: () {
                          showDialog(
                              context: context,
                              builder: (BuildContext context) {
                                return const AlertDialog(
                                  contentPadding: EdgeInsets.zero,
                                  content: SizedBox(
                                      width: 350,
                                      height: 400,
                                      child: OTPLogin()),
                                );
                              });
                        }),
                    const SocialButton(),
                  ],
                ),
              ),
            ),
          ),
          if (screenWidth > 700)
            Expanded(
              flex: 1,
              child: Container(
                color: Theme.of(context).scaffoldBackgroundColor,
              ),
            ),
        ],
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
