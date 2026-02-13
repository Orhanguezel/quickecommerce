import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/screens/home/best_selling_widget.dart';
import 'package:quick_ecommerce/screens/home/categories_widget.dart';
import 'package:quick_ecommerce/screens/home/new_arrivals_widget.dart';
import 'package:quick_ecommerce/screens/home/popular_products.dart';
import 'package:quick_ecommerce/screens/home/super_deal_widget.dart' show SuperDealsScreen;

import '../../config/icons.dart';
import '../../config/images.dart';
import '../../config/shared_preference_helper.dart';

import '../../config/strings.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/currency_bloc/currency_bloc.dart';
import '../../controller/bloc/currency_bloc/currency_event.dart';
import '../../controller/bloc/currency_bloc/currency_state.dart';
import '../../controller/bloc/currency_list_bloc/currency_list_bloc.dart';
import '../../controller/bloc/currency_list_bloc/currency_list_event.dart';
import '../../controller/bloc/currency_list_bloc/currency_list_state.dart';
import '../../controller/bloc/home_title_bloc/home_title_bloc.dart';
import '../../controller/bloc/home_title_bloc/home_title_event.dart';
import '../../controller/bloc/home_title_bloc/home_title_state.dart';
import '../../controller/bloc/payment_gateways_bloc/payment_gateways_bloc.dart';
import '../../controller/bloc/payment_gateways_bloc/payment_gateways_event.dart';
import '../../controller/bloc/payment_gateways_bloc/payment_gateways_state.dart';
import '../../controller/bloc/profile_bloc/profile_bloc.dart';
import '../../controller/bloc/profile_bloc/profile_event.dart';
import '../../controller/bloc/profile_bloc/profile_state.dart';
import '../../controller/bloc/slider_list_bloc/slider_list_bloc.dart';
import '../../controller/bloc/slider_list_bloc/slider_list_event.dart';
import '../../controller/bloc/slider_list_bloc/slider_list_state.dart';
import '../../controller/provider/common_provider.dart';
import '../../controller/provider/currencie_controler.dart';
import '../../controller/provider/delivery_address_controller.dart';
import '../../controller/provider/home_screen_provider.dart';
import '../../controller/provider/notification_controller.dart';
import '../../controller/provider/filter_controller.dart';
import '../../controller/provider/payment_option_controller.dart';
import '../../data/data_model/currency_list_model.dart';
import '../../l10n/app_localizations.dart';
import '../../router/route_name.dart';
import '../common_widgets/common_card.dart';
import '../common_widgets/common_dropdown.dart';
import '../common_widgets/common_fonfirmation_dialog.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/person_avater.dart';
import '../desktop_home/find_location.dart';
import 'featured_widget.dart';
import 'item_card.dart';

