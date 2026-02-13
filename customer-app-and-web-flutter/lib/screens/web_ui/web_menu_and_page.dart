

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/config/icons.dart';
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
import '../../thyme/dark_theme.dart';
import '../../thyme/light_theme.dart';
import '../common_widgets/common_card.dart';
import '../common_widgets/common_fonfirmation_dialog.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/person_avater.dart';
import '../common_widgets/profile_menue_widget.dart';
import '../delivery_address/shipping_address_list.dart';
import '../desktop_settings/support_ticket_screen.dart';
import '../favorites/web_favorites_list.dart';
import '../home/item_card.dart';
import '../language/language.dart';
import '../live_chat/web_live_chat.dart';
import '../my_orders/my_orders_screen.dart';
import '../my_orders/order_details_screen.dart';
import '../my_wallet/my_wallet.dart';
import '../notification/notification_screen.dart';
import '../profile/profile_edite.dart';
import '../settings/contact_us.dart';
import '../settings/privacy_policy.dart';
import '../settings/settings_web.dart';
import '../settings/terms_and_condition.dart';

class MenuAndPage extends StatefulWidget {
  const MenuAndPage({super.key});

  @override
  State<MenuAndPage> createState() => _MenuAndPageState();
}

class _MenuAndPageState extends State<MenuAndPage> {
  late final ProfileBloc _profileBloc;
  late final RefreshTokenBloc _refreshTokenBloc;
  String _token = '',_emailSettingsOn="";
  String firstName= '',lastName= '',phone= '',countryCode= '',birthday= '';
  bool _emailVerified=false,isLoadFirst=true;
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
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  void checkEmailVerifiedForWeb(String title, String menuName)async {
    final homeCon = Provider.of<HomeScreenProvider>(context,listen: false);
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
        homeCon.setMenuName(menuName);
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
      homeCon.setMenuName(menuName);
    }
  }
  @override
  Widget build(BuildContext context) {
    final homeCon = Provider.of<HomeScreenProvider>(context);
    double screenWidth = MediaQuery.of(context).size.width;
    return Scaffold(
      key: _scaffoldKey,
      drawer:  Drawer(
        elevation: 0,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.zero,
        ),
        child: menu(),
      ),
      body: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          screenWidth > 750 ?
          SizedBox(
            width:300,
            child: menu(),
          )
              :IconButton(
              onPressed: (){
                _scaffoldKey.currentState?.openDrawer();
              },
              icon: const Icon(Icons.menu,color: CustomColors.baseColor,)
          ),
          Expanded(
            flex: 4,
              child: homeCon.menuName=='TermsAndConditions'?
              const TermsAndCondition()
                  :homeCon.menuName=='PrivacyPolicy'?
                   const PrivacyPolicy()
                  :homeCon.menuName=='Language'?
              const LanguageSelectionScreen()
                  :homeCon.menuName=='MyOrder'?
              const MyOrdersScreen()
                  :homeCon.menuName=='OrderDetails'?
               OrderSummaryScreen(orderId:homeCon.orderId,)
                  :homeCon.menuName=='MyWishlist'?
              const WebFavoritesList()
                  :homeCon.menuName=='MyWallet'?
              const MyWallet()
                  :homeCon.menuName=='MyOrder'?
              const MyOrdersScreen()
                  :homeCon.menuName=='MyOrder'?
              const MyOrdersScreen()
                  :homeCon.menuName=='ChatList'?
              const WebLiveChat()
                  : homeCon.menuName=='AddressList'?
              const ShippingAddressList()
                  : homeCon.menuName=='SupportTicket'?
              const SupportTicket()
                  : homeCon.menuName=='Notification'?
              const NotificationScreen()
                  : homeCon.menuName=='Settings'?
              const SettingsWeb()
                  :homeCon.menuName=='Contact'?
              const ContactUs()
                  : homeCon.menuName=='ProfileEdit'?
               ProfileEdite(
                firstName:firstName,
                lastName: lastName,
                phone: phone,
                countryCode:countryCode,
                birthday: birthday,)
                  :Container()
          ),
          const SizedBox(width: 20,)
        ],
      ),
    );
  }
  Widget menu(){
    final homeCon = Provider.of<HomeScreenProvider>(context,listen: false);
    var commonCon = Provider.of<CommonProvider>(context,listen: false);
    final themeProvider = Provider.of<ThemeProvider>(context, listen: false);
    final isDarkTheme = themeProvider.getTheme().brightness == Brightness.dark;
    final ordersController = Provider.of<MyOrdersController>(context,listen: false);
    final cartCon = context.watch<CartProvider>();
    return CommonCard(
      mVertical: 5,
      mHorizontal: 4,
      pLeft: 4,
      pRight: 4,
      widget: ListView(
        children: [
          if(commonCon.isLogin)
            BlocConsumer<ProfileBloc, ProfileState>(
              builder: (context, state) {
                if (state is ProfileLoading) {
                  return const CommonCard(
                      mVertical: 4,
                      mHorizontal: 0,
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
                    WidgetsBinding.instance.addPostFrameCallback((_) {
                      commonCon.setImageId(int.tryParse(data.image??"0")!,data.imageUrl??"");
                      commonCon.setGender(Utils.capitalizeFirstLetter(data.gender));
                      firstName=Utils.formatString(data.firstName);
                      lastName=Utils.formatString( data.lastName);
                      phone=Utils.formatString( data.e164Phone);
                      countryCode=Utils.formatString( data.isoCountryCode??"BD");
                      birthday=Utils.formatString( data.birthDay);
                      if(isLoadFirst&&commonCon.isLogin&&homeCon.menuName.isEmpty){
                        homeCon.setMenuName("ProfileEdit");
                        isLoadFirst=false;
                      }
                      if(data.status=='1'){
                        commonCon.setAccountStatus("active");
                      }else{
                        commonCon.setAccountStatus("deactivate");
                      }

                    });


                    return CommonCard(
                      mVertical: 5,
                      mHorizontal: 2,
                      widget: Row(
                        children: [
                          AvatarWidget(
                            imageUrl:data.imageUrl??"",
                            radius: 40,
                          ),
                          const SizedBox(width: 12),
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
                                            fontSize: 20),
                                      ),
                                    ),

                                    InkWell(
                                      onTap: () {
                                        commonCon.setImageId(int.tryParse(data.image??"0")!,data.imageUrl??"");
                                        commonCon.setGender(Utils.capitalizeFirstLetter(data.gender));
                                        firstName=Utils.formatString(data.firstName);
                                        lastName=Utils.formatString( data.lastName);
                                        phone=Utils.formatString( data.e164Phone);
                                        countryCode=Utils.formatString( data.isoCountryCode??"BD");
                                        birthday=Utils.formatString( data.birthDay);
                                        homeCon.setMenuName("ProfileEdit");
                                      },
                                      child: Image.asset(
                                        AssetsIcons.edit,
                                        height: 20,
                                        width: 20,
                                      ),
                                    )
                                  ],
                                ),
                                const SizedBox(height: 8), // Responsive height
                                Text(
                                  Utils.formatString(data.email),
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyMedium
                                      ?.copyWith(
                                      fontWeight: FontWeight.w400,
                                      fontSize: 12),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  data.phone ?? "",
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyMedium
                                      ?.copyWith(
                                      fontWeight: FontWeight.w400,
                                      fontSize: 12),
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
          if (commonCon.isLogin) ...[
            CommonMenuItem(
              title: AppLocalizations.of(context)!.myOrder,
              icon: AssetsIcons.myOrders,
              color: const Color(0xFFE6EEF1),
              onTap: () {
                if (_emailSettingsOn == "on") {
                  if (_emailVerified) {
                    homeCon.setMenuName("MyOrder");
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
                  homeCon.setMenuName("MyOrder");
                }
              },
            ),
            CommonMenuItem(
              title: AppLocalizations.of(context)!.myWishlist,
              icon: AssetsIcons.wishlist,
              color: const Color(0xFFE6EEF1),
              onTap: () {
                checkEmailVerifiedForWeb(
                    AppLocalizations.of(context)!.myWishlist,
                    "MyWishlist");
              },
            ),
            CommonMenuItem(
              title: AppLocalizations.of(context)!.myWallet,
              icon: AssetsIcons.wallet,
              color: const Color(0xFFECF8F1),
              onTap: () {
                checkEmailVerifiedForWeb(
                    AppLocalizations.of(context)!.myWallet,
                    "MyWallet");
              },
            ),
            CommonMenuItem(
              title: AppLocalizations.of(context)!.chat,
              icon: AssetsIcons.message,
              color: const Color(0xFFE6EEF1),
              onTap: () {
                checkEmailVerifiedForWeb(
                    AppLocalizations.of(context)!.chat,
                    "ChatList");
              },
            ),
            CommonMenuItem(
              title: AppLocalizations.of(context)!.address,
              icon: AssetsIcons.address,
              color: const Color(0xFFEEF6FC),
              onTap: () {
                checkEmailVerifiedForWeb(
                    AppLocalizations.of(context)!.address,
                    'AddressList');
              },
            ),
            CommonMenuItem(
              title: AppLocalizations.of(context)!.supportTicket,
              icon: AssetsIcons
                  .supportTicket,
              color: const Color(0xFFE9F9EE),
              onTap: () {
                checkEmailVerifiedForWeb(
                    AppLocalizations.of(context)!.supportTicket,
                    'SupportTicket');
              },
            ),
            CommonMenuItem(
              title: AppLocalizations.of(context)!.notification,
              icon: AssetsIcons
                  .notification,
              color: const Color(0xFFE7D9D4),
              onTap: () {
                checkEmailVerifiedForWeb(
                    AppLocalizations.of(context)!.notification,
                    'Notification');
              },
            ),
            CommonMenuItem(
              title: AppLocalizations.of(context)!.settings,
              icon: AssetsIcons.settings,
              color: const Color(0xFFECEFE8),
              onTap: () {
                checkEmailVerifiedForWeb(
                    AppLocalizations.of(context)!.settings,
                    "Settings");
              },
            ),
          ],
          CommonMenuItem(
            title: AppLocalizations.of(context)!.termsAndConditions,
            icon: AssetsIcons.tramsCondition,
            color: const Color(0xFFF5FAFF),
            onTap: () {
              homeCon.setMenuName("TermsAndConditions");
            },
          ),
          CommonMenuItem(
            title: AppLocalizations.of(context)!.privacyPolicy,
            icon: AssetsIcons
                .privacyPolicy,
            color: const Color(0xFFF4EDED),
            onTap: () {
              homeCon.setMenuName("PrivacyPolicy");
            },
          ),
          CommonMenuItem(
            title: AppLocalizations.of(context)!.contact,
            icon: AssetsIcons.contact,
            color: const Color(0xFFE6EEF1),
            onTap: () {
              homeCon.setMenuName("Contact");
            },
          ),
          CommonMenuItem(
            title: AppLocalizations.of(context)!.language,
            icon: AssetsIcons.language,
            color: const Color(0xFFE7FBF2),
            onTap: () {
              homeCon.setMenuName("Language");
            },
          ),
          CommonMenuItem(
            title: AppLocalizations.of(context)!.theme,
            icon: AssetsIcons.theme,
            color: const Color(0xFFECEFF2),
            onTap: () {},
            widget: SizedBox(
              height: 30,
              width: 70,
              child: FittedBox(
                child: Switch(
                  activeColor: CustomColors.baseColor,
                  activeTrackColor: Theme.of(context).indicatorColor,
                  inactiveTrackColor:
                  CustomColors.baseColor,
                  inactiveThumbColor: Colors.white,
                  value: isDarkTheme,
                  onChanged: (value) {
                    final newTheme = value ?  DarkTheme.dark : LightTheme.light;
                    themeProvider.saveThemeData(
                        newTheme);
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
              showDialog(
                context: context,
                builder: (context) => CommonConfirmationDialog(
                    title: AppLocalizations.of(context)!.logout,
                    message: AppLocalizations.of(context)!.areYouSureLogOut,
                    onConfirm: (){
                      homeCon.setTabType("Home");
                      CommonFunctions.logOut();
                      cartCon.clearCart();
                      ordersController.orderDataClear();
                      commonCon.setLogin(false);
                    }
                ),
              );
            },
          )
              : CommonMenuItem(
            title: AppLocalizations.of(context)!.goToSignIn,
            icon: AssetsIcons.login,
            color: const Color(0xFFE6EEF1),
            onTap: () {
              homeCon.setTabType("Home");
              context.pushNamed(RouteNames.webLogin);
            },
          ),
        ],
      ),
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
