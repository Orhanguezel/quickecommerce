
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:provider/provider.dart';
import 'package:provider/single_child_widget.dart';

import '../controller/bloc/address_bloc/address_bloc.dart';
import '../controller/bloc/address_list_bloc/address_list_bloc.dart';
import '../controller/bloc/all_product_bloc/all_product_bloc.dart';
import '../controller/bloc/banner_bloc/banner_bloc.dart';
import '../controller/bloc/best_saleing_bloc/best_saleing_bloc.dart';
import '../controller/bloc/brand_bloc/brand_bloc.dart';
import '../controller/bloc/cancel_order_bloc/cancel_order_bloc.dart';
import '../controller/bloc/categories_bloc/categories_bloc.dart';
import '../controller/bloc/chat_details_bloc/chat_details_bloc.dart';
import '../controller/bloc/chat_list_bloc/chat_list_bloc.dart';
import '../controller/bloc/contact_bloc/contact_bloc.dart';
import '../controller/bloc/coupon_bloc/coupon_bloc.dart';
import '../controller/bloc/currency_bloc/currency_bloc.dart';
import '../controller/bloc/currency_list_bloc/currency_list_bloc.dart';
import '../controller/bloc/dashboard_bloc/dashboard_bloc.dart';
import '../controller/bloc/delivery_charge_bloc/delivery_charge_bloc.dart';
import '../controller/bloc/email_verification/email_verification_bloc.dart';
import '../controller/bloc/extra_charge_bloc/extra_charge_bloc.dart';
import '../controller/bloc/favorite_add_bloc/favorite_add_bloc.dart';
import '../controller/bloc/favorites_bloc/favorites_bloc.dart';
import '../controller/bloc/featured_product_bloc/featured_product_bloc.dart';
import '../controller/bloc/flash_deal_bloc/flash_deal_bloc.dart';
import '../controller/bloc/flash_deal_product_bloc/flash_deal_product_bloc.dart';
import '../controller/bloc/general_info_bloc/general_info_bloc.dart';
import '../controller/bloc/get_messsage_bloc/get_message_bloc.dart';
import '../controller/bloc/h_mac_key_generate_bloc/hmac_generate_bloc.dart';
import '../controller/bloc/home_title_bloc/home_title_bloc.dart';
import '../controller/bloc/login_bloc/login_bloc.dart';
import '../controller/bloc/maintenence_settings_bloc/maintenance_settings_bloc.dart';
import '../controller/bloc/message_send_bloc/message_send_bloc.dart';
import '../controller/bloc/new_arrivals_bloc/new_arrival_bloc.dart';
import '../controller/bloc/notification_bloc/notificatioon_bloc.dart';
import '../controller/bloc/order_details_bloc/order_details_bloc.dart';
import '../controller/bloc/order_list_bloc/order_list_bloc.dart';
import '../controller/bloc/payment_gateways_bloc/payment_gateways_bloc.dart';
import '../controller/bloc/payment_status_update_bloc/payment_status_update_bloc.dart';
import '../controller/bloc/place_order_bloc/place_order_bloc.dart';
import '../controller/bloc/policy_bloc/policy_bloc.dart';
import '../controller/bloc/popular_product_bloc/popular_product_bloc.dart';
import '../controller/bloc/product_details_bloc/product_details_bloc.dart';
import '../controller/bloc/product_suggestion_bloc/product_suggestion_bloc.dart';
import '../controller/bloc/profile_bloc/profile_bloc.dart';
import '../controller/bloc/profile_image_upload_bloc/profile_image_upload_bloc.dart';
import '../controller/bloc/question_bloc/question_bloc.dart';
import '../controller/bloc/refresh_token/refresh_token_bloc.dart';
import '../controller/bloc/reset_password/reset_password_bloc.dart';
import '../controller/bloc/save_bloc/save_bloc.dart';
import '../controller/bloc/slider_list_bloc/slider_list_bloc.dart';
import '../controller/bloc/store_dtails_bloc/store_dtails_bloc.dart';
import '../controller/bloc/store_list_bloc/store_list_bloc.dart';
import '../controller/bloc/support_ticket_detail_bloc/support_ticket_detail_bloc.dart';
import '../controller/bloc/support_ticket_list_bloc/support_ticket_list_bloc.dart';
import '../controller/bloc/wallet_bloc/wallet_bloc.dart';
import '../controller/bloc/wallet_transaction_bloc/wallet_transaction_bloc.dart';
import '../controller/provider/all_product_controller.dart';
import '../controller/provider/authentication_provider.dart';
import '../controller/provider/cart_controler.dart';
import '../controller/provider/checkout_controler.dart';
import '../controller/provider/common_provider.dart';
import '../controller/provider/coupon_controller.dart';
import '../controller/provider/currencie_controler.dart';
import '../controller/provider/delivery_address_controller.dart';
import '../controller/provider/filter_controller.dart';
import '../controller/provider/home_screen_provider.dart';
import '../controller/provider/item_details_controler.dart';
import '../controller/provider/message_input_conroller.dart';
import '../controller/provider/my_orders_controller.dart';
import '../controller/provider/notification_controller.dart';
import '../controller/provider/payment_option_controller.dart';
import '../controller/provider/reset_password_provider.dart';
import '../controller/provider/thyme_provider.dart';
import '../data/sirvice/auth_repository.dart';
import '../data/sirvice/common_repository.dart';
import '../data/sirvice/connectivity_rypository.dart';
import '../data/sirvice/product_repository.dart';
import '../data/sirvice/save_repository.dart';
import '../thyme/dark_theme.dart';
import '../thyme/light_theme.dart';

