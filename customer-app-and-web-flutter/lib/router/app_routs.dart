// ignore_for_file: file_names

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:quick_ecommerce/router/route_name.dart';
import 'package:quick_ecommerce/screens/auth_screens/email_verification.dart';
import 'package:quick_ecommerce/screens/live_chat/user_list.dart';
import 'package:quick_ecommerce/screens/my_wallet/diposit_screen.dart';

import '../data/data_model/order_details_model.dart';
import '../screens/auth_screens/forget_password_screen.dart';
import '../screens/auth_screens/login_screen.dart';
import '../screens/auth_screens/set_password_screen.dart';
import '../screens/auth_screens/sinup_screen.dart';
import '../screens/auth_screens/splash_screen.dart';
import '../screens/auth_screens/successfully.dart';
import '../screens/web_ui/desktop_tabs_home.dart';
import '../screens/desktop_item_details/item_details_screen.dart';
import '../screens/favorites/favorites_list.dart';
import '../screens/delivery_address/add_delivery_address.dart';
import '../screens/checkout/checkout_screen.dart';
import '../screens/item_details/item_details_screen.dart';
import '../screens/delivery_address/shipping_address_list.dart';
import '../screens/main_screens/home_screen.dart';
import '../screens/my_orders/track_order_screen.dart';
import '../screens/notification/notification_screen.dart';
import '../screens/profile/change_email.dart';
import '../screens/language/language.dart';
import '../screens/profile/password_change.dart';
import '../screens/profile/profile_edite.dart';
import '../screens/settings/contact_us.dart';
import '../screens/settings/deactivate_account.dart';
import '../screens/my_wallet/my_wallet.dart';
import '../screens/settings/privacy_policy.dart';
import '../screens/settings/settings_screens.dart';
import '../screens/settings/support_ticket_add.dart';
import '../screens/settings/support_ticket_screen.dart';
import '../screens/settings/terms_and_condition.dart';
import '../screens/store_info/sore_details_screen.dart';
import '../screens/store_info/sore_details_web.dart';
import '../screens/web_ui/web_auth/web_login.dart';
import '../screens/web_ui/web_menu_and_page.dart';

