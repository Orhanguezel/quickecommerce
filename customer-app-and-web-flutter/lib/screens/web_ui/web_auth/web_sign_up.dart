import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/screens/web_ui/web_auth/web_login.dart';
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
import '../../../controller/provider/reset_password_provider.dart';
import '../../../l10n/app_localizations.dart';
import '../../../router/route_name.dart';
import '../../auth_screens/social_button.dart';
import '../../common_widgets/commn_textfield.dart';
import '../../common_widgets/common_button.dart';
import '../../common_widgets/common_funcktion.dart';
import '../../common_widgets/field_title.dart';

class WebSignUp extends StatefulWidget {
  const WebSignUp({super.key});

  @override
  State<WebSignUp> createState() => _WebSignUpState();
}

class _WebSignUpState extends State<WebSignUp> {
  late final LoginBloc _loginBloc;
  late final ProfileBloc _profileBloc;
  String _token = '', _fcToken = '';
  final TextEditingController firstNameCon = TextEditingController();
  final TextEditingController lastNameCon = TextEditingController();
  final TextEditingController emailCon = TextEditingController();
  final TextEditingController passwordCon = TextEditingController();
  final TextEditingController conPasswordCon = TextEditingController();
  final FocusNode firstNameFocusNode = FocusNode();
  getUserToken() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    var fcToken = await UserSharedPreference.getValue(
      SharedPreferenceHelper.fCMToken,
    );
    _token = token ?? "";
    _fcToken = fcToken ?? "";
  }

  @override
  void initState() {
    _loginBloc = context.read<LoginBloc>();
    _profileBloc = context.read<ProfileBloc>();
    getUserToken();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      firstNameFocusNode.requestFocus();
    });
    super.initState();
  }

  @override
  void dispose() {
    firstNameFocusNode.dispose();
    firstNameCon.dispose();
    lastNameCon.dispose();
    emailCon.dispose();
    passwordCon.dispose();
    super.dispose();
  }
  @override
  Widget build(BuildContext context) {
    var authProvider = Provider.of<AuthenticationProvider>(context);
    var commonProvider = Provider.of<CommonProvider>(context);
    var resetPassCon = Provider.of<ResetPasswordCon>(context);
    final checkoutCon = context.watch<CheckoutController>();
    double screenWidth = MediaQuery.of(context).size.width;
    return Scaffold(
      body: Row(
        children: [
          if(screenWidth>500) Container(
            color: Colors.white,
            child: Image.asset(
              Images.signup,
              fit: BoxFit.cover,
              width: MediaQuery.of(context).size.width * 0.4,
              height: MediaQuery.of(context).size.height * 0.5,
            ),
          ),
          Expanded(
            flex: 2,
            child: SingleChildScrollView(
              child: Column(
                children: [
                  const SizedBox(height: 30),
                  SizedBox(
                    height: 80,
                    width: 80,
                    child: BrandLogo(
                      height: 80,
                      fallbackAsset: Images.logo,
                    ),
                  ),
                  const SizedBox(
                    height: 10,
                  ),
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
                        AppLocalizations.of(context)!.doYouWantToCreateAnAccount,
                        style: Theme.of(context)
                            .textTheme
                            .displayLarge!
                            .copyWith(fontSize: 14, fontWeight: FontWeight.w500),
                      ),
                      Text(
                        " ? ",
                        style: Theme.of(context)
                            .textTheme
                            .headlineLarge!
                            .copyWith(fontSize: 18, fontWeight: FontWeight.w700),
                      ),
                      InkWell(
                        onTap: () {
                          Navigator.push(context,
                              MaterialPageRoute(builder: (_) => const WebLogin()));
                        },
                        child: Text(
                          AppLocalizations.of(context)!.signIn,
                          style: Theme.of(context)
                              .textTheme
                              .headlineLarge!
                              .copyWith(fontSize: 14, fontWeight: FontWeight.w500),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 21),
                  Padding(
                    padding: const EdgeInsets.only(left: 12, right: 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        FieldTitle(
                          title: AppLocalizations.of(context)!.firstName,
                          star: '*',
                        ),
                        CommonTextField(
                          controler: firstNameCon,
                          hint: AppLocalizations.of(context)!.enterFirstName,
                          textAlign: TextAlign.start,
                          redOnly: false,
                        ),
                        const SizedBox(height: 14),
                        FieldTitle(
                          title: AppLocalizations.of(context)!.lastName,
                        ),
                        CommonTextField(
                          controler: lastNameCon,
                          hint: AppLocalizations.of(context)!.enterLastName,
                          textAlign: TextAlign.start,
                          redOnly: false,
                        ),
                        const SizedBox(height: 14),
                        FieldTitle(
                          title: AppLocalizations.of(context)!.email,
                          star: '*',
                        ),
                        CommonTextField(
                          controler: emailCon,
                          hint: AppLocalizations.of(context)!.enterEmail,
                          textAlign: TextAlign.start,
                          redOnly: false,
                        ),
                        const SizedBox(height: 14),
                        FieldTitle(
                          title: AppLocalizations.of(context)!.password,
                          star: '*',
                        ),
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
                          controler: passwordCon,
                          hint: AppLocalizations.of(context)!.enterPassword,
                          textAlign: TextAlign.start,
                          redOnly: false,
                        ),
                        const SizedBox(height: 14),
                        FieldTitle(
                          title: AppLocalizations.of(context)!.confirmPassword,
                          star: '*',
                        ),
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
                          //  focusNode: firstNameFocusNode,
                          controler: conPasswordCon,
                          isPasswordHidden: resetPassCon.isConfPasswordHidden,
                          hint: AppLocalizations.of(context)!.enterConfirmPassword,
                          textAlign: TextAlign.start,
                          redOnly: false,
                        ),
                      ],
                    ),
                  ),
                  Row(
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
                      InkWell(
                        onTap: (){
                          if(checkoutCon.isConditionAccept){
                            checkoutCon.setConditionAccept(false);
                          } else{
                            checkoutCon.setConditionAccept(true);
                          }
                        },
                        child: Text("I’ve read and agreed the",
                          style: Theme.of(context)
                              .textTheme
                              .bodyMedium
                              ?.copyWith(
                              fontWeight: FontWeight.w400, fontSize: 10),
                        ),
                      ),
                      InkWell(
                        onTap: (){
                          context.pushNamed(RouteNames.termsAndCondition);
                        },
                        child: Text(AppLocalizations.of(context)!.termsAndConditions,
                          style: Theme.of(context)
                              .textTheme
                              .headlineLarge
                              ?.copyWith(
                              fontWeight: FontWeight.w400, fontSize: 10),
                        ),
                      ),
                      Text(" & ",
                        style: Theme.of(context)
                            .textTheme
                            .bodyMedium
                            ?.copyWith(
                            fontWeight: FontWeight.w400, fontSize: 10),
                      ),
                      InkWell(
                        onTap: (){
                          context.pushNamed(RouteNames.privacyPolicy);
                        },
                        child: Text(AppLocalizations.of(context)!.privacyPolicy,
                          style: Theme.of(context)
                              .textTheme
                              .headlineLarge
                              ?.copyWith(
                              fontWeight: FontWeight.w400, fontSize: 10),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  BlocConsumer<LoginBloc, LoginState>(
                    builder: (_, state) {
                      if (state is LoginLoading) {
                        return const CommonLoadingButton();
                      }
                      return CommonButton(
                        buttonText: AppLocalizations.of(context)!.createAccount,
                        onTap: () {
                          authProvider.checkEmailValidity(emailCon.text);
                          bool validUserEmail = authProvider.isValidEmail;
                          authProvider.checkPassAndConfPass(
                              passwordCon.text, conPasswordCon.text);
                          authProvider.checkPass(passwordCon.text);
                          authProvider.checkConfPass(conPasswordCon.text);
                          if ( firstNameCon.text.trim().isNotEmpty){
                            if ( emailCon.text.trim().isNotEmpty){
                              if (validUserEmail) {
                                if (passwordCon.text.trim().isNotEmpty) {
                                  if (conPasswordCon.text.trim().isNotEmpty) {
                                    if (authProvider.isValidPass) {
                                      if (authProvider.isValidCofPass) {
                                        if (authProvider.isValidPassAndCofPass) {
                                          FocusNode currentScope = FocusScope.of(context);
                                          if (!currentScope.hasPrimaryFocus &&
                                              currentScope.hasFocus) {
                                            FocusManager.instance.primaryFocus?.unfocus();
                                          }
                                          if(checkoutCon.isConditionAccept){
                                            _loginBloc.add(
                                              RegistrationWithUsernameAndEmail(
                                                  firstName: firstNameCon.text.trim(),
                                                  lastName: lastNameCon.text.trim(),
                                                  email: emailCon.text.trim(),
                                                  password: passwordCon.text.trim(),
                                                  role: const {"value": "Customer"},
                                                  token: _token),
                                            );
                                          }
                                          else {
                                            CommonFunctions.showCustomSnackBar(
                                                context,
                                                AppLocalizations.of(context)!
                                                    .passwordCheckTramsAndPolicy);
                                          }
                                        }
                                        else {
                                          CommonFunctions.showCustomSnackBar(
                                              context,
                                              AppLocalizations.of(context)!
                                                  .passwordAndConfirmPasswordNotMatch);
                                        }
                                      }
                                      else {
                                        CommonFunctions.showCustomSnackBar(
                                          context,
                                          AppLocalizations.of(context)!
                                              .passwordCharacters,
                                        );
                                      }
                                    }
                                    else {
                                      CommonFunctions.showCustomSnackBar(
                                        context,
                                        AppLocalizations.of(context)!
                                            .passwordCharacters,
                                      );
                                    }
                                  }
                                  else {
                                    CommonFunctions.showCustomSnackBar(
                                        context,
                                        "${AppLocalizations.of(context)!.confirmPassword} ${AppLocalizations.of(context)!.fieldRequired}"
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
                                CommonFunctions.showCustomSnackBar(context,
                                    AppLocalizations.of(context)!.enterValidEmail);
                              }
                            }
                            else {
                              CommonFunctions.showCustomSnackBar(
                                  context,
                                  "${AppLocalizations.of(context)!.email} ${AppLocalizations.of(context)!.fieldRequired}"
                              );
                            }
                          }
                          else {
                            CommonFunctions.showCustomSnackBar(
                                context,
                                "${AppLocalizations.of(context)!.firstName} ${AppLocalizations.of(context)!.fieldRequired}"
                            );
                          }


                        },
                      );
                    },
                    listener: (context, state) {
                      if (state is LoginFailure) {
                        CommonFunctions.showCustomSnackBar(
                          context,
                          state.authModel.message,
                        );
                        commonProvider.setLoading(false);
                      }
                      if (state is LoginLoaded) {
                        CommonFunctions.showUpSnack(
                            context: context, message: state.authModel.message);
                        commonProvider.setLoading(false);
                        _handleSinUpSuccess(context, state);
                        _profileBloc.add(Profile(token: Utils.formatString(state.authModel.token)));
                      }
                      if (state is LoginConnectionError) {
                        CommonFunctions.showUpSnack(
                          message: AppLocalizations.of(context)!.noInternet,
                          context: context,
                        );
                        commonProvider.setLoading(false);
                      }
                    },
                  ),
                  const SocialButton(),
                ],
              ),
            ),
          ),
          if(screenWidth>700) Expanded(
            flex: 1,
            child: Container(
              color: Theme.of(context).scaffoldBackgroundColor,
            ),
          ),
        ],
      ),
    );
  }
  Future<void> _handleSinUpSuccess(
      BuildContext context, LoginLoaded state) async {
    // Save email and password to shared preferences
    await UserSharedPreference.putValue(
      SharedPreferenceHelper.email,
      emailCon.text.trim(),
    );

    if (!context.mounted) return;
    // Show success message
    CommonFunctions.showUpSnack(
      context: context,
      message: state.authModel.message,
    );

    _loginBloc.add(
      LoginWithEmailAndPassword(
        email: emailCon.text.trim(),
        password: passwordCon.text.trim(),
        fcToken: _fcToken,
      ),
    );
    if(state.authModel.emailVerificationSettings=="on"){
      context.goNamed(RouteNames.emailVerification);
    }else{
      context.goNamed(RouteNames.homeScreen);
    }
  }
}
