
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/config/icons.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_fonfirmation_dialog.dart';
import 'package:quick_ecommerce/thyme/dark_theme.dart';
import 'package:quick_ecommerce/thyme/light_theme.dart';

import '../../config/colors.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/strings.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/profile_bloc/profile_bloc.dart';
import '../../controller/bloc/profile_bloc/profile_event.dart';
import '../../controller/bloc/profile_bloc/profile_state.dart';
import '../../controller/bloc/refresh_token/refresh_token_bloc.dart';
import '../../controller/provider/cart_controler.dart';
import '../../controller/provider/common_provider.dart';
import '../../controller/provider/home_screen_provider.dart';
import '../../controller/provider/my_orders_controller.dart';
import '../../controller/provider/thyme_provider.dart';
import '../../l10n/app_localizations.dart';
import '../../router/route_name.dart';
import '../common_widgets/common_card.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/person_avater.dart';
import '../common_widgets/profile_menue_widget.dart';
import '../home/item_card.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {

  late final ProfileBloc _profileBloc;
  late final RefreshTokenBloc _refreshTokenBloc;
  String _token = '',_emailSettingsOn="";
  bool _emailVerified=false;
  @override
  void initState() {
    _profileBloc = context.read<ProfileBloc>();
    _refreshTokenBloc = context.read<RefreshTokenBloc>();
    getUserToken();
    super.initState();
  }

  Future<void> getUserToken() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    var emailVeSettings = await UserSharedPreference.getValue(
      SharedPreferenceHelper.emailVerificationSettings,
    );
    var emailVerified = await UserSharedPreference.getBool(
      SharedPreferenceHelper.emailVerified,
    );
    _token = token ?? "";
    _emailSettingsOn = emailVeSettings ?? "";
    _emailVerified = emailVerified ?? false;
    CommonFunctions.checkTokenAndProceeds(
        refreshTokenBloc: _refreshTokenBloc,
        onProceed:()async{},
        onLogout: ()async{
          context.goNamed(RouteNames.loginScreen);
        }
    );
    if(_emailSettingsOn == "on"&&_emailVerified||_emailSettingsOn == "off"){
      _profileBloc.add(Profile(token: _token));
    }
    checkLogin();
  }
