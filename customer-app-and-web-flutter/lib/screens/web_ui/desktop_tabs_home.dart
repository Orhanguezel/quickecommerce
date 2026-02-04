import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:provider/provider.dart';
import '../../config/colors.dart';
import '../../config/icons.dart';
import '../../config/images.dart';
import '../../widgets/brand_logo.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/strings.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/all_product_bloc/all_product_bloc.dart';
import '../../controller/bloc/all_product_bloc/all_product_event.dart';
import '../../controller/bloc/currency_bloc/currency_state.dart';
import '../../controller/bloc/currency_list_bloc/currency_list_bloc.dart';
import '../../controller/bloc/currency_list_bloc/currency_list_event.dart';
import '../../controller/bloc/currency_list_bloc/currency_list_state.dart';
import '../../controller/bloc/profile_bloc/profile_bloc.dart';
import '../../controller/bloc/profile_bloc/profile_event.dart';
import '../../controller/bloc/profile_bloc/profile_state.dart';
import '../../controller/provider/all_product_controller.dart';
import '../../controller/provider/cart_controler.dart';
import '../../controller/provider/common_provider.dart';
import '../../controller/provider/currencie_controler.dart';
import '../../controller/provider/delivery_address_controller.dart';
import '../../controller/provider/filter_controller.dart';
import '../../controller/provider/home_screen_provider.dart';
import '../../controller/provider/notification_controller.dart';
import '../../data/data_model/currency_list_model.dart';
import '../../l10n/app_localizations.dart';
import '../auth_screens/email_verification.dart';
import '../checkout/desktop_checkout.dart';
import '../common_widgets/common_card.dart';
import '../common_widgets/common_dropdown.dart';
import '../common_widgets/common_fonfirmation_dialog.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/person_avater.dart';
import '../desktop_common_widgets/common_search_widget.dart';
import '../home/find_location.dart';
import '../my_card/my_card_screen.dart';
import 'web_menu_and_page.dart';
import '../desktop_home/all_product_screen.dart';
import '../desktop_home/desktop_categories_screen.dart';
import '../desktop_home/desktop_home.dart';

class DesktopTabsHome extends StatefulWidget {
  const DesktopTabsHome({super.key});

  @override
  State<DesktopTabsHome> createState() => _DesktopTabsHomeState();
}

class _DesktopTabsHomeState extends State<DesktopTabsHome> {
  late final CurrencyListBloc _currencyListBloc;
  late final AllProductBloc _allProductBloc;
  late final ProfileBloc _profileBloc;
  String _token = '', _emailSettingsOn = "", _currencyCode = '', _language = '', _userLat = '', _userLong = '';
  bool _emailVerified = false;
  final FocusNode focusNode = FocusNode();
  @override
  void initState() {
    _allProductBloc = context.read<AllProductBloc>();
    _currencyListBloc = context.read<CurrencyListBloc>();
    _profileBloc = context.read<ProfileBloc>();
    getUserRout();
    super.initState();
  }

