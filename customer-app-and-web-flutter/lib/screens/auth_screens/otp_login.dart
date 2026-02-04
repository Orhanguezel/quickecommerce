import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/screens/auth_screens/otp_input.dart';
import '../../config/colors.dart';
import '../../config/strings.dart';
import '../../controller/bloc/profile_image_upload_bloc/profile_image_upload_bloc.dart';
import '../../controller/bloc/profile_image_upload_bloc/profile_image_upload_event.dart';
import '../../controller/bloc/save_bloc/save_bloc.dart';
import '../../controller/bloc/save_bloc/save_event.dart';
import '../../controller/bloc/save_bloc/save_state.dart';
import '../../controller/provider/checkout_controler.dart';
import '../../controller/provider/common_provider.dart';
import '../../controller/provider/reset_password_provider.dart';
import '../../l10n/app_localizations.dart';
import '../../router/route_name.dart';
import '../common_widgets/common_button.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/common_phone_number_field.dart';


class OTPLogin extends StatefulWidget {
  const OTPLogin({super.key});

  @override
  State<OTPLogin> createState() => _OTPLoginState();
}

class _OTPLoginState extends State<OTPLogin> {
  final TextEditingController otpController = TextEditingController();
  final TextEditingController phoneController = TextEditingController();
  late final SaveBloc _saveBloc;
  late final ProfileImageUploadBloc _uploadBloc;
  String region = 'BD';
  String completeNumber='';
  @override
  void initState() {
    super.initState();
    _saveBloc = context.read<SaveBloc>();
    _uploadBloc = context.read<ProfileImageUploadBloc>();
  }

