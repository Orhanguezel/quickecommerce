import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/controller/provider/home_screen_provider.dart';
import 'package:quick_ecommerce/router/route_name.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_fonfirmation_dialog.dart';
import 'package:quick_ecommerce/screens/home/home.dart';
import '../../config/colors.dart';
import '../../config/icons.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/text_styles.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/refresh_token/refresh_token_bloc.dart';
import '../../controller/provider/cart_controler.dart';
import '../../controller/provider/common_provider.dart';
import '../../controller/provider/my_orders_controller.dart';
import '../../controller/provider/filter_controller.dart';
import '../../l10n/app_localizations.dart';
import '../auth_screens/login_confirmation_dailog.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/responsive_widget.dart';
import '../web_ui/desktop_tabs_home.dart';
import '../home/all_product_screen.dart';
import '../my_card/my_card_screen.dart';
import '../my_orders/my_orders_screen.dart';
import '../profile/profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _pages = [
    const Home(),
    const AllProductScreen(),
    const MyCardScreen(),
    const MyOrdersScreen(),
    const ProfileScreen(),
  ];
  late final RefreshTokenBloc _refreshTokenBloc;
  String _token = '', _emailSettingsOn = "";
  bool _emailVerified = false;
  @override
  void initState() {
    getUserRout();
    _refreshTokenBloc = context.read<RefreshTokenBloc>();
    super.initState();
  }

  getUserRout() async {
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
    checkLogin();
  }

  checkLogin() {
    if (_token.isNotEmpty) {
      var commonCon = Provider.of<CommonProvider>(context, listen: false);
      commonCon.setLogin(true);
    }
  }

  Future _exitDialog(context) {
    return showDialog(
        context: context,
        builder: (context) {
          return CommonConfirmationDialog(
              title: "",
              message: AppLocalizations.of(context)!.areYouSureExitTheApp,
              onConfirm: () {
                Future.delayed(const Duration(milliseconds: 200), () {
                  SystemNavigator.pop();
                });
              });
        });
  }

  @override
  Widget build(BuildContext context) {
    var homeCon = Provider.of<HomeScreenProvider>(context, listen: true);
    var commonCon = Provider.of<CommonProvider>(context, listen: true);
    var cardCon = Provider.of<CartProvider>(context, listen: true);
    var filterCon = Provider.of<FilterController>(context);
    final ordersController = Provider.of<MyOrdersController>(context);
    return ResponsiveWidget(
      mobile: PopScope(
        canPop: false,
        onPopInvokedWithResult: (didPop, result) {
          if (didPop) return;
          if (homeCon.currentIndexHomePage == 0) {
            _exitDialog(context);
          } else {
            homeCon.setCurrentIndexHomePage(0);
          }
        },
        child: Scaffold(
          body: _pages[homeCon.currentIndexHomePage],
          bottomNavigationBar: Theme(
            data: Theme.of(context).copyWith(
              canvasColor: const Color(0xFFEAEAEA),
              primaryColor: Colors.white,
              textTheme: Theme.of(context).textTheme.copyWith(
                bodyLarge: CustomTextStyles.boldText(14.sp),
              ),
            ),
            child: Container(
              decoration: const BoxDecoration(
                boxShadow: [
                  BoxShadow(
                    color: Color(0xFFC7C4C4),
                    blurRadius: 10.0,
                    spreadRadius: 0.5,
                    offset: Offset(2, 1),
                  ),
                ],
              ),
              child: BottomNavigationBar(
                iconSize: 24.sp,
                elevation: 50,
                type: BottomNavigationBarType.fixed,
                showUnselectedLabels: true,
                backgroundColor: const Color(0xFFFFFFFF),
                selectedFontSize: 14.sp,
                selectedLabelStyle: CustomTextStyles.boldText(12.sp,
                    color: CustomColors.baseColor),
                selectedItemColor: CustomColors.baseColor,
                unselectedItemColor: const Color(0xFF627D98),
                onTap: (index) {
                  getUserRout();
                  if (homeCon.currentIndexHomePage == 1) {
                    filterCon.resetFilters();
                  }
                  if (index == 0 || index == 1 || index == 2 || index == 4) {
                    homeCon.setCurrentIndexHomePage(index);
                  } else if (commonCon.isLogin) {
                    CommonFunctions.checkTokenAndProceeds(
                      refreshTokenBloc: _refreshTokenBloc,
                      onProceed: () async {
                        if (index == 3 && _emailSettingsOn == "on") {
                          if (_emailVerified) {
                            homeCon.setCurrentIndexHomePage(index);
                          } else {
                            showDialog(
                              context: context,
                              builder: (context) => CommonConfirmationDialog(
                                title: AppLocalizations.of(context)!
                                    .emailVerificationRequired,
                                message:
                                '${AppLocalizations.of(context)!.toAccessYour} ${AppLocalizations.of(context)!.myOrder},${AppLocalizations.of(context)!.pleaseVerifyYourEmail}',
                                onConfirm: () {
                                  context.pushNamed(RouteNames.emailVerification);
                                },
                              ),
                            );
                          }
                        } else {
                          homeCon.setCurrentIndexHomePage(index);
                        }
                      },
                      onLogout: () async {
                        await context.pushNamed(RouteNames.loginScreen);
                      },
                    );

                    if (homeCon.currentIndexHomePage == 3) {
                      if (ordersController.allOrders.isNotEmpty) {
                        ordersController.orderDataClear();
                      }
                    }
                  } else {
                    showDialog(
                      context: context,
                      builder: (BuildContext context) {
                        return const ConfirmationDialog();
                      },
                    );
                  }
                },
                currentIndex: homeCon.currentIndexHomePage,

                /// As the items will be dynamic so
                /// we have to add pages on a list
                /// and provide items a list
                items: [
                  BottomNavigationBarItem(
                    icon: Image.asset(
                      AssetsIcons.home,
                      height: 25.h,
                      width: 25.w,
                      color: homeCon.currentIndexHomePage == 0
                          ? CustomColors.baseColor
                          : Colors.grey,
                      fit: BoxFit.contain,
                    ),
                    label: AppLocalizations.of(context)!.home,
                  ),
                  BottomNavigationBarItem(
                    icon: Image.asset(
                      AssetsIcons.product,
                      height: 25.h,
                      width: 25.w,
                      color: homeCon.currentIndexHomePage == 1
                          ? CustomColors.baseColor
                          : Colors.grey,
                      fit: BoxFit.contain,
                    ),
                    label: AppLocalizations.of(context)!.products,
                  ),
                  BottomNavigationBarItem(
                    icon: Stack(
                      clipBehavior: Clip.none,
                      children: [
                        Image.asset(
                          AssetsIcons.cart,
                          height: 25.h,
                          width: 25.w,
                          color: homeCon.currentIndexHomePage == 2
                              ? CustomColors.baseColor
                              : Colors.grey,
                          fit: BoxFit.contain,
                        ),
                        Positioned(
                          right:
                          -4.0, // Position badge to the top-right of the icon
                          top: -1.0,
                          child: Container(
                            padding: const EdgeInsets.all(4.0),
                            decoration: const BoxDecoration(
                              color: Colors.red, // Badge background color
                              shape: BoxShape.circle,
                            ),
                            constraints: const BoxConstraints(
                              minWidth: 16.0,
                              minHeight: 16.0, // Badge size
                            ),
                            child: Center(
                              child: Text(
                                cardCon.cartItems.length.toString(),
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 10.0.sp,
                                  fontWeight: FontWeight.bold,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    label: AppLocalizations.of(context)!.myCart,
                  ),
                  BottomNavigationBarItem(
                    icon: Image.asset(
                      AssetsIcons.orders,
                      height: 25.h,
                      width: 25.w,
                      color: homeCon.currentIndexHomePage == 3
                          ? CustomColors.baseColor
                          : Colors.grey,
                      fit: BoxFit.contain,
                    ),
                    label: AppLocalizations.of(context)!.myOrder,
                  ),
                  BottomNavigationBarItem(
                    icon: Image.asset(
                      AssetsIcons.person,
                      height: 25.h,
                      width: 25.w,
                      color: homeCon.currentIndexHomePage == 4
                          ? CustomColors.baseColor
                          : Colors.grey,
                      fit: BoxFit.contain,
                    ),
                    label: AppLocalizations.of(context)!.profile,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      desktop: const DesktopTabsHome(),
    );


  }
}