class AppRoutes {
  static final router = GoRouter(initialLocation: '/', routes: [
    //========= initialized all routes here =========
    //-----------------------------------------------

    GoRoute(
      name: RouteNames.splashPage,
      path: '/',
      pageBuilder: (context, state) {
        return MaterialPage(
          key: state.pageKey,
          child: const SplashScreen(),
        );
      },
    ),

    GoRoute(
      name: RouteNames.registration,
      path: '/registration',
      pageBuilder: (context, state) {
        return MaterialPage(
          key: state.pageKey,
          child: const SinUpScreen(),
        );
      },
    ),

    GoRoute(
      name: RouteNames.loginScreen,
      path: '/loginPage',
      pageBuilder: (context, state) {
        return MaterialPage(
          key: state.pageKey,
          child: const LoginScreen(),
        );
      },
    ),
    GoRoute(
      name: RouteNames.webLogin,
      path: '/webLogin',
      pageBuilder: (context, state) {
        return MaterialPage(
          key: state.pageKey,
          child: const WebLogin(),
        );
      },
    ),
    GoRoute(
      name: RouteNames.emailVerification,
      path: '/email_verification',
      pageBuilder: (context, state) {
        return MaterialPage(
          key: state.pageKey,
          child: const EmailVerification(),
        );
      },
    ),
    GoRoute(
      name: RouteNames.addDeliveryAddress,
      path: '/addDeliveryAddress',
      builder: (context, state) {
        // Safely cast `extra` as a Map or default to an empty map
        final extraParams = state.extra as Map<String, dynamic>? ?? {};

        // Retrieve optional parameters with default values
        final String id = extraParams['id'] ?? '';
        final String title = extraParams['title'] ?? '';
        final String type = extraParams['type'] ?? '';
        final String email = extraParams['email'] ?? '';
        final String contactNumber = extraParams['contactNumber'] ?? '';
        final String countryCode = extraParams['country_code'] ?? '';
        final String address = extraParams['address'] ?? '';
        final String lat = extraParams['lat'] ?? '';
        final String long = extraParams['long'] ?? '';
        final int area = extraParams['area'] ?? 0;
        final String road = extraParams['road'] ?? '';
        final String house = extraParams['house'] ?? '';
        final String floor = extraParams['floor'] ?? '';
        final String postalCode = extraParams['postalCode'] ?? '';
        final bool isDefault = extraParams['isDefault'] ?? false;
        final String status = extraParams['status'] ?? '';

        // Pass the retrieved values to the `AddDeliveryAddress` widget
        return AddDeliveryAddress(
          id: id,
          title: title,
          type: type,
          email: email,
          contactNumber: contactNumber,
          countryCode: countryCode,
          address: address,
          lat: lat,
          long: long,
          area: area,
          road: road,
          house: house,
          floor: floor,
          postalCode: postalCode,
          isDefault: isDefault,
          status: status,
        );
      },
    ),


    GoRoute(
      name: RouteNames.supportTicketAdd,
      path: '/supportTicketAdd',
      builder: (context, state) {
        final extraParams = state.extra as Map<String, dynamic>? ?? {};
        final String id = extraParams['id'] ?? '';
        final String title = extraParams['title'] ?? '';
        final String subject = extraParams['subject'] ?? '';
        final bool edit = extraParams['edit']??false;
        return SupportTicketAdd(
          id:id ,
          title: title,
          subject:subject ,
          edit: edit,
        );
      },
    ),
    GoRoute(
      name: RouteNames.changeEmail,
      path: '/changeEmail',
      pageBuilder: (context, state) {
        return MaterialPage(
          key: state.pageKey,
          child: const ChangeEmail(),
        );
      },
    ),
    GoRoute(
      name: RouteNames.chatListPage,
      path: '/chatListPage',
      pageBuilder: (context, state) {
        return MaterialPage(
          key: state.pageKey,
          child: const ChatListPage(),
        );
      },
    ),
    GoRoute(
      name: RouteNames.passwordChange,
      path: '/passwordChange',
      pageBuilder: (context, state) {
        return MaterialPage(
          key: state.pageKey,
          child: const PasswordChange(),
        );
      },
    ),
    GoRoute(
      name: RouteNames.deactivateAccount,
      path: '/deactivateAccount',
      pageBuilder: (context, state) {
        return MaterialPage(
          key: state.pageKey,
          child: const DeactivateAccount(),
        );
      },
    ),
    GoRoute(
      name: RouteNames.supportTicketListScreen,
      path: '/supportTicketListScreen',
      pageBuilder: (context, state) {
        return MaterialPage(
          key: state.pageKey,
          child: const SupportTicketListScreen(),
        );
      },
    ),

    GoRoute(
      name: RouteNames.checkoutScreens,
      path: '/checkoutScreens',
      builder: (context, state) {
        final extraParams =
        state.extra as Map<String, dynamic>;
        final List<int> productIds = (extraParams['product_ids'] as List<dynamic>)
            .map((e) => e as int)
            .toList();
        return CheckoutScreens(
          productIds: productIds,

        );
      },
    ),

    GoRoute(
      name: RouteNames.homeScreen,
      path: '/homeScreen',
      pageBuilder: (context, state) {
        return MaterialPage(
          key: state.pageKey,
          child: const HomeScreen(),
        );
      },
    ),
    GoRoute(
      name: RouteNames.webHomeScreen,
      path: '/webHomeScreen',
      pageBuilder: (context, state) {
        return MaterialPage(
          key: state.pageKey,
          child: const DesktopTabsHome(),
        );
      },
    ),
    GoRoute(
      name: RouteNames.menuAndPage,
      path: '/menuAndPage',
      pageBuilder: (context, state) {
        return MaterialPage(
          key: state.pageKey,
          child: const MenuAndPage(),
        );
      },
    ),
    GoRoute(
      name: RouteNames.forgetPassword,
      path: '/forgetPassword',
      pageBuilder: (context, state) {
        return MaterialPage(
          key: state.pageKey,
          child: const ForgetPasswordScreen(),
        );
      },
    ),
    GoRoute(
      name: RouteNames.successfullyScreen,
      path: '/successfullyScreen',
      pageBuilder: (context, state) {
        return MaterialPage(
          key: state.pageKey,
          child: const SuccessfullyScreen(),
        );
      },
    ),
    GoRoute(
      name: RouteNames.favoritesListScreen,
      path: '/favoritesListScreen',
      pageBuilder: (context, state) {
        return MaterialPage(
          key: state.pageKey,
          child: const FavoritesListScreen(),
        );
      },
    ),
    GoRoute(
      name: RouteNames.myWallet,
      path: '/myWallet',
      pageBuilder: (context, state) {
        return MaterialPage(
          key: state.pageKey,
          child: const MyWallet(),
        );
      },
    ),
    GoRoute(
      name: RouteNames.notificationScreen,
      path: '/notificationScreen',
      pageBuilder: (context, state) {
        return MaterialPage(
          key: state.pageKey,
          child: const NotificationScreen(),
        );
      },
    ),
    GoRoute(
      name: RouteNames.settingsScreens,
      path: '/settingsScreens',
      pageBuilder: (context, state) {
        return MaterialPage(
          key: state.pageKey,
          child: const SettingsScreens(),
        );
      },
    ),
    GoRoute(
      name: RouteNames.languageSelectionScreen,
      path: '/languageSelectionScreen',
      pageBuilder: (context, state) {
        return MaterialPage(
          key: state.pageKey,
          child: const LanguageSelectionScreen(),
        );
      },
    ),
    GoRoute(
      name: RouteNames.termsAndCondition,
      path: '/termsAndCondition',
      pageBuilder: (context, state) {
        return MaterialPage(
          key: state.pageKey,
          child: const TermsAndCondition(),
        );
      },
    ),
    GoRoute(
      name: RouteNames.privacyPolicy,
      path: '/privacyPolicy',
      pageBuilder: (context, state) {
        return MaterialPage(
          key: state.pageKey,
          child: const PrivacyPolicy(),
        );
      },
    ),
    GoRoute(
      name: RouteNames.contactUs,
      path: '/contactUs',
      pageBuilder: (context, state) {
        return MaterialPage(
          key: state.pageKey,
          child: const ContactUs(),
        );
      },
    ),


    GoRoute(
      name: RouteNames.storeDetailScreen,
      path: '/storeDetailScreen',
      builder: (context, state) {
        // Ensure state.extra is not null and is a Map<String, dynamic>
        final extraParams = state.extra as Map<String, dynamic>? ?? {};
        // Safely extract the slug
        final String slug = extraParams['slug'] as String? ?? '';
        return StoreDetailScreen(
          slug: slug,
        );
      },
    ),
    GoRoute(
      name: RouteNames.storeDetailWeb,
      path: '/storeDetailWeb',
      builder: (context, state) {
        // Ensure state.extra is not null and is a Map<String, dynamic>
        final extraParams = state.extra as Map<String, dynamic>? ?? {};
        // Safely extract the slug
        final String slug = extraParams['slug'] as String? ?? '';
        return StoreDetailWeb(
          slug: slug,
        );
      },
    ),
    GoRoute(
      name: RouteNames.shippingAddressList,
      path: '/shippingAddressList',
      pageBuilder: (context, state) {
        return MaterialPage(
          key: state.pageKey,
          child: const ShippingAddressList(),
        );
      },
    ),
    GoRoute(
      name: RouteNames.trackOrderScreen,
      path: '/trackOrderScreen',
      builder: (context, state) {
        final extraParams =
        state.extra as Map<String, dynamic>;
        final String orderId = extraParams['order_id']!;
        final String orderStatus = extraParams['order_status']!;
        final double storeLat = extraParams['store_lat']!;
        final double storeLong = extraParams['store_long']!;
        final List<OrderTracking> orderTracking = extraParams['order_tracking']!;
        return TrackOrderScreen(
          orderId: orderId,
          orderStatus: orderStatus,
          storeLat:storeLat ,
          storeLong: storeLong,
          orderTracking:orderTracking,
        );
      },
    ),
    GoRoute(
      name: RouteNames.profileEdite,
      path: '/profileEdite',
      builder: (context, state) {
        final extraParams =
        state.extra as Map<String, dynamic>; // Cast extra as a Map
        final String firstName = extraParams['first_name']!;
        final String lastName = extraParams['last_name']!;
        final String phone = extraParams['phone']!;
        final String countryCode = extraParams['country_code']!;
        final String birthday = extraParams['birthday']!;
        return ProfileEdite(
          firstName: firstName,
          lastName: lastName,
          phone: phone,
          countryCode: countryCode,
          birthday:birthday,
        );
      },
    ),
    GoRoute(
      name: RouteNames.productDisplay,
      path: '/productDisplay',
      builder: (context, state) {
        final extraParams =
        state.extra as Map<String, dynamic>; // Cast extra as a Map
        final String slug = extraParams['slug']!;
        return ProductDisplay(
          slug: slug,

        );
      },
    ),
    GoRoute(
      name: RouteNames.desktopProductDisplay,
      path: '/desktopProductDisplay',
      builder: (context, state) {
        final extraParams =
        state.extra as Map<String, dynamic>; // Cast extra as a Map
        final String slug = extraParams['slug']!;
        return DesktopProductDisplay(
          slug: slug,

        );
      },
    ),
       GoRoute(
          name: RouteNames.depositScreen,
          path: '/depositScreen',
          builder: (context, state) {
                    final extraParams =
                        state.extra as Map<String, dynamic>; // Cast extra as a Map
                    final int walletId = extraParams['wallet_id']!;
                    final String maxDepositAmount = extraParams['max_deposit_amount']!;
            return DepositScreen(
              walletId: walletId,
              maxDepositAmount: maxDepositAmount,

            );
          },
        ),
    GoRoute(
      name: RouteNames.setPasswordScreen,
      path: '/setPasswordScreen',
      builder: (context, state) {
        final extraParams =
            state.extra as Map<String, dynamic>; // Cast extra as a Map
        final email = extraParams['email']!;
        final token = extraParams['token']!;
        return SetPasswordScreen(
          email: email,
          token: token,
        );
      },
    ),
  ]);
}