  @override
  Widget build(BuildContext context) {
    var resetPassCon = Provider.of<ResetPasswordCon>(context);
    final checkoutCon = context.watch<CheckoutController>();
    var commonProvider = Provider.of<CommonProvider>(context);
    return PopScope(
          canPop: false,
          onPopInvokedWithResult: (didPop, result) {
            if (didPop) return;
            if(resetPassCon.isOpenOTPField){
              resetPassCon.setOtpFieldTrue(false);
              resetPassCon.startTimer(0);
            }else{
              Navigator.pop(context);
            }
          },
      child: SafeArea(
        child: Scaffold(
          appBar: AppBar(
            backgroundColor: Theme.of(context).scaffoldBackgroundColor,
            leading: IconButton(
                onPressed: (){
                  if(resetPassCon.isOpenOTPField){
                    resetPassCon.setOtpFieldTrue(false);
                    resetPassCon.startTimer(0);
                  }else{
                    Navigator.pop(context);
                  }
                },
                icon: const Icon(kIsWeb?Icons.close:Icons.arrow_back,
                color: Colors.black,
                )
            ),
          ),
          body: Padding(
            padding: EdgeInsets.symmetric(horizontal:kIsWeb?16: 16.w),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [

                Text(
                  resetPassCon.isOpenOTPField
                      ?AppLocalizations.of(context)!.oTPValidation
                      : AppLocalizations.of(context)!.signInWithMobileNumber,
                  style: Theme.of(context)
                      .textTheme
                      .bodyMedium!
                      .copyWith(fontSize:kIsWeb?18: 18.sp, fontWeight: FontWeight.w600),
                ),
                SizedBox(
                  height:kIsWeb?18: 18.h,
                ),
                resetPassCon.isOpenOTPField
                    ? Column(
                  children: [
                    Text(
                      AppLocalizations.of(context)!.weSentVerification,
                      style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                          fontSize:kIsWeb?14: 14.sp, fontWeight: FontWeight.w500),
                    ),
                    SizedBox(
                      height:kIsWeb?6: 6.h,
                    ),
                    Text(
                      Utils.maskPhoneNumber(completeNumber),
                      style: Theme.of(context).textTheme.headlineLarge!.copyWith(
                          fontSize: kIsWeb?14:14.sp, fontWeight: FontWeight.w500),
                    ),
                    SizedBox(
                      height:kIsWeb?10: 10.h,
                    ),
                    OTPInput(
                      otpCon: otpController,
                      height: 48,
                      width: 45,
                    ),
                    SizedBox(
                      height: kIsWeb?10:10.h,
                    ),
                    resetPassCon.isValidOtp == false
                        ? Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          resetPassCon.remainingTime,
                          style: Theme.of(context)
                              .textTheme
                              .headlineLarge!
                              .copyWith(
                              fontSize:kIsWeb?14: 14.sp,
                              fontWeight: FontWeight.w500),
                        ),
                        const Spacer(),
                        resetPassCon.secondsRemaining == 0
                            ? InkWell(
                          splashColor: Colors.white,
                          onTap: () {
                            _uploadBloc.add(ResendOtpEvent(
                              phone: phoneController.text,
                              region: region,
                            ));
                            resetPassCon.stopTimer();
                            resetPassCon.startTimer(180);
                          },
                          child: Container(
                            margin: EdgeInsets.only(
                                left: kIsWeb?12:12.w,
                                right: kIsWeb?12:12.w,
                                top: kIsWeb?6:6.h),
                            padding: EdgeInsets.all(kIsWeb?5:5.sp),
                            decoration: BoxDecoration(
                              borderRadius:
                              BorderRadius.circular(kIsWeb?12:12.r),
                              border: Border.all(
                                  width: 1,
                                  color: CustomColors.baseColor),
                            ),
                            child: Center(
                              child: Text(
                                AppLocalizations.of(context)!
                                    .resendCode,
                                style: Theme.of(context)
                                    .textTheme
                                    .headlineLarge!
                                    .copyWith(
                                    fontSize: kIsWeb?14:14.sp,
                                    fontWeight:
                                    FontWeight.w500),
                              ),
                            ),
                          ),
                        )
                            : Container(
                          margin: EdgeInsets.only(
                              left: kIsWeb?12:12.w, right: kIsWeb?12:12.w, top:kIsWeb?6: 6.h),
                          padding: EdgeInsets.all(kIsWeb?5:5.sp),
                          decoration: BoxDecoration(
                            borderRadius:
                            BorderRadius.circular(kIsWeb?12:12.r),
                            border: Border.all(
                                width: 1,
                                color: const Color(0x4D1A73E8)),
                          ),
                          child: Center(
                            child: Text(
                              AppLocalizations.of(context)!
                                  .resendCode,
                              style: Theme.of(context)
                                  .textTheme
                                  .displayLarge!
                                  .copyWith(
                                  fontSize: kIsWeb?14:14.sp,
                                  fontWeight:
                                  FontWeight.w500),
                            ),
                          ),
                        ),
                      ],
                    )
                        : const SizedBox(),
                    SizedBox(
                      height: kIsWeb?6:6.h,
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
                                : const Color(
                                0xFF1A73E8), // Border color when unchecked
                            width: 1.0,
                          ),
                          onChanged: (value) {
                            checkoutCon.setConditionAccept(value!);
                          },
                        ),
                        SizedBox(
                          height: kIsWeb?10:10.h,
                        ),
                        Text(
                          AppLocalizations.of(context)!.rememberMe,
                          style: Theme.of(context)
                              .textTheme
                              .bodyMedium
                              ?.copyWith(
                              fontWeight: FontWeight.w400,
                              fontSize:kIsWeb?12: 12.sp),
                        ),
                      ],
                    ),

                    BlocConsumer<SaveBloc, SaveState>(
                      listener: (context, state) {
                        if (state is SaveConnectionError) {
                          CommonFunctions.showCustomSnackBar(
                              context, AppLocalizations.of(context)!.noInternet);
                        }
                        else if (state is SaveFailure) {
                          CommonFunctions.showCustomSnackBar(
                              context, state.authModel.message);
                        }
                        else if (state is SaveLoaded) {
                          CommonFunctions.showUpSnack(
                              context: context,
                              message: state.authModel.message);
                          WidgetsBinding.instance.addPostFrameCallback((_) {
                            resetPassCon.setOtpFieldTrue(false);
                            context.goNamed(RouteNames.homeScreen);
                          });
                        }
                      },
                      builder: (context, state) {
                        if (state is SaveLoading) {
                          return  const CommonLoadingButton();
                        }
                        return CommonButton(
                          buttonText: AppLocalizations.of(context)!.signIn,
                          onTap: () {
                            if (otpController.text.isNotEmpty) {
                              _saveBloc.add(VerifyOtpEvent(
                                phone: phoneController.text,
                                region: region,
                                oTP: otpController.text,
                                rememberMe: checkoutCon.isConditionAccept,
                              ));
                            } else {
                              CommonFunctions.showCustomSnackBar(
                                context,
                                AppLocalizations.of(context)!.enterYourPhone,
                              );
                            }
                          },
                        );
                      },
                    ),
                  ],
                )
                    : Column(
                  children: [
                    CommonPhoneField(
                      controller: phoneController,
                      initialCountryCode: region,
                      hintText: AppLocalizations.of(context)!.enterPhone,
                      onChanged: (value) {
                        completeNumber = value.completeNumber;
                        region=value.countryISOCode;
                      },
                    ),
                    SizedBox(
                      height:kIsWeb?50: 50.h,
                    ),
                    BlocConsumer<SaveBloc, SaveState>(
                      listener: (context, state) {
                        if (state is SaveConnectionError) {
                          CommonFunctions.showCustomSnackBar(
                              context, AppLocalizations.of(context)!.noInternet);
                        } else if (state is SaveFailure) {
                          CommonFunctions.showCustomSnackBar(
                              context, state.authModel.message);
                        } else if (state is SaveLoaded) {
                          // CommonFunctions.showUpSnack(
                          //     context: context,
                          //     message: state.authModel.message);
                          WidgetsBinding.instance.addPostFrameCallback((_) {
                            resetPassCon.setOtpFieldTrue(true);
                            resetPassCon.startTimer(180);
                            commonProvider.setLoading(false);
                          });
                        }
                      },
                      builder: (context, state) {
                        if (state is SaveLoading) {
                          return const CommonLoadingButton();
                        }
                        return CommonButton(
                            buttonText: AppLocalizations.of(context)!.continueT,
                            onTap: () {
                              if (phoneController.text.isNotEmpty) {
                                commonProvider.setLoading(true);
                                _saveBloc.add(SendOtpEvent(
                                  phone: completeNumber,
                                  region: region.toLowerCase(),
                                ));
                              } else {
                                CommonFunctions.showCustomSnackBar(context,
                                    AppLocalizations.of(context)!.enterPhone);
                              }
                            });
                      },
                    )
                  ],
                )
              ],
            ),
          ),
        ),
      ),
    );
  }
}
