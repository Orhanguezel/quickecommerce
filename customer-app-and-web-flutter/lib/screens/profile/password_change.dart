import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../config/icons.dart';
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
import '../common_widgets/common_card.dart';
import '../common_widgets/common_child_button.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/field_title.dart';

class PasswordChange extends StatefulWidget {
  const PasswordChange({super.key});

  @override
  State<PasswordChange> createState() => _PasswordChangeState();
}

class _PasswordChangeState extends State<PasswordChange> {
  final TextEditingController currentPassCon = TextEditingController();
  final TextEditingController newPassCon = TextEditingController();
  final TextEditingController confPassCon = TextEditingController();
  late final ResetPassBloc _resetPassBloc;
  String _token = '';

  getUserToken() async {
    String? token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    _token = token ?? '';
  }

  @override
  void initState() {
    getUserToken();
    _resetPassBloc = context.read<ResetPassBloc>();
    super.initState();
  }

  //ResetPasswordCon
  @override
  Widget build(BuildContext context) {
    var resetPassCon = Provider.of<ResetPasswordCon>(context);
    var authCon = Provider.of<AuthenticationProvider>(context);
    var commonProvider = Provider.of<CommonProvider>(context);
    return Scaffold(
      appBar: AppBar(
        title: Text(AppLocalizations.of(context)!.changePassword),
      ),
      body: CommonCard(
          mHorizontal: 10.w,
          pLeft: 10.w,
          pRight: 10.w,
          pTop: 10.w,
          widget: SingleChildScrollView(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  AppLocalizations.of(context)!.changePassword,
                  style: Theme.of(context)
                      .textTheme
                      .bodyMedium
                      ?.copyWith(fontWeight: FontWeight.w600, fontSize: 18.sp),
                ),
                Divider(
                  thickness: 1.w,
                  color: const Color(0xFFCECECE),
                ),
                SizedBox(
                  height: 4.h,
                ),
                FieldTitle(
                    title: AppLocalizations.of(context)!.oldPassword,
                    star: "*"),
                CommonTextField(
                  controler: currentPassCon,
                  hint: AppLocalizations.of(context)!.enterOldPassword,
                  textAlign: TextAlign.start,
                  prefixIcon: const Icon(
                    Icons.lock_outline,
                    color: Color(0xFF1A73E8),
                  ),
                  iconData: IconButton(
                      onPressed: () {
                        if (resetPassCon.isOldPasswordHidden == true) {
                          resetPassCon.oldPasswordHidden(false);
                        } else {
                          resetPassCon.oldPasswordHidden(true);
                        }
                      },
                      icon: resetPassCon.isOldPasswordHidden == true
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
                  isPasswordHidden: resetPassCon.isOldPasswordHidden,
                  redOnly: false,
                ),
                SizedBox(
                  height: 14.h,
                ),
                FieldTitle(
                    title: AppLocalizations.of(context)!.newPassword,
                    star: "*"),
                CommonTextField(
                    controler: newPassCon,
                    hint: AppLocalizations.of(context)!.enterNewPassword,
                    textAlign: TextAlign.start,
                    prefixIcon: const Icon(
                      Icons.lock_outline,
                      color: Color(0xFF1A73E8),
                    ),
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
                    redOnly: false),
                SizedBox(
                  height: 14.h,
                ),
                FieldTitle(
                    title: AppLocalizations.of(context)!.confirmPassword,
                    star: "*"),
                CommonTextField(
                    controler: confPassCon,
                    hint: AppLocalizations.of(context)!.enterConfirmPassword,
                    textAlign: TextAlign.start,
                    prefixIcon: const Icon(
                      Icons.lock_outline,
                      color: Color(0xFF1A73E8),
                    ),
                    isPasswordHidden: resetPassCon.isConfPasswordHidden,
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
                    redOnly: false),
                SizedBox(
                  height: 32.h,
                ),
                BlocConsumer<ResetPassBloc, ResetPassState>(
                  builder: (_, state) {
                    if (state is ResetPassLoading) {
                      return const CommonLoadingButton();
                    }

                    return ChildButton(
                        widget: Text(
                          AppLocalizations.of(context)!.saveChanges,
                          style: Theme.of(context)
                              .textTheme
                              .titleLarge
                              ?.copyWith(
                                  fontWeight: FontWeight.w600, fontSize: 14.sp),
                        ),
                        onPressed: () {
                          authCon.checkPassAndConfPass(
                              newPassCon.text, confPassCon.text);
                          authCon.checkPass(newPassCon.text);
                          authCon.checkConfPass(confPassCon.text);
                          if (authCon.isValidPass) {
                            if (authCon.isValidCofPass) {
                              if (authCon.isValidPassAndCofPass) {
                                FocusNode currentScope = FocusScope.of(context);
                                if (!currentScope.hasPrimaryFocus &&
                                    currentScope.hasFocus) {
                                  FocusManager.instance.primaryFocus?.unfocus();
                                }
                                commonProvider.setLoading(true);
                                _resetPassBloc.add(ChangePassword(
                                    oldPassword: currentPassCon.text.trim(),
                                    newPassword: newPassCon.text.trim(),
                                    newConPassword: confPassCon.text.trim(),
                                    token: _token));
                              } else {
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
                        });
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
                      context.pop();
                      CommonFunctions.showUpSnack(
                          context: context, message: state.authModel.message);
                      WidgetsBinding.instance.addPostFrameCallback((_) {
                        commonProvider.setLoading(false);
                      });
                    }
                    if (state is ResetPassConnectionError) {
                      commonProvider.setLoading(false);
                      CommonFunctions.showUpSnack(
                        message: AppLocalizations.of(context)!.noInternet,
                        context: context,
                      );
                    }
                  },
                ),
                SizedBox(
                  height: 14.h,
                ),
              ],
            ),
          )),
    );
  }
}