checkLogin(){
  if(_token.isNotEmpty){
    var commonCon = Provider.of<CommonProvider>(context, listen: false);
   commonCon.setLogin(true);
  }
}

  void checkEmailVerified(String title, String routeName)async {
    var emailVeSettings = await UserSharedPreference.getValue(
      SharedPreferenceHelper.emailVerificationSettings,
    );
    var emailVerified = await UserSharedPreference.getBool(
      SharedPreferenceHelper.emailVerified,
    );
    _emailSettingsOn = emailVeSettings ?? "";
    _emailVerified = emailVerified ?? false;
    if(!mounted)return;
    if (_emailSettingsOn == "on") {
      if (_emailVerified) {
        context.pushNamed(routeName);
        return;
      } else {
        showDialog(
          context: context,
          builder: (context) => CommonConfirmationDialog(
            title: AppLocalizations.of(context)?.emailVerificationRequired ?? "Email Verification Required",
            message:
            '${AppLocalizations.of(context)?.toAccessYour ?? "To access your"} $title, '
                '${AppLocalizations.of(context)?.pleaseVerifyYourEmail ?? "please verify your email."}',
            onConfirm: () {
              context.pushNamed(RouteNames.emailVerification);
            },
          ),
        );
        return;
      }
    }
    else {
      context.pushNamed(routeName);
    }
  }

  @override
  Widget build(BuildContext context) {
    var homeCon = Provider.of<HomeScreenProvider>(context, listen: true);
    final cartCon = context.watch<CartProvider>();
    var commonCon = Provider.of<CommonProvider>(context, listen: true);
    final themeProvider = Provider.of<ThemeProvider>(context, listen: true);
    final isDarkTheme = themeProvider.getTheme().brightness == Brightness.dark;
    final ordersController = Provider.of<MyOrdersController>(context);
      return Scaffold(
        appBar: AppBar(
          title: Text(
            AppLocalizations.of(context)!.profile,
            style: Theme.of(context)
                .textTheme
                .titleLarge
                ?.copyWith(fontWeight: FontWeight.w700, fontSize: 20.sp),
          ),
          centerTitle: true,
        ),
        body: ListView(
          children: [
            SizedBox(height: 6.h),
            if(commonCon.isLogin)
              BlocConsumer<ProfileBloc, ProfileState>(
                builder: (context, state) {
                  if (state is ProfileLoading) {
                    return const CommonCard(
                        widget: ShimmerLoadingWidget()
                    );
                  }
                  else if (state is ProfileLoaded) {
                    if (state.hasConnectionError) {
                      CommonFunctions.showCustomSnackBar(
                          context, AppLocalizations.of(context)!.noInternet
                      );
                    }
                    if(state.profileModel.data!=null){
                      final data = state.profileModel.data!;
                      _storeEmail( Utils.formatString(data.email));
                      if(data.status=='1'){
                        commonCon.setAccountStatus("active");
                      }else{
                        commonCon.setAccountStatus("deactivate");
                      }

                      return CommonCard(
                        mVertical: 5.h,
                        mHorizontal: 8.w,
                        widget: Row(
                          children: [
                            AvatarWidget(
                              imageUrl:data.imageUrl??"",
                              radius: 50,
                            ),
                            SizedBox(width: 12.h),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          Utils.formatString( data.fullName),
                                          overflow: TextOverflow.ellipsis,
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodyMedium
                                              ?.copyWith(
                                              fontWeight: FontWeight.w700,
                                              fontSize: 20.sp),
                                        ),
                                      ),

                                      InkWell(
                                        onTap: () {
                                          commonCon.setImageId(int.tryParse(data.image??"0")!,data.imageUrl??"");
                                          commonCon.setGender(Utils.capitalizeFirstLetter(data.gender));
                                          context.pushNamed(
                                              RouteNames.profileEdite,
                                              extra: {
                                                "first_name":Utils.formatString(data.firstName),
                                                "last_name":Utils.formatString( data.lastName),
                                                "phone":Utils.formatString( data.e164Phone),
                                                "country_code":Utils.formatString( data.isoCountryCode??"BD"),
                                                "birthday":Utils.formatString( data.birthDay),
                                              });
                                        },
                                        child: Image.asset(
                                          AssetsIcons.edit,
                                          height: 20.h,
                                          width: 20.w,
                                        ),
                                      )
                                    ],
                                  ),
                                  SizedBox(height: 8.h), // Responsive height
                                  Text(
                                    Utils.formatString(data.email),
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyMedium
                                        ?.copyWith(
                                        fontWeight: FontWeight.w400,
                                        fontSize: 12.sp),
                                  ),
                                  SizedBox(height: 8.h),
                                  Text(
                                    data.phone ?? "",
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyMedium
                                        ?.copyWith(
                                        fontWeight: FontWeight.w400,
                                        fontSize: 12.sp),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    }
                  }
                  else if (state is TokenExp) {
                    CommonFunctions.checkTokenAndProceeds(
                      refreshTokenBloc: _refreshTokenBloc,
                      onProceed:() async {
                        _profileBloc.add(Profile(token: _token));
                      },
                        onLogout: ()async{
                          context.goNamed(RouteNames.loginScreen);
                        }
                    );
                  }
                  return const SizedBox();
                },
                listener: (context, state) {
                  if (state is ProfileConnectionError) {
                    CommonFunctions.showUpSnack(
                      message: AppLocalizations.of(context)!.noInternet,
                      context: context,
                    );
                  }
                },
              ),
            CommonCard(
              mVertical: 5.h,
              mHorizontal: 8.w,
              widget: Column(
                children: [
                  if (commonCon.isLogin) ...[
                    CommonMenuItem(
                      title: AppLocalizations.of(context)!.myOrder,
                      icon: AssetsIcons.myOrders, // Replace with your icon path
                      color: const Color(0xFFE6EEF1),
                      onTap: () {
                        if (_emailSettingsOn == "on") {
                          if (_emailVerified) {
                            homeCon.setCurrentIndexHomePage(3);
                            return;
                          }
                          else {
                            showDialog(
                              context: context,
                              builder: (context) => CommonConfirmationDialog(
                                title: AppLocalizations.of(context)?.emailVerificationRequired ?? "Email Verification Required",
                                message:
                                '${AppLocalizations.of(context)?.toAccessYour ?? "To access your"} ${AppLocalizations.of(context)!.myOrder}, '
                                    '${AppLocalizations.of(context)?.pleaseVerifyYourEmail ?? "please verify your email."}',
                                onConfirm: () {
                                  context.pushNamed(RouteNames.emailVerification);
                                },
                              ),
                            );
                            return;
                          }
                        }
                        else {
                          homeCon.setCurrentIndexHomePage(3);
                        }
                      },
                    ),
                    CommonMenuItem(
                      title: AppLocalizations.of(context)!.myWishlist,
                      icon: AssetsIcons.wishlist, // Replace with your icon path
                      color: const Color(0xFFE6EEF1),
                      onTap: () {
                        checkEmailVerified(
                            AppLocalizations.of(context)!.myWishlist,
                            RouteNames.favoritesListScreen);
                      },
                    ),
                    CommonMenuItem(
                      title: AppLocalizations.of(context)!.myWallet,
                      icon: AssetsIcons.wallet, // Replace with your icon path
                      color: const Color(0xFFECF8F1),
                      onTap: () {
                        checkEmailVerified(
                            AppLocalizations.of(context)!.myWallet,
                            RouteNames.myWallet);
                      },
                    ),
                    CommonMenuItem(
                      title: AppLocalizations.of(context)!.chat,
                      icon: AssetsIcons.message, // Replace with your icon path
                      color: const Color(0xFFE6EEF1),
                      onTap: () {
                        checkEmailVerified(
                            AppLocalizations.of(context)!.chat,
                            RouteNames.chatListPage);
                      },
                    ),
                    CommonMenuItem(
                      title: AppLocalizations.of(context)!.address,
                      icon: AssetsIcons.address, // Replace with your icon path
                      color: const Color(0xFFEEF6FC),
                      onTap: () {
                        checkEmailVerified(
                            AppLocalizations.of(context)!.address,
                            RouteNames.shippingAddressList);
                      },
                    ),
                    CommonMenuItem(
                      title: AppLocalizations.of(context)!.supportTicket,
                      icon: AssetsIcons
                          .supportTicket, // Replace with your icon path
                      color: const Color(0xFFE9F9EE),
                      onTap: () {
                        checkEmailVerified(
                            AppLocalizations.of(context)!.supportTicket,
                            RouteNames.supportTicketListScreen);
                      },
                    ),
                    CommonMenuItem(
                      title: AppLocalizations.of(context)!.notification,
                      icon: AssetsIcons
                          .notification, // Replace with your icon path
                      color: const Color(0xFFE7D9D4),
                      onTap: () {
                        checkEmailVerified(
                            AppLocalizations.of(context)!.notification,
                            RouteNames.notificationScreen);
                      },
                    ),
                    CommonMenuItem(
                      title: AppLocalizations.of(context)!.settings,
                      icon: AssetsIcons.settings, // Replace with your icon path
                      color: const Color(0xFFECEFE8),
                      onTap: () {
                        checkEmailVerified(
                            AppLocalizations.of(context)!.settings,
                            RouteNames.settingsScreens);
                      },
                    ),
                  ],
                  CommonMenuItem(
                    title: AppLocalizations.of(context)!.termsAndConditions,
                    icon: AssetsIcons
                        .tramsCondition, // Replace with your icon path
                    color: const Color(0xFFF5FAFF),
                    onTap: () {
                      context.pushNamed(RouteNames.termsAndCondition);
                    },
                  ),
                  CommonMenuItem(
                    title: AppLocalizations.of(context)!.privacyPolicy,
                    icon: AssetsIcons
                        .privacyPolicy, // Replace with your icon path
                    color: const Color(0xFFF4EDED),
                    onTap: () {
                      context.pushNamed(RouteNames.privacyPolicy);
                    },
                  ),
                  CommonMenuItem(
                    title: AppLocalizations.of(context)!.contact,
                    icon: AssetsIcons.contact, // Replace with your icon path
                    color: const Color(0xFFE6EEF1),
                    onTap: () {
                      context.pushNamed(RouteNames.contactUs);
                    },
                  ),

                  CommonMenuItem(
                    title: AppLocalizations.of(context)!.language,
                    icon: AssetsIcons.language, // Replace with your icon path
                    color: const Color(0xFFE7FBF2),
                    onTap: () {
                      context.pushNamed(RouteNames.languageSelectionScreen);
                    },
                  ),
                  CommonMenuItem(
                    title: AppLocalizations.of(context)!.theme,
                    icon: AssetsIcons.theme, // Replace with your icon path
                    color: const Color(0xFFECEFF2),
                    onTap: () {},
                    widget: SizedBox(
                      height: 30.h,
                      width: 70.w,
                      child: FittedBox(
                        child: Switch(
                          activeColor: CustomColors.baseColor,
                          activeTrackColor: Theme.of(context).indicatorColor,
                          inactiveTrackColor:
                          CustomColors.baseColor,
                          // inactiveThumbColor: Theme.of(context).disabledColor,
                          inactiveThumbColor: Colors.white,
                          value: isDarkTheme,
                          onChanged: (value) {
                            final newTheme = value ?  DarkTheme.dark : LightTheme.light;
                            themeProvider.saveThemeData(
                                newTheme); // Save the selected theme
                          },
                        ),
                      ),
                    ),
                  ),
                  commonCon.isLogin?
                  CommonMenuItem(
                    title: AppLocalizations.of(context)!.logout,
                    icon: AssetsIcons.logout,
                    color: const Color(0xFFF2EBEB),
                    onTap: () {
                      CommonFunctions.logOut();
                      cartCon.clearCart();
                      ordersController.orderDataClear();
                      commonCon.setLogin(false);
                    },
                  ) : CommonMenuItem(
                    title: AppLocalizations.of(context)!.goToSignIn,
                    icon: AssetsIcons.login, // Replace with your icon path
                    color: const Color(0xFFE6EEF1),
                    onTap: () {
                      context.pushNamed(RouteNames.loginScreen);
                    },
                  ),
                ],
              ),
            ),
          ],
        )
      );
  }
  Future<void> _storeEmail(String email) async {
    // Save email to shared preferences
    await UserSharedPreference.putValue(
      SharedPreferenceHelper.email,
      email,
    );
  }
}



