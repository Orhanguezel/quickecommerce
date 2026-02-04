import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/screens/common_widgets/commn_textfield.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_child_button.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_loading.dart';
import 'package:quick_ecommerce/screens/common_widgets/field_title.dart';
import 'package:quick_ecommerce/screens/settings/deactivate__or_delete_account.dart';


import '../../config/icons.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/reset_password/reset_password_bloc.dart';
import '../../controller/bloc/reset_password/reset_password_event.dart';
import '../../controller/bloc/reset_password/reset_password_state.dart';
import '../../controller/bloc/save_bloc/save_bloc.dart';
import '../../controller/bloc/save_bloc/save_event.dart';
import '../../controller/bloc/save_bloc/save_state.dart';
import '../../controller/provider/authentication_provider.dart';
import '../../controller/provider/common_provider.dart';
import '../../controller/provider/home_screen_provider.dart';
import '../../controller/provider/reset_password_provider.dart';
import '../../l10n/app_localizations.dart';
import '../auth_screens/otp_input.dart';
import '../common_widgets/common_button.dart';
import '../common_widgets/common_card.dart';
import '../common_widgets/common_dropdown.dart';
import '../common_widgets/common_funcktion.dart';


class SettingsWeb extends StatefulWidget {
  const SettingsWeb({super.key});

  @override
  State<SettingsWeb> createState() => _SettingsWebState();
}