class Home extends StatefulWidget {
  const Home({super.key});

  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> {
  final TextEditingController searchCon = TextEditingController();

  late final PaymentGatewaysBloc _paymentGatewaysBloc;
  late final CurrencyBloc _currencyBloc;
  late final CurrencyListBloc _currencyListBloc;
  late final ProfileBloc _profileBloc;
  late final HomeTitleBloc _homeTitleBloc;
  String _token = '', _emailSettingsOn = "",_currencyCode='';
  bool _emailVerified = false;
  final FocusNode focusNode = FocusNode();
  @override
  void initState() {
    _paymentGatewaysBloc = context.read<PaymentGatewaysBloc>();
    _currencyBloc = context.read<CurrencyBloc>();
    _currencyListBloc = context.read<CurrencyListBloc>();
    _profileBloc = context.read<ProfileBloc>();
    _homeTitleBloc = context.read<HomeTitleBloc>();
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
    address = await UserSharedPreference.getValue(
        SharedPreferenceHelper.customerAddress) ??
        "";
    getCustomerAddress(address);
    _token = token ?? "";
    _currencyCode = currencyCode ?? "";
    _emailSettingsOn = emailVeSettings ?? "";
    _emailVerified = emailVerified ?? false;
    checkLogin();
    _currencyBloc.add(Currency(token: _token));
    _homeTitleBloc.add(HomeTitleDataEvent());
    _paymentGatewaysBloc.add(PaymentGateways());
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

  getCustomerAddress(String address )  {
    Provider.of<DeliveryAddressController>(context,listen: false).setAddress(address);
  }

  String flashSel = '';
  String category = '';
  String featured = '';
  String bestSelling = '';
  String newest = '';
  String popular = '';

  final TextEditingController _searchController = TextEditingController();
  bool isFirstLoad = true;
  bool isCurrencyLoad=true;
  @override
  Widget build(BuildContext context) {
    final homeCon = Provider.of<HomeScreenProvider>(context);
    final currencyCon = Provider.of<CurrencyController>(context);
    var filterCon = Provider.of<FilterController>(context);
    var dAddressCon = Provider.of<DeliveryAddressController>(context);
    final paymentCon = Provider.of<PaymentOptionCon>(context);
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: Image.asset(
           Images.darkLogo,
          height: 45.h,
          width: 80.w,
          fit: BoxFit.fill,
        ),
        actions: [
          Row(
            children: [
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
                      if(_currencyCode.isNotEmpty&&isCurrencyLoad){
                        currencyCon.loadCurrency(_currencyCode);
                      }
                      isCurrencyLoad=false;
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
              SizedBox(
                width: 100.w,
                child: CommonDropdownObject<CurrencyData>(
                  dList: currencyCon.currencies,
                  dropdownValue: currencyCon.currencyLabel,
                  title: currencyCon.currencyLabel,
                  getLabel: (item) => item.label,
                  getValue: (item) => item.value.toString(),
                  onChanged: (value) async{
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
              SizedBox(width: 2.w),
              BlocConsumer<CurrencyBloc, CurrencyState>(
                builder: (context, state) {
                  if (state is CurrencyLoading) {
                    return const SizedBox();
                  } else if (state is CurrencyLoaded) {
                    final currenciesInfo = state.currenciesModel.currenciesInfo;
                    final position =
                        currenciesInfo.comSiteCurrencySymbolPosition ?? "";
                    final decimalPoint =
                        currenciesInfo.comSiteEnableDisableDecimalPoint ?? "NO";
                    final commaAdjustment =
                        currenciesInfo.comSiteCommaFormAdjustmentAmount ?? "NO";
                    WidgetsBinding.instance.addPostFrameCallback((_) {
                      currencyCon.setCurrencySymbol(
                          position, decimalPoint, commaAdjustment);
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
              InkWell(
                onTap: () {
                  if (_emailSettingsOn == "on") {
                    if (_emailVerified) {
                      context.pushNamed(RouteNames.notificationScreen);
                      return;
                    }
                  }else {
                    showDialog(
                      context: context,
                      builder: (context) => CommonConfirmationDialog(
                        title: AppLocalizations.of(context)!
                            .emailVerificationRequired,
                        message:
                            '${AppLocalizations.of(context)!.toAccessYour} ${AppLocalizations.of(context)!.notification},${AppLocalizations.of(context)!.pleaseVerifyYourEmail}',
                        onConfirm: () {
                          context.pushNamed(RouteNames.emailVerification);
                        },
                      ),
                    );
                  }
                },
                child: Stack(
                  children: [
                    Padding(
                      padding: EdgeInsets.all(6.0.sp),
                      child: ImageIcon(
                        const AssetImage(AssetsIcons.notification),
                        size: 24.sp,
                        color: Colors.black,
                      ),
                    ),
                    Positioned(
                      right: 4.w,
                      top: 6.0.h,
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
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 8.0.sp,
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
              SizedBox(width: 2.w),
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
                        }
                      });
                      return Row(
                        children: [
                          InkWell(
                            onTap: () {
                              if (_token.isNotEmpty) {
                                context
                                    .pushNamed(RouteNames.favoritesListScreen);
                              }
                            },
                            child: Stack(
                              children: [
                                Padding(
                                  padding: EdgeInsets.all(6.0.sp),
                                  child: ImageIcon(
                                    const AssetImage(
                                        AssetsIcons.favoriteOutline),
                                    size: 24.sp,
                                    color: Colors.black,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          SizedBox(width: 8.w),
                          InkWell(
                            onTap: () {
                              homeCon.setCurrentIndexHomePage(4);
                            },
                            child: AvatarWidget(
                              imageUrl: data.imageUrl,
                              radius: 20,
                            ),
                          ),
                        ],
                      );
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
              SizedBox(width: 8.w),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          if (paymentCon.paymentGateways.isEmpty)
            BlocConsumer<PaymentGatewaysBloc, PaymentGatewaysState>(
              listener: (context, state) {
                if (state is PaymentGatewaysConnectionError) {
                  CommonFunctions.showUpSnack(
                      context: context,
                      message: AppLocalizations.of(context)!.noInternet);
                } else if (state is PaymentGatewaysLoaded) {
                  if (state.hasConnectionError) {
                    CommonFunctions.showCustomSnackBar(
                        context, AppLocalizations.of(context)!.noInternet);
                  }
                  final data = state.paymentGatewaysModel.paymentGateways;
                  paymentCon.addPaymentGateway(data);
                }
              },
              builder: (context, state) {
                if (state is PaymentGatewaysLoading) {
                  return const SizedBox();
                }
                return const SizedBox();
              },
            ),
          InkWell(
            onTap: () {
              _openLocationSearch(context);
            },
            child: Container(
              height: 26.h,
              decoration: const BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Color(0x1A000000),
                    blurRadius: 8,
                    spreadRadius: 2,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  SizedBox(
                    width: 10.w,
                  ),
                  Image.asset(
                    AssetsIcons.location,
                    height: 16.h,
                    width: 16.w,
                    color: const Color(0xFF242426),
                    fit: BoxFit.contain,
                  ),
                  SizedBox(
                    width: 4.w,
                  ),
                  Text(
                    "${AppLocalizations.of(context)!.location} :",
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: Colors.black,
                      fontSize: 10.sp,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(
                    width: 6.w,
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
                                  fontSize: 10.sp),
                        )
                      : Expanded(
                          child: AutoScrollText(
                            text: dAddressCon.selectedAddress,
                            style: Theme.of(context)
                                .textTheme
                                .headlineSmall
                                ?.copyWith(
                                    color: const Color(0xFF4F547B),
                                    fontWeight: FontWeight.w400,
                                    fontSize: 10.sp),
                          ),
                        ),
                  const Icon(Icons.keyboard_arrow_down),
                  SizedBox(
                    width: 10.w,
                  ),
                ],
              ),
            ),
          ),

          Expanded(
            child: NestedScrollView(
                headerSliverBuilder:
                    (BuildContext context, bool innerBoxIsScrolled) {
                  return [
                    SliverToBoxAdapter(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          BlocConsumer<HomeTitleBloc, HomeTitleState>(
                            builder: (context, state) {
                              if (state is HomeTitleLoading) {
                                return const SizedBox();
                              } else if (state is HomeTitleLoaded) {
                                final title = state.homeSectionTitleModel.data!;
                                flashSel = title.flashSaleSectionTitle;
                                category = title.categorySectionTitle;
                                featured = title.featuredSectionTitle;
                                bestSelling = title.topSellingSectionTitle;
                                newest = title.latestProductSectionTitle;
                                popular = title.popularProductSectionTitle;
                              }
                              return const SizedBox();
                            },
                            listener: (context, state) {
                              if (state is HomeTitleConnectionError) {
                                CommonFunctions.showUpSnack(
                                  message:
                                      AppLocalizations.of(context)!.noInternet,
                                  context: context,
                                );
                              }
                            },
                          ),
                          Padding(
                            padding: EdgeInsets.only(left: 12.w, right: 12.w),
                            child: Column(
                              children: [
                                SizedBox(height: 14.h),
                                Container(
                                  height: 38.h,
                                  width: double.infinity,
                                  padding: EdgeInsets.all(10.sp),
                                  decoration: BoxDecoration(
                                      color: const Color(0xFFFFFFFF),
                                      borderRadius: BorderRadius.circular(5.r),
                                      border: Border.all(
                                        width: 0.5,
                                        color: const Color(0xFF627D98),
                                      )),
                                  child: Row(
                                    children: [
                                      Expanded(
                                        child: TextFormField(
                                          controller: _searchController,
                                          textInputAction:
                                              TextInputAction.search,
                                          style: Theme.of(context)
                                              .textTheme
                                              .displayLarge!
                                              .copyWith(
                                                  fontSize: 12.sp,
                                                  fontWeight: FontWeight.w400,
                                                  color:
                                                      const Color(0xFF5A637E)),
                                          decoration: InputDecoration(
                                            contentPadding: EdgeInsets.only(
                                                left: 12.w,
                                                top: 0.h,
                                                bottom: 12.h,
                                                right: 12.w),
                                            hintText:
                                                AppLocalizations.of(context)!
                                                    .searchProductsHere,
                                            hintStyle: Theme.of(context)
                                                .textTheme
                                                .displayLarge!
                                                .copyWith(
                                                    fontSize: 12.sp,
                                                    fontWeight: FontWeight.w400,
                                                    color: const Color(
                                                        0xFF5A637E)),
                                            border: InputBorder.none,
                                          ),
                                          onFieldSubmitted: (_) {
                                            filterCon.setSearchValue(
                                                _searchController.text);
                                            homeCon.setCurrentIndexHomePage(1);
                                          },
                                        ),
                                      ),
                                      InkWell(
                                        onTap: () {
                                          filterCon.setSearchValue(
                                              _searchController.text);
                                          homeCon.setCurrentIndexHomePage(1);
                                        },
                                        child: ImageIcon(
                                          const AssetImage(AssetsIcons.search),
                                          size: 22.sp,
                                          color: Colors.black,
                                        ),
                                      )
                                    ],
                                  ),
                                ),
                                SizedBox(height: 14.h),
                                const Slider(),
                                SizedBox(height: 30.h),
                                CategoriesWidget(
                                  title: category,
                                ),
                                SizedBox(height: 16.h),
                                SuperDealsScreen(
                                  title: flashSel,
                                ),
                                SizedBox(height: 16.h),
                                FeaturedWidget(
                                  title: featured,
                                ),
                                SizedBox(height: 16.h),
                                BestSellingWidget(
                                  title: bestSelling,
                                ),
                              ],
                            ),
                          ),
                          Padding(
                            padding: EdgeInsets.only(left: 12.w, right: 12.w),
                            child: Column(
                              children: [
                                SizedBox(height: 16.h),
                                NewArrivalsWidget(
                                  title: newest,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ];
                },
                body: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 8.w),
                  child: ListView(
                    children: [
                      SizedBox(height: 16.h),
                      PopularProducts(
                        title: popular,
                      ),
                    ],
                  ),
                )),
          ),
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

class Slider extends StatefulWidget {
  const Slider({super.key});

  @override
  State<Slider> createState() => _SliderState();
}

class _SliderState extends State<Slider> {
  late final SliderListBloc _sliderListBloc;
  @override
  void initState() {
    _sliderListBloc = context.read<SliderListBloc>();
    getUserRout();
    super.initState();
  }

  String _language = '';
  getUserRout() async {
    var language = await UserSharedPreference.getValue(
      SharedPreferenceHelper.languageCode,
    );
    _language = language ?? "";
    if (_sliderListBloc.state is! SliderListLoaded) {
      _sliderListBloc.add(SliderList(language: _language));
    }
  }

  @override
  Widget build(BuildContext context) {
    final homeCon = Provider.of<HomeScreenProvider>(context);
    return BlocConsumer<SliderListBloc, SliderListState>(
      builder: (_, state) {
        if (state is SliderListLoading) {
          return const ContentCardShimmer();
        } else if (state is SliderListLoaded) {
          if (state.hasConnectionError) {
            CommonFunctions.showCustomSnackBar(
                context, AppLocalizations.of(context)!.noInternet);
          }
          final data = state.sliderModel.sliders!;
          return state.sliderModel.sliders!.isEmpty
              ? const SizedBox()
              : Column(
                  children: [
                    CommonCard(
                      mHorizontal: 0,
                      mVertical: 0,
                      pLeft: 0,
                      pRight: 0,
                      pTop: 0,
                      pBottom: 0,
                      widget: CarouselSlider(
                        options: CarouselOptions(
                          height: 200.0,
                          autoPlay: true,
                          enlargeCenterPage: true,
                          enableInfiniteScroll: true,
                          aspectRatio: 16 / 9,
                          viewportFraction: 1,
                          autoPlayAnimationDuration: const Duration(seconds: 2),
                          autoPlayInterval: const Duration(seconds: 8),
                          autoPlayCurve: Curves.fastOutSlowIn,
                          onPageChanged: (index, reason) {
                            homeCon.updateIndex(index);
                          },
                        ),
                        items: data.map((url) {
                          return Builder(
                            builder: (BuildContext context) {
                              Color titleColor = Color(int.parse(
                                      url.titleColor.substring(1),
                                      radix: 16) +
                                  0xFF000000);
                              Color descriptionColor = Color(int.parse(
                                      url.subTitleColor.substring(1),
                                      radix: 16) +
                                  0xFF000000);
                              Color buttonColor = Color(int.parse(
                                      url.buttonBgColor.substring(1),
                                      radix: 16) +
                                  0xFF000000);
                              Color buttonTextColor = Colors.white;
                              buttonTextColor = url.buttonTextColor != null &&
                                      url.buttonTextColor.toString().length > 5
                                  ? Color(int.parse(
                                          url.buttonTextColor!.substring(1),
                                          radix: 16) +
                                      0xFF000000)
                                  : Colors.white; // Default fallback to white

                              Color bgColor = Color(int.parse(
                                      url.bgColor.substring(1),
                                      radix: 16) +
                                  0xFF000000);
                              return Container(
                                padding: EdgeInsets.symmetric(
                                    vertical: 8.h, horizontal: 8.w),
                                width: MediaQuery.of(context).size.width,
                                decoration: BoxDecoration(
                                  image: url.bgImageUrl != null
                                      ? DecorationImage(
                                          image: NetworkImage(url.bgImageUrl!),
                                          fit: BoxFit
                                              .cover, // Optional: Adjust as needed
                                        )
                                      : null,
                                  color: url.bgImageUrl == null
                                      ? bgColor
                                      : Colors.white,
                                  borderRadius: BorderRadius.circular(8.0),
                                ),
                                child: Row(
                                  children: [
                                    SizedBox(
                                      width: 4.w,
                                    ),
                                    Expanded(
                                      child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            url.title ?? "",
                                            overflow: TextOverflow.ellipsis,
                                            maxLines: 2,
                                            style: Theme.of(context)
                                                .textTheme
                                                .titleLarge
                                                ?.copyWith(
                                                    fontSize: 20.sp,
                                                    fontWeight: FontWeight.w600,
                                                    color: titleColor),
                                          ),
                                          SizedBox(
                                            height: 4.h,
                                          ),
                                          Text(
                                            url.description ?? "",
                                            overflow: TextOverflow.ellipsis,
                                            maxLines: 2,
                                            //AppLocalizations.of(context)!.orderDetails,
                                            style: Theme.of(context)
                                                .textTheme
                                                .titleLarge
                                                ?.copyWith(
                                                    fontSize: 11.sp,
                                                    fontWeight: FontWeight.w400,
                                                    color: descriptionColor),
                                          ),
                                          SizedBox(
                                            height: 8.h,
                                          ),
                                          InkWell(
                                            onTap: () {},
                                            child: Container(
                                              padding: EdgeInsets.symmetric(
                                                  horizontal: 8.w,
                                                  vertical: 8.h),
                                              decoration: BoxDecoration(
                                                borderRadius:
                                                    BorderRadius.circular(5.r),
                                                color: buttonColor,
                                              ),
                                              child: Text(
                                                url.buttonText ?? "",
                                                style: Theme.of(context)
                                                    .textTheme
                                                    .bodyMedium!
                                                    .copyWith(
                                                        fontSize: 10.sp,
                                                        fontWeight:
                                                            FontWeight.w600,
                                                        color: buttonTextColor),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    if(Utils.formatString(url.imageUrl).isNotEmpty)
                                    CommonImage(
                                      imageUrl: Utils.formatString(url.imageUrl),
                                      width: 150.w,
                                      height: 120.0.h,
                                      fit: BoxFit.fill,
                                    ),
                                  ],
                                ),
                              );
                            },
                          );
                        }).toList(),
                      ),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: data.map((url) {
                        int index = data.indexOf(url);
                        return Container(
                          width: homeCon.currentIndex == index ? 24.0.w : 9.0.w,
                          height: 3.0,
                          margin: EdgeInsets.symmetric(
                              vertical: 10.0.h, horizontal: 2.0.w),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10.r),
                            //shape: BoxShape.circle,
                            color: homeCon.currentIndex == index
                                ? Colors.blueAccent
                                : Colors.grey,
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                );
        }
        return Container();
      },
      listener: (context, state) {
        if (state is SliderListConnectionError) {
          CommonFunctions.showUpSnack(
            message: AppLocalizations.of(context)!.noInternet,
            context: context,
          );
        } else if (state is SliderListFailure) {
          CommonFunctions.showUpSnack(
            message: state.sliderModel.message ?? "An error occurred",
            context: context,
          );
        }
      },
    );
  }

  Widget commonLoading(ImageChunkEvent? loadingProgress) {
    double? progressValue;

    if (loadingProgress != null && loadingProgress.expectedTotalBytes != null) {
      progressValue = loadingProgress.cumulativeBytesLoaded /
          loadingProgress.expectedTotalBytes!;
    }

    return SizedBox(
      width: 150.w,
      height: 178.0.h,
      child: Center(
        child: CircularProgressIndicator(
          value: progressValue,
        ),
      ),
    );
  }
}

class AutoScrollText extends StatefulWidget {
  final String text;
  final TextStyle? style;

  const AutoScrollText({super.key, required this.text, this.style});

  @override
  AutoScrollTextState createState() => AutoScrollTextState();
}

class AutoScrollTextState extends State<AutoScrollText>
    with SingleTickerProviderStateMixin {
  late ScrollController _scrollController;
  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();

    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 20),
    )..addListener(() {
        _scrollController.jumpTo(_animationController.value *
            _scrollController.position.maxScrollExtent);
      });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.position.maxScrollExtent > 0) {
        _animationController.repeat();
      }
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      controller: _scrollController,
      physics: const NeverScrollableScrollPhysics(),
      child: Text(
        widget.text,
        style: widget.style,
      ),
    );
  }
}