List<SingleChildWidget> getAppProviders(String? theme) {
  return [
    ChangeNotifierProvider(create: (context) => HomeScreenProvider()),
    ChangeNotifierProvider(create: (context) => CouponController()),
    ChangeNotifierProvider(create: (context) => AllProductController()),
    ChangeNotifierProvider(create: (context) => AuthenticationProvider()),
    ChangeNotifierProvider(create: (context) => ResetPasswordCon()),
    ChangeNotifierProvider(create: (context) => CommonProvider()),
    ChangeNotifierProvider(create: (context) => CurrencyController()),
    ChangeNotifierProvider(create: (context) => FilterController()),
    ChangeNotifierProvider(create: (context) => CheckoutController()),
    ChangeNotifierProvider(create: (context) => ItemDetailsProvider()),
    ChangeNotifierProvider(create: (context) => MessageInputProvider()),
    ChangeNotifierProvider(create: (context) => CartProvider()),
    ChangeNotifierProvider(create: (context) => DeliveryAddressController()),
    ChangeNotifierProvider(create: (context) => MyOrdersController()),
    ChangeNotifierProvider(create: (context) => NotificationController()),
    ChangeNotifierProvider(create: (context) => PaymentOptionCon()),
    ChangeNotifierProvider(
        create: (context) =>
            ThemeProvider(theme == 'dark' ?  DarkTheme.dark : LightTheme.light)),
    //========== connectivity repository used =========
    //========== for connection checking ==============
    //========== business logics ======================
    //-------------------------------------------------
    BlocProvider(
      create: (context) => LoginBloc(
        connectivityRepository: ConnectivityRepository(),
        authRepository: AuthRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => RefreshTokenBloc(
        connectivityRepository: ConnectivityRepository(),
        authRepository: AuthRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => ResetPassBloc(
        connectivityRepository: ConnectivityRepository(),
        authRepository: AuthRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => EmailVerificationBloc(
        connectivityRepository: ConnectivityRepository(),
        authRepository: AuthRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => SaveBloc(
        connectivityRepository: ConnectivityRepository(),
        saveRepository: SaveRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => PlaceOrderBloc(
        connectivityRepository: ConnectivityRepository(),
        saveRepository: SaveRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => CancelOrderBloc(
        connectivityRepository: ConnectivityRepository(),
        saveRepository: SaveRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => MessageSendBloc(
        connectivityRepository: ConnectivityRepository(),
        saveRepository: SaveRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => AddressBloc(
        connectivityRepository: ConnectivityRepository(),
        saveRepository: SaveRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => ProfileImageUploadBloc(
        connectivityRepository: ConnectivityRepository(),
        saveRepository: SaveRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => FavoriteAddBloc(
        connectivityRepository: ConnectivityRepository(),
        saveRepository: SaveRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => PaymentStatusUpdateBloc(
        connectivityRepository: ConnectivityRepository(),
        saveRepository: SaveRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => CategoriesBloc(
        connectivityRepository: ConnectivityRepository(),
        productRepository: ProductRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => AllProductBloc(
        connectivityRepository: ConnectivityRepository(),
        productRepository: ProductRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => ProductDetailsBloc(
        connectivityRepository: ConnectivityRepository(),
        productRepository: ProductRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => MaintenanceSettingsBloc(
        connectivityRepository: ConnectivityRepository(),
        productRepository: ProductRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => NewArrivalBloc(
        connectivityRepository: ConnectivityRepository(),
        productRepository: ProductRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => BannerBloc(
        connectivityRepository: ConnectivityRepository(),
        productRepository: ProductRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => BestSaleBloc(
        connectivityRepository: ConnectivityRepository(),
        productRepository: ProductRepository(),
      ),
    ),

    BlocProvider(
      create: (context) => FavoritesBloc(
        connectivityRepository: ConnectivityRepository(),
        productRepository: ProductRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => BrandBloc(
        connectivityRepository: ConnectivityRepository(),
        productRepository: ProductRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => SliderListBloc(
        connectivityRepository: ConnectivityRepository(),
        productRepository: ProductRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => AddressListBloc(
        connectivityRepository: ConnectivityRepository(),
        commonRepository: CommonRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => HMacGenerateBloc(
        connectivityRepository: ConnectivityRepository(),
        commonRepository: CommonRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => ChatDetailsBloc(
        connectivityRepository: ConnectivityRepository(),
        commonRepository: CommonRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => ChatListBloc(
        connectivityRepository: ConnectivityRepository(),
        commonRepository: CommonRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => ExtraChargeBloc(
        connectivityRepository: ConnectivityRepository(),
        commonRepository: CommonRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => QuestionBloc(
        connectivityRepository: ConnectivityRepository(),
        commonRepository: CommonRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => GeneralInfoBloc(
        connectivityRepository: ConnectivityRepository(),
        commonRepository: CommonRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => HomeTitleBloc(
        connectivityRepository: ConnectivityRepository(),
        commonRepository: CommonRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => ProfileBloc(
        connectivityRepository: ConnectivityRepository(),
        commonRepository: CommonRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => SupportTicketListBloc(
        connectivityRepository: ConnectivityRepository(),
        commonRepository: CommonRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => StoreDetailsBloc(
        connectivityRepository: ConnectivityRepository(),
        commonRepository: CommonRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => SupportTicketDetailBloc(
        connectivityRepository: ConnectivityRepository(),
        commonRepository: CommonRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => GetMessageBloc(
        connectivityRepository: ConnectivityRepository(),
        commonRepository: CommonRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => WalletBloc(
        connectivityRepository: ConnectivityRepository(),
        commonRepository: CommonRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => WalletTransactionBloc(
        connectivityRepository: ConnectivityRepository(),
        commonRepository: CommonRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => PaymentGatewaysBloc(
        connectivityRepository: ConnectivityRepository(),
        commonRepository: CommonRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => PopularProductBloc(
        connectivityRepository: ConnectivityRepository(),
        productRepository: ProductRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => FeaturedProductBloc(
        connectivityRepository: ConnectivityRepository(),
        productRepository: ProductRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => FlashDealBloc(
        connectivityRepository: ConnectivityRepository(),
        productRepository: ProductRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => FlashDealProductBloc(
        connectivityRepository: ConnectivityRepository(),
        productRepository: ProductRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => StoreListBloc(
        connectivityRepository: ConnectivityRepository(),
        productRepository: ProductRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => PolicyBloc(
        connectivityRepository: ConnectivityRepository(),
        commonRepository: CommonRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => CurrencyBloc(
        connectivityRepository: ConnectivityRepository(),
        commonRepository: CommonRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => CurrencyListBloc(
        connectivityRepository: ConnectivityRepository(),
        commonRepository: CommonRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => CouponBloc(
        connectivityRepository: ConnectivityRepository(),
        commonRepository: CommonRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => OrderListBloc(
        connectivityRepository: ConnectivityRepository(),
        commonRepository: CommonRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => OrderDetailsBloc(
        connectivityRepository: ConnectivityRepository(),
        commonRepository: CommonRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => DeliveryChargeBloc(
        connectivityRepository: ConnectivityRepository(),
        commonRepository: CommonRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => ContactBloc(
        connectivityRepository: ConnectivityRepository(),
        commonRepository: CommonRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => ProductSuggestionBloc(
        connectivityRepository: ConnectivityRepository(),
        productRepository: ProductRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => DeliveryChargeBloc(
        connectivityRepository: ConnectivityRepository(),
        commonRepository: CommonRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => NotificationBloc(
        connectivityRepository: ConnectivityRepository(),
        commonRepository: CommonRepository(),
      ),
    ),
    BlocProvider(
      create: (context) => DashboardBloc(
        connectivityRepository: ConnectivityRepository(),
        commonRepository: CommonRepository(),
      ),
    ),
  ];
}