class _SettingsWebState extends State<SettingsWeb> {
  final TextEditingController currentPassCon = TextEditingController();
  final TextEditingController newPassCon = TextEditingController();
  final TextEditingController confPassCon = TextEditingController();
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
    getUserToken();
    _resetPassBloc = context.read<ResetPassBloc>();
    super.initState();
  }

    @override
  Widget build(BuildContext context) {
      var resetPassCon = Provider.of<ResetPasswordCon>(context);
      var authCon = Provider.of<AuthenticationProvider>(context);
      var commonProvider = Provider.of<CommonProvider>(context);
      final homeCon = Provider.of<HomeScreenProvider>(context);
    return Scaffold(
      body: Column(
        children: [
          CommonCard(
            mVertical: 4,
            mHorizontal: 2,
            pRight: 6,
            pLeft: 6,
              widget: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    AppLocalizations.of(context)!.settings,
                    style: Theme.of(context)
                        .textTheme
                        .bodyMedium
                        ?.copyWith(fontWeight: FontWeight.w700, fontSize: 20),
                  ),
                ],
              ),
          ),
          Row(
            children: [
              Expanded(
                child: CommonCard(
                    mVertical: 2,
                    mHorizontal: 2,
                    pRight: 6,
                    pLeft: 6,
                    widget:  Wrap(
                      direction: Axis.horizontal,
                      children: [
                        WMenuItem(
                          onTap: () {
                            homeCon.setSettingsMenuName("Email");
                          },
                          title: AppLocalizations.of(context)!.changeEmail,
                          icon: AssetsIcons.email,
                        ),
                        WMenuItem(
                          onTap: () {
                            homeCon.setSettingsMenuName("Password");
                          },
                          title: AppLocalizations.of(context)!.changePassword,
                          icon: AssetsIcons.password,
                        ),
                        WMenuItem(
                          onTap: () {
                            homeCon.setSettingsMenuName("Deactivate");
                          },
                          title: AppLocalizations.of(context)!.deactivateDeleteAccount,
                          icon: AssetsIcons.delete,
                        ),
                      ],
                    )),
              ),
            ],
          ),
          homeCon. settingsMenuName=='Email'?
          CommonCard(
              mVertical: 2,
              mHorizontal:2,
              widget: resetPassCon.isTokenFieldOpen?
                   Padding(
                padding: const EdgeInsets.only(left: 12, right: 12),
                child: Row(
                  children: [
                    Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          AppLocalizations.of(context)!.enterToken,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                          ),

                        ),
                        const SizedBox(height: 14),
                        OTPInput(
                          otpCon: otpCon,
                          height: 48,
                          width: 45,
                        ),
                        const SizedBox(height: 25),
                        BlocConsumer<ResetPassBloc, ResetPassState>(
                          builder: (_, state) {
                            if (state is ResetPassLoading) {
                              return const CommonLoadingButton();
                            }
                            return CommonButton(
                              buttonText: AppLocalizations.of(context)!.send,
                              onTap: () {
                                authCon.checkEmailValidity(newEmailCon.text);
                                bool validUserEmail = authCon.isValidEmail;
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
                                resetPassCon.setTokenFieldOpen(false);
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
                        const SizedBox(height: 40),
                      ],
                    ),
                  ],
                ),
              )
                  :Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    AppLocalizations.of(context)!.changeEmail,
                    style: Theme.of(context)
                        .textTheme
                        .bodyMedium
                        ?.copyWith(fontWeight: FontWeight.w600, fontSize: 18),
                  ),
                  const Divider(
                    thickness: 1,
                    color: Color(0xFFCECECE),
                  ),
                  const SizedBox(
                    height: 4,
                  ),
                  Wrap(
                    spacing: 10,
                    direction: Axis.horizontal,
                    children: [
                      TitleAndField(title:AppLocalizations.of(context)!.email,
                        hint: AppLocalizations.of(context)!.email,
                        controler: oldEmailCon,),
                      TitleAndField(title:AppLocalizations.of(context)!.newEmail,
                        hint: AppLocalizations.of(context)!.enterEmail,
                        controler: newEmailCon,),

                    ],
                  ),
                  const SizedBox(height: 10,),
                  BlocConsumer<ResetPassBloc, ResetPassState>(
                    builder: (_, state) {
                      if (state is ResetPassLoading) {
                        return const CommonLoadingButton();
                      }
                      return  ChildButton(
                        widget: Text(AppLocalizations.of(context)!.proceed,
                          style: Theme.of(context)
                              .textTheme
                              .titleLarge
                              ?.copyWith(fontWeight: FontWeight.w300, fontSize: 16),
                        ),
                        onPressed: () {
                          authCon.checkEmailValidity(newEmailCon.text);
                          bool validUserEmail = authCon.isValidEmail;
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
                          resetPassCon.setTokenFieldOpen(true);
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
                  const SizedBox(height: 10),
                ],
              )
          )
              :homeCon. settingsMenuName=='Password'?
          CommonCard(
              mHorizontal: 2,
              mVertical: 2,
              widget: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    AppLocalizations.of(context)!.changePassword,
                    style: Theme.of(context)
                        .textTheme
                        .bodyMedium
                        ?.copyWith(fontWeight: FontWeight.w600, fontSize: 18),
                  ),
                  const Divider(
                    thickness: 1,
                    color: Color(0xFFCECECE),
                  ),
                  const SizedBox(
                    height: 4,
                  ),
                  Wrap(
                    spacing: 10,
                    direction: Axis.horizontal,
                    children: [
                      PasTitleAndField(title:AppLocalizations.of(context)!.oldPassword,
                        hint: AppLocalizations.of(context)!.enterOldPassword,
                        controler: currentPassCon,
                        isPasswordHidden: resetPassCon.isOldPasswordHidden,
                        onTapPasswordHidden: () {
                          if (resetPassCon.isOldPasswordHidden == true) {
                            resetPassCon.oldPasswordHidden(false);
                          } else {
                            resetPassCon.oldPasswordHidden(true);
                          }
                        },
                      ),
                      PasTitleAndField(title:AppLocalizations.of(context)!.newPassword,
                        hint: AppLocalizations.of(context)!.enterNewPassword,
                        controler: newPassCon,
                        isPasswordHidden: resetPassCon.isPasswordHidden,
                        onTapPasswordHidden: () {
                          if (resetPassCon.isPasswordHidden == true) {
                            resetPassCon.passwordHidden(false);
                          } else {
                            resetPassCon.passwordHidden(true);
                          }
                        },
                      ),
                      PasTitleAndField(title:AppLocalizations.of(context)!.confirmPassword,
                        hint: AppLocalizations.of(context)!.enterOldPassword,
                        controler: confPassCon,
                        isPasswordHidden: resetPassCon.isConfPasswordHidden,
                        onTapPasswordHidden: () {
                          if (resetPassCon.isConfPasswordHidden == true) {
                            resetPassCon.confPasswordHidden(false);
                          } else {
                            resetPassCon.confPasswordHidden(true);
                          }
                        },
                      ),

                    ],
                  ),
                  const SizedBox(height: 10,),
                  BlocConsumer<ResetPassBloc, ResetPassState>(
                    builder: (_, state) {
                      if (state is ResetPassLoading) {
                        return const CommonLoadingButton();
                      }
                      return ChildButton(
                          widget: Text(AppLocalizations.of(context)!.saveChanges,
                            style: Theme.of(context)
                                .textTheme
                                .titleLarge
                                ?.copyWith(fontWeight: FontWeight.w300, fontSize: 16),
                          ),
                          onPressed: (){
                            authCon.checkPassAndConfPass(
                                newPassCon.text, confPassCon.text);
                            authCon.checkPass(newPassCon.text);
                            authCon.checkConfPass(confPassCon.text);
                            if(currentPassCon.text.trim().isNotEmpty){
                              if(newPassCon.text.trim().isNotEmpty){
                                if(confPassCon.text.trim().isNotEmpty){
                                  if (authCon.isValidPass) {
                                    if (authCon.isValidCofPass) {
                                      if (authCon.isValidPassAndCofPass) {
                                        FocusNode currentScope = FocusScope.of(context);
                                        if (!currentScope.hasPrimaryFocus &&
                                            currentScope.hasFocus) {
                                          FocusManager.instance.primaryFocus?.unfocus();
                                        }
                                        _resetPassBloc.add(ChangePassword(
                                            oldPassword: currentPassCon.text.trim(),
                                            newPassword: newPassCon.text.trim(),
                                            newConPassword: confPassCon.text.trim(),
                                            token: _token));
                                      }
                                      else {
                                        CommonFunctions.showCustomSnackBar(
                                          context,
                                          AppLocalizations.of(context)!
                                              .passwordAndConfirmPasswordNotMatch,
                                        );
                                      }
                                    } else {
                                      CommonFunctions.showCustomSnackBar(
                                        context,
                                        AppLocalizations.of(context)!
                                            .passwordCharacters,
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
                                }
                                else {
                                  CommonFunctions.showCustomSnackBar(
                                      context,
                                      "${AppLocalizations.of(context)!.confirmPassword} ${AppLocalizations.of(context)!.fieldRequired}"
                                  );
                                }

                              }
                              else{
                                CommonFunctions.showCustomSnackBar(
                                    context,
                                    "${AppLocalizations.of(context)!.newPassword} ${AppLocalizations.of(context)!.fieldRequired}"
                                );
                              }
                            }   else {
                              CommonFunctions.showCustomSnackBar(
                                  context,
                                  "${AppLocalizations.of(context)!.oldPassword} ${AppLocalizations.of(context)!.fieldRequired}"
                              );
                            }
                          }
                      );
                    },
                    listener: (context, state) {
                      if (state is ResetPassFailure) {
                        CommonFunctions.showCustomSnackBar(context,  state.authModel.message);
                      }
                      if (state is ResetPassLoaded) {
                        CommonFunctions.showUpSnack(
                            context: context, message: state.authModel.message);
                      }
                      if (state is ResetPassConnectionError) {
                        CommonFunctions.showCustomSnackBar(context,  AppLocalizations.of(context)!.noInternet);
                      }
                    },
                  ),

                ],
              )
          )
              :homeCon. settingsMenuName=='Deactivate'?
         CommonCard(
           mHorizontal: 2,
             mVertical: 2,
             widget:  Column(
           crossAxisAlignment: CrossAxisAlignment.start,
           children: [
             Text(
               AppLocalizations.of(context)!.deactivateDeleteAccount,
               style: Theme.of(context)
                   .textTheme
                   .bodyMedium
                   ?.copyWith(fontWeight: FontWeight.w600, fontSize: 18),
             ),
             const Divider(
               thickness: 1,
               color: Color(0xFFCECECE),
             ),
             const SizedBox(
               height: 4,
             ),
             CommonCard(
               pBottom: 18,
               mHorizontal: 2,
               mVertical: 2,
               widget: Column(
                 crossAxisAlignment: CrossAxisAlignment.start,
                 children: [
                   Row(
                     children: [
                       Text(
                         AppLocalizations.of(context)!.deactivateTemporary,
                         style: Theme.of(context)
                             .textTheme
                             .bodyMedium
                             ?.copyWith(fontWeight: FontWeight.w700, fontSize: 12),
                       ),
                     ],
                   ),
                   const SizedBox(
                     height: 8,
                   ),
                   Text(
                     AppLocalizations.of(context)!.deactivateNote,
                     style: Theme.of(context)
                         .textTheme
                         .bodyMedium
                         ?.copyWith(fontWeight: FontWeight.w400, fontSize: 10),
                   ),
                   const SizedBox(
                     height: 11,
                   ),
                   ChildButton(
                       color: const Color(0xFFF57C00),
                       widget: Text(
                         AppLocalizations.of(context)!.deactivate,
                         style: Theme.of(context).textTheme.titleLarge?.copyWith(
                             fontWeight: FontWeight.w400, fontSize: 12),
                       ),
                       onPressed: () {
                         showDialog(
                           context: context,
                           builder: (BuildContext context) {
                             return  const DeactivateDialog();
                           },
                         );
                       })
                 ],
               ),
             ),
             CommonCard(
               pBottom: 18,
               mHorizontal: 2,
               mVertical: 2,
               widget: Column(
                 crossAxisAlignment: CrossAxisAlignment.start,
                 children: [
                   Row(
                     children: [
                       Text(
                         AppLocalizations.of(context)!.deletePermanent,
                         style: Theme.of(context)
                             .textTheme
                             .bodyMedium
                             ?.copyWith(fontWeight: FontWeight.w700, fontSize: 12),
                       ),
                     ],
                   ),
                   const SizedBox(
                     height: 8,
                   ),
                   Text(
                     AppLocalizations.of(context)!.deleteAccountNote,
                     style: Theme.of(context)
                         .textTheme
                         .bodyMedium
                         ?.copyWith(fontWeight: FontWeight.w400, fontSize: 10),
                   ),
                   const SizedBox(
                     height: 11,
                   ),
                   ChildButton(
                       color: const Color(0xFFFF5555),
                       widget: Text(
                         AppLocalizations.of(context)!.deleteAccount,
                         style: Theme.of(context).textTheme.titleLarge?.copyWith(
                             fontWeight: FontWeight.w400, fontSize: 12),
                       ),
                       onPressed: () {
                         showDialog(
                           context: context,
                           builder: (BuildContext context) {
                             return  const AccountDeleteDialog();
                           },
                         );
                       })
                 ],
               ),
             ),
           ],
         ))
              : const SizedBox(),
        ],
      ),
    );
  }
}