  getUserRout() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    var address = await UserSharedPreference.getValue(
      SharedPreferenceHelper.customerAddress,
    );
    var currencyCode = await UserSharedPreference.getValue(
      SharedPreferenceHelper.currencyCode,
    );
    var emailVeSettings = await UserSharedPreference.getValue(
      SharedPreferenceHelper.emailVerificationSettings,
    );
    var emailVerified = await UserSharedPreference.getBool(
      SharedPreferenceHelper.emailVerified,
    );
    var language = await UserSharedPreference.getValue(
      SharedPreferenceHelper.languageCode,
    );
    var customerLong = await UserSharedPreference.getValue(
      SharedPreferenceHelper.customerLong,
    );
    var customerLat = await UserSharedPreference.getValue(
      SharedPreferenceHelper.customerLat,
    );
    address = await UserSharedPreference.getValue(
            SharedPreferenceHelper.customerAddress) ??
        "";
    getCustomerAddress(address);
    _token = token ?? "";
    _currencyCode = currencyCode ?? "";
    _emailSettingsOn = emailVeSettings ?? "";
    _emailVerified = emailVerified ?? false;
    _language = language ?? "";
    _userLat = customerLat ?? "";
    _userLong = customerLong ?? "";
    checkLogin();
    _currencyListBloc.add(CurrencyList(token: _token));
  }

  checkLogin() {
    var commonCon = Provider.of<CommonProvider>(context, listen: false);
    if (_token.isNotEmpty) {
      commonCon.setLogin(true);
      if (_emailSettingsOn == "on" && _emailVerified) {
        _profileBloc.add(Profile(token: _token));
      }
    }
  }

  putName(String name) async {
    await UserSharedPreference.putValue(
      SharedPreferenceHelper.customerName,
      name,
    );
  }

  getCustomerAddress(String address) {
    Provider.of<DeliveryAddressController>(context, listen: false)
        .setAddress(address);
  }

  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  bool isFirstLoad = true;
  bool isCurrencyLoad = true;
  @override
  Widget build(BuildContext context) {
    final currencyCon = Provider.of<CurrencyController>(context);
    final homeCon = Provider.of<HomeScreenProvider>(context);
    final commonCon = Provider.of<CommonProvider>(context);
    var filterCon = Provider.of<FilterController>(context);
    var dAddressCon = Provider.of<DeliveryAddressController>(context);
    var cardCon = Provider.of<CartProvider>(context);

    var allProduct = Provider.of<AllProductController>(context, listen: false);
    double screenWidth = MediaQuery.of(context).size.width;
    return Scaffold(
      key: _scaffoldKey,
      endDrawer: const Drawer(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.zero,
        ),
        child: MyCardScreen(),
      ),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(60),
        child: AppBar(
          backgroundColor: Colors.white,
          title: Row(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 6,horizontal: 10),
                child: SizedBox(
                  height: 54,
                  width: 90,
                  child: BrandLogo(
                    height: 54,
                    fallbackAsset: Images.darkLogo,
                  ),
                ),
              ),
              screenWidth>550? Expanded(
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: SizedBox(
                    width: 300,
                    child: InkWell(
                      onTap: () {
                        _openLocationSearch(context);
                      },
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          const SizedBox(
                            width: 10,
                          ),
                          Image.asset(
                            AssetsIcons.location,
                            height: 16,
                            width: 16,
                            color: const Color(0xFF242426),
                            fit: BoxFit.contain,
                          ),
                          const SizedBox(
                            width: 4,
                          ),
                          Text(
                            "${AppLocalizations.of(context)!.location} :",
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Colors.black,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(
                            width: 6,
                          ),
                          dAddressCon.selectedAddress.isEmpty
                              ? Text(
                            AppLocalizations.of(context)!.getLocation,
                            overflow: TextOverflow.ellipsis,
                            style: Theme.of(context)
                                .textTheme
                                .displayLarge
                                ?.copyWith(
                                color: const Color(0xFF4F547B),
                                fontWeight: FontWeight.w400,
                                fontSize: 16),
                          )
                              : Flexible(
                            child: AutoScrollText(
                              text: dAddressCon.selectedAddress,
                              style: Theme.of(context)
                                  .textTheme
                                  .headlineSmall
                                  ?.copyWith(
                                  color: const Color(0xFF4F547B),
                                  fontWeight: FontWeight.w400,
                                  fontSize: 16),
                            ),
                          ),
                          const Icon(Icons.keyboard_arrow_down),
                          const SizedBox(
                            width: 10,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ):const SizedBox(),
              SizedBox(
                width: 150,
                child: CommonDropdownObject<CurrencyData>(
                  dList: currencyCon.currencies,
                  dropdownValue: currencyCon.currencyLabel,
                  title: currencyCon.currencyLabel,
                  getLabel: (item) => item.label,
                  getValue: (item) => item.value.toString(),
                  onChanged: (value) async {
                    final selected = currencyCon.currencies.firstWhere(
                          (e) => e.value.toString() == value.toString(),
                    );
                    // Now you can access everything
                    String label = selected.label;
                    String code = selected.value.toString();
                    String symbol = selected.symbol;
                    double rate = Utils.formatDouble(selected.exchangeRate);
                    await UserSharedPreference.putValue(
                      SharedPreferenceHelper.currencyCode,
                      code,
                    );
                    currencyCon.setCurrencyCode(label, code, symbol, rate);
                  },
                ),
              ),
              BlocConsumer<CurrencyListBloc, CurrencyListState>(
                builder: (context, state) {
                  if (state is CurrencyListLoading) {
                    return const SizedBox();
                  } else if (state is CurrencyListLoaded &&
                      state.currencyListModel.data != null) {
                    WidgetsBinding.instance.addPostFrameCallback((_) {
                      currencyCon
                        ..clearCurrencies()
                        ..addCurrency(state.currencyListModel.data!);
                      if (_currencyCode.isNotEmpty && isCurrencyLoad) {
                        currencyCon.loadCurrency(_currencyCode);
                      }
                      isCurrencyLoad = false;
                    });
                  }
                  return const SizedBox();
                },
                listener: (context, state) {
                  if (state is CurrencyConnectionError) {
                    CommonFunctions.showUpSnack(
                      message: AppLocalizations.of(context)!.noInternet,
                      context: context,
                    );
                  }
                },
              ),
              BlocConsumer<ProfileBloc, ProfileState>(
                builder: (context, state) {
                  if (state is ProfileLoaded) {
                    final data = state.profileModel.data;
                    if (data != null) {
                      putName(data.fullName);
                      WidgetsBinding.instance.addPostFrameCallback((_) {

                        if (isFirstLoad) {
                          // notificationCon.setUnreadCount(Utils.formatInt(data.unreadNotifications));
                          isFirstLoad = false;
                        }
                        if (data.imageUrl != null) {
                          setProfileImage(data.imageUrl);
                          commonCon.setProfile(data.imageUrl);
                        }
                      });
                    }
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

            ],
          ),
          actions: [
            InkWell(
              onTap: () {
                if (_token.isNotEmpty) {
                  homeCon.setTabType("Menu");
                  homeCon.setMenuName("MyWishlist");
                }
              },
              child: const Padding(
                padding: EdgeInsets.symmetric(horizontal: 2),
                child: ImageIcon(
                  AssetImage(AssetsIcons.favoriteOutline),
                  size: 24,
                  color: Colors.black,
                ),
              ),
            ),
            const SizedBox(width: 2),
            InkWell(
              onTap: () {
                if (_emailSettingsOn == "on") {
                  if (_emailVerified) {
                    homeCon.setTabType("Menu");
                    homeCon.setMenuName("Notification");
                    return;
                  }
                } else {
                  showDialog(
                    context: context,
                    builder: (context) => CommonConfirmationDialog(
                      title: AppLocalizations.of(context)!
                          .emailVerificationRequired,
                      message:
                      '${AppLocalizations.of(context)!.toAccessYour} ${AppLocalizations.of(context)!.notification},${AppLocalizations.of(context)!.pleaseVerifyYourEmail}',
                      onConfirm: () {
                        showDialog(
                          context: context,
                          builder: (context) =>const AlertDialog(
                            contentPadding: EdgeInsets.zero,
                            content: SizedBox(
                                height: 400,
                                width: 300,
                                child: EmailVerification()),
                          ),
                        );
                      },
                    ),
                  );
                }
              },
              child: Stack(
                children: [
                  const Padding(
                    padding: EdgeInsets.all(6.0),
                    child: ImageIcon(
                      AssetImage(AssetsIcons.notification),
                      size: 30,
                      color: Colors.black,
                    ),
                  ),
                  Positioned(
                    right: 6,
                    top: 8.0,
                    child: Container(
                      padding: const EdgeInsets.all(2.0),
                      decoration: const BoxDecoration(
                        color: Colors.red, // Badge background color
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 14.0,
                        minHeight: 14.0, // Badge size
                      ),
                      child: Center(
                        child: Consumer<NotificationController>(
                          builder: (_, controller, __) {
                            return Text(
                              controller.unreadCount.toString(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 8.0,
                                fontWeight: FontWeight.bold,
                              ),
                              textAlign: TextAlign.center,
                            );
                          },
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 2),
            InkWell(
              onTap: (){
                homeCon.setDrawerTypeType("Card");
                _scaffoldKey.currentState?.openEndDrawer();
              },
              child: Stack(
                clipBehavior: Clip.none,
                children: [
                  Image.asset(
                    AssetsIcons.cart,
                    height: 30,
                    width: 30,
                    color: homeCon.currentIndexHomePage == 2
                        ? CustomColors.baseColor
                        : Colors.grey,
                    fit: BoxFit.contain,
                  ),
                  Positioned(
                    right: -1.0,
                    top: 1.0,
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
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10.0,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),
            InkWell(
              onTap: () {
                homeCon.setTabType("Menu");
              },
              child:  AvatarWidget(
                imageUrl:commonCon.profileUrl,
                radius: 20,
              ),
            ),
            const SizedBox(width: 20),
          ],
          centerTitle: true,
        ),
      ),
      body: Column(
        children: [
          const SizedBox(height:6),
          CommonCard(
            pBottom: 4,
            pTop: 4,
            pLeft: 14,
            pRight: 20,
            mHorizontal: 0,
            mVertical: 0,
            widget: Row(
              children: [
                const SizedBox(width: 12),
                MenuTab(
                  title: AppLocalizations.of(context)!.home,
                  selectedTab: homeCon.tabType,
                  tabKey: "Home",
                  onTap: () => homeCon.setTabType("Home"),
                ),
                const SizedBox(width: 12),
                MenuTab(
                  title: AppLocalizations.of(context)!.products,
                  selectedTab: homeCon.tabType,
                  tabKey: "Products",
                  onTap: () => homeCon.setTabType("Products"),
                ),
                const SizedBox(width: 12),
                MenuTab(
                  title: AppLocalizations.of(context)!.category,
                  selectedTab: homeCon.tabType,
                  tabKey: "Category",
                  onTap: () => homeCon.setTabType("Category"),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: DesktopSearchWidget(
                    onSearch: (value) {
                      filterCon.setProductType("all");
                      _allProductBloc.add(AllProduct(
                          categoryId: const [],
                          search: value.length < 3 ? "" : value,
                          perPage: "10",
                          page: 1,
                          minPrice: "",
                          maxPrice: "",
                          brandId: const [],
                          availability: "",
                          sort: "",
                          type: const [],
                          minRating: "",
                          language: _language,
                          isFeatured: filterCon.isFeatured,
                          bestSelling: filterCon.bestSelling,
                          popularProducts: filterCon.popularProducts,
                          flashSale: filterCon.flashSale,
                          flashSaleId: 0,
                          userLat: _userLat,
                          userLong: _userLong,
                          token: _token));
                      allProduct.allProductClear();
                    },
                    hint: AppLocalizations.of(context)!.searchProductsHere,
                    type: "Products",
                  ),
                ),
              ],
            ),
          ),
          Expanded(
              child: homeCon.tabType == 'Home'
                  ? const DesktopHome()
                  : homeCon.tabType == 'Products'
                      ? const DesktopProductScreen()
                      : homeCon.tabType == 'Category'
                          ? const DesktopCategories()
                          : homeCon.tabType == 'Checkout'
                  ? const WebCheckoutScreens()
              :homeCon.tabType == 'Menu'?
              const MenuAndPage()
                  :const SizedBox()),
        ],
      ),
    );
  }

  setProfileImage(String image) async {
    await UserSharedPreference.putValue(
      SharedPreferenceHelper.profileImage,
      image,
    );
  }

  void _openLocationSearch(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) {
        return const LocationSelectSheet();
      },
    );
  }
}

class MenuTab extends StatelessWidget {
  final String title;
  final String selectedTab;
  final String tabKey;
  final VoidCallback onTap;
  final Color activeColor;
  final Color inactiveColor;
  final Duration animationDuration;

  const MenuTab({
    super.key,
    required this.title,
    required this.selectedTab,
    required this.tabKey,
    required this.onTap,
    this.activeColor = Colors.red,
    this.inactiveColor = Colors.black,
    this.animationDuration = const Duration(milliseconds: 300),
  });

  @override
  Widget build(BuildContext context) {
    bool isSelected = selectedTab == tabKey;

    return InkWell(
      onTap: onTap,
      child: AnimatedDefaultTextStyle(
        duration: animationDuration,
        style: Theme.of(context).textTheme.displayLarge!.copyWith(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: isSelected ? activeColor : null,
            ),
        child: Text(title),
      ),
    );
  }
}
