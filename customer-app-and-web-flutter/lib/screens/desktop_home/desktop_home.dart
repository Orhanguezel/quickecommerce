import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/config/strings.dart';
import 'package:quick_ecommerce/controller/bloc/currency_list_bloc/currency_list_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/currency_list_bloc/currency_list_event.dart';
import 'package:quick_ecommerce/controller/bloc/home_title_bloc/home_title_event.dart';
import 'package:quick_ecommerce/controller/bloc/payment_gateways_bloc/payment_gateways_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/payment_gateways_bloc/payment_gateways_event.dart';
import 'package:quick_ecommerce/controller/bloc/payment_gateways_bloc/payment_gateways_state.dart';
import 'package:quick_ecommerce/controller/bloc/slider_list_bloc/slider_list_event.dart';
import 'package:quick_ecommerce/controller/bloc/slider_list_bloc/slider_list_state.dart';
import 'package:quick_ecommerce/controller/provider/currencie_controler.dart';
import 'package:quick_ecommerce/controller/provider/payment_option_controller.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_card.dart';

import '../../config/shared_preference_helper.dart';

import '../../config/user_shared_preference.dart';
import '../../controller/bloc/currency_bloc/currency_bloc.dart';
import '../../controller/bloc/currency_bloc/currency_event.dart';
import '../../controller/bloc/currency_bloc/currency_state.dart';
import '../../controller/bloc/home_title_bloc/home_title_bloc.dart';
import '../../controller/bloc/profile_bloc/profile_bloc.dart';
import '../../controller/bloc/profile_bloc/profile_event.dart';
import '../../controller/bloc/slider_list_bloc/slider_list_bloc.dart';
import '../../controller/provider/common_provider.dart';
import '../../controller/provider/delivery_address_controller.dart';
import '../../controller/provider/home_screen_provider.dart';
import '../../l10n/app_localizations.dart';
import '../common_widgets/common_funcktion.dart';
import '../home/item_card.dart';
import 'best_selling_widget.dart';
import 'desktop_categories_widget.dart';
import 'desktop_super_deal_widget.dart';
import 'featured_widget.dart';
import 'item_card.dart';
import 'new_arrivals_widget.dart';
import 'popular_products.dart';

class DesktopHome extends StatefulWidget {
  const DesktopHome({super.key});

  @override
  State<DesktopHome> createState() => _DesktopHomeState();
}

class _DesktopHomeState extends State<DesktopHome> {
  final TextEditingController searchCon = TextEditingController();

  late final PaymentGatewaysBloc _paymentGatewaysBloc;
  late final CurrencyBloc _currencyBloc;
  late final CurrencyListBloc _currencyListBloc;
  late final ProfileBloc _profileBloc;
  late final HomeTitleBloc _homeTitleBloc;
  String _token = '', _emailSettingsOn = "";
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


  bool isFirstLoad = true;
  bool isCurrencyLoad=true;
  @override
  Widget build(BuildContext context) {
    final currencyCon = Provider.of<CurrencyController>(context);
    final paymentCon = Provider.of<PaymentOptionCon>(context);
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: SingleChildScrollView(
          child: Column(
            children: [

              const SizedBox(height: 14),
              const DesktopSlider(),
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
              const SizedBox(height: 10,),
              DesktopCategoriesWidget(
                title: category,
              ),
              const SizedBox(height: 16),
              DesktopSuperDealsScreen(
                title: flashSel,
              ),
              const SizedBox(height: 16),
              DesktopFeaturedWidget(
                title: featured,
              ),
              const SizedBox(height: 16),
              DesktopBestSellingWidget(
                title: bestSelling,
              ),
              const SizedBox(height: 16),
              DesktopNewArrivalsWidget(
                title: newest,
              ),
              const SizedBox(height: 16),
              DesktopPopularProducts(
                title: popular,
              ),
            ],
          ),
        ),
      ),
    );
  }
}


class DesktopSlider extends StatefulWidget {
  const DesktopSlider({super.key});

  @override
  State<DesktopSlider> createState() => _DesktopSliderState();
}

class _DesktopSliderState extends State<DesktopSlider> {
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
    double screenWidth = MediaQuery.of(context).size.width;
    return BlocConsumer<SliderListBloc, SliderListState>(
      builder: (_, state) {
        if (state is SliderListLoading) {
          return const CarouselShimmer();
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
                      pRight: 10,
                      pTop: 0,
                      pBottom: 0,
                      widget: CarouselSlider(
                        options: CarouselOptions(
                          height:400,
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
                                padding: const EdgeInsets.symmetric(
                                    vertical: 8, horizontal: 8),
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
                                      width: screenWidth * 0.03,
                                    ),
                                    SizedBox(
                                      width: screenWidth * 0.5,
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
                                                    fontSize: 32,
                                                    fontWeight: FontWeight.w600,
                                                    color: titleColor),
                                          ),
                                          const SizedBox(
                                            height: 12,
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
                                                    fontSize: 18,
                                                    fontWeight: FontWeight.w400,
                                                    color: descriptionColor),
                                          ),
                                          const SizedBox(
                                            height: 12,
                                          ),
                                          InkWell(
                                            onTap: () {},
                                            child: Container(
                                              padding: const EdgeInsets.symmetric(
                                                  horizontal: 12,
                                                  vertical: 10),
                                              decoration: BoxDecoration(
                                                borderRadius:
                                                    BorderRadius.circular(5),
                                                color: buttonColor,
                                              ),
                                              child: Text(
                                                url.buttonText ?? "",
                                                style: Theme.of(context)
                                                    .textTheme
                                                    .bodyMedium!
                                                    .copyWith(
                                                        fontSize: 16,
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
                                      imageUrl:Utils.formatString(url.imageUrl),
                                      width: screenWidth * 0.4,
                                      height: 300.0,
                                      fit: BoxFit.fill,
                                    ),
                                     SizedBox(
                                      width: screenWidth * 0.03,
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
                          width: homeCon.currentIndex == index ? 24.0 : 9.0,
                          height: 3.0,
                          margin: const EdgeInsets.symmetric(
                              vertical: 10.0, horizontal: 2.0),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10),
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