class WMenuItem extends StatelessWidget {
  final String title;
  final String icon;
  final VoidCallback onTap;

  const WMenuItem({
    super.key,
    required this.title,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        width: 250,
        height: 40,
        padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 10),
        margin: const EdgeInsets.symmetric(vertical: 5, horizontal:8),
        decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            border: Border.all(width: 1,color: Colors.grey)
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Image.asset(
              icon,
              height: 20,
              width: 20,
              color: Colors.black,
              fit: BoxFit.contain,
            ),
            Text(
              title,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(fontWeight: FontWeight.w300, fontSize: 16),
            ),
          ],
        ),
      ),
    );
  }
}
class TitleAndField extends StatelessWidget {
final String title;
final String hint;
final TextEditingController controler;
  const TitleAndField({super.key,
    required this.title,
    required this.hint,
    required this.controler,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        FieldTitle(title:title),

      SizedBox(
        width: 250,
        child: CommonTextField(
            controler: controler,
            hint: hint,
            textAlign: TextAlign.start
        ),
      ),
        const SizedBox(height: 10,),
      ],
    );
  }
}


class DeactivateDialog extends StatefulWidget {
  const DeactivateDialog({super.key});

  @override
  State<DeactivateDialog> createState() => _DeactivateDialogState();
}

class _DeactivateDialogState extends State<DeactivateDialog> {
  List<String> reasonsList=["Not satisfied with products",
    " Found a better deal elsewhere",
    " No longer shopping online",
    "Limited product selection",
    " Shipping issues",
    "Too many marketing emails"
  ];
  late final SaveBloc _saveBloc;
  final TextEditingController describeCon = TextEditingController();
  @override
  void initState() {
    getUserToken();
    _saveBloc = context.read<SaveBloc>();
    super.initState();
  }
  String _token = '';

  getUserToken() async {
    String? token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    _token = token ?? '';
  }
  @override
  Widget build(BuildContext context) {
    var commonProvider = Provider.of<CommonProvider>(context);
    return AlertDialog(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      content: SizedBox(
        height: 300,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              AppLocalizations.of(context)!.deactivateAccount,

              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w700, fontSize: 12),
            ),
            const SizedBox(
              height: 8,
            ),
            const Divider(thickness: 1, color: Color(0xFFCECECE)),
            const SizedBox(
              height: 8,
            ),
            FieldTitle(
              title: AppLocalizations.of(context)!.deactivatePurpose,
            ),
            CommonDropdown(
                dList: reasonsList,
                title: AppLocalizations.of(context)!.deactivatePurpose,
                dropdownValue: commonProvider.selectedReason,
                onChanged: (String? value ){
                  commonProvider.setReason(value!);
                }
            ),
            const SizedBox(
              height: 8,
            ),
            FieldTitle(
              title: AppLocalizations.of(context)!.describe,
            ),
            CommonTextFields(
              controler: describeCon,
              hint:
              "e.g. Let us know why you’re choosing to deactivate your account.",
              textAlign: TextAlign.start,
              redOnly: false,
            ),
            const SizedBox(
              height: 8,
            ),

          ],
        ),
      ),
      actions: [
         BlocConsumer<SaveBloc, SaveState>(
          builder: (_, state) {
            if (state is SaveLoading) {
              return const CommonLoading();
            }
            return ChildButton(
                color: const Color(0xFFF57C00),
                widget: Text(
                  AppLocalizations.of(context)!.deactivate,
                  style: Theme.of(context)
                      .textTheme
                      .titleLarge
                      ?.copyWith(
                      fontWeight: FontWeight.w400,
                      fontSize: 12),
                ),
                onPressed: () {
                  if(commonProvider.selectedAccountStatus == 'active'){
                    if (commonProvider.selectedReason.isNotEmpty) {
                      _saveBloc.add(ActivateDeactivate(
                        reason: commonProvider.selectedReason,
                        description: describeCon.text,
                        type:  "deactivate",
                        token: _token,
                      ));
                      commonProvider.setLoading(true);
                    }else{
                      CommonFunctions.showCustomSnackBar(
                          context, "Please Select Deactivate Reason "
                      );
                    }
                  }else{
                    _saveBloc.add(ActivateDeactivate(
                      reason: "",
                      description: describeCon.text,
                      type: "activate",
                      token: _token,
                    ));
                    commonProvider.setLoading(true);
                  }

                });
          },
          listener: (context, state) async {
            if (state is SaveFailure) {
              CommonFunctions.showCustomSnackBar(
                context, state.authModel.message,
              );

            } else if (state is SaveLoaded) {
              context.pop();
              CommonFunctions.showUpSnack(
                message: state.authModel.message,
                context: context,
              );
            } else if (state is SaveConnectionError) {
              CommonFunctions.showCustomSnackBar(
                context, AppLocalizations.of(context)!.noInternet,
              );
            }
          },
        )
      ],
    );
  }
}


class PasTitleAndField extends StatelessWidget {
  final String title;
  final String hint;
  final bool isPasswordHidden;
  final TextEditingController controler;
  final VoidCallback onTapPasswordHidden;
  const PasTitleAndField({super.key,
    required this.title,
    required this.hint,
    required this.controler,
    required this.isPasswordHidden,
    required this.onTapPasswordHidden,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        FieldTitle(title:title),

        SizedBox(
          width: 250,
          child: CommonTextField(
              controler: controler,
              hint: hint,
              prefixIcon: const Icon(
                Icons.lock_outline,
                color: Color(0xFF1A73E8),
              ),
              iconData: IconButton(
                  onPressed:onTapPasswordHidden,
                  icon: isPasswordHidden == true
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
              isPasswordHidden: isPasswordHidden,
              textAlign: TextAlign.start
          ),
        ),
        const SizedBox(height: 10,),
      ],
    );
  }
}