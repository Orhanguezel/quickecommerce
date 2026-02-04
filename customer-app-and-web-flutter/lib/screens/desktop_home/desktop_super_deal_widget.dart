import 'dart:async';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/controller/bloc/flash_deal_bloc/flash_deal_event.dart';
import 'package:quick_ecommerce/data/data_model/all_product_model.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_card.dart';
import 'package:quick_ecommerce/screens/desktop_home/product_grid.dart';

import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/favorite_add_bloc/favorite_add_bloc.dart';
import '../../controller/bloc/favorite_add_bloc/favorite_add_event.dart';
import '../../controller/bloc/favorite_add_bloc/favorite_add_state.dart';
import '../../controller/bloc/flash_deal_bloc/flash_deal_bloc.dart';
import '../../controller/bloc/flash_deal_bloc/flash_deal_state.dart';
import '../../controller/bloc/flash_deal_product_bloc/flash_deal_product_bloc.dart';
import '../../controller/bloc/flash_deal_product_bloc/flash_deal_product_event.dart';
import '../../controller/bloc/flash_deal_product_bloc/flash_deal_product_state.dart';
import '../../controller/provider/common_provider.dart';
import '../../controller/provider/home_screen_provider.dart';
import '../../controller/provider/filter_controller.dart';
import '../../l10n/app_localizations.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/item_title.dart';
import 'item_card.dart';

class DesktopSuperDealsScreen extends StatefulWidget {
  const DesktopSuperDealsScreen({super.key, required this.title});
  final String title;
  @override
  State<DesktopSuperDealsScreen> createState() =>
      _DesktopSuperDealsScreenState();
}

class _DesktopSuperDealsScreenState extends State<DesktopSuperDealsScreen> {
  late final FlashDealProductBloc _flashDealProductBloc;
  late final FlashDealBloc _flashDealBloc;
  late final FavoriteAddBloc _favoriteAddBloc;
  String _token = '', _language = '';
  @override
  void initState() {
    _flashDealProductBloc = context.read<FlashDealProductBloc>();
    _flashDealBloc = context.read<FlashDealBloc>();
    _favoriteAddBloc = context.read<FavoriteAddBloc>();
    getUserRout();
    super.initState();
  }

  getUserRout() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    var language = await UserSharedPreference.getValue(
      SharedPreferenceHelper.languageCode,
    );
    _token = token ?? "";
    _language = language ?? "";
    _flashDealProductBloc.add(FlashDealProduct(
        parPage: '4', page: 1, language: _language, token: _token));
    _flashDealBloc.add(FlashDeal());
  }

  bool isFlashDealLoaded = false;
  bool isFlashDealProductLoaded = false;

  bool _isInitialLoad = true;
  List<ProductData> productData = [];

  @override
  Widget build(BuildContext context) {
    var commonCon = Provider.of<CommonProvider>(context);
    var homeCon = Provider.of<HomeScreenProvider>(context);
    var filterCon = Provider.of<FilterController>(context);
    double screenWidth = MediaQuery.of(context).size.width;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (isFlashDealLoaded && isFlashDealProductLoaded)
          ItemTitle(
              title: widget.title.isEmpty
                  ? "${AppLocalizations.of(context)!.flash}${AppLocalizations.of(context)!.deals}"
                  : widget.title,
              subTitle: "",
              onTap: () {
                filterCon.updateSelectedValue("Flash Sale");
                filterCon.setProductType("Flash Sale");
                homeCon.setTabType("Products");
              }),
        commonCon.isLoading
            ? BlocListener<FavoriteAddBloc, FavoriteAddState>(
                listener: (context, state) {
                  if (state is FavoriteAddConnectionError) {
                    commonCon.setLoading(false);
                    CommonFunctions.showCustomSnackBar(
                        context, AppLocalizations.of(context)!.noInternet);
                  } else if (state is FavoriteAddFailure) {
                    commonCon.setLoading(false);
                    CommonFunctions.showCustomSnackBar(
                        context, state.authModel.message);
                  } else if (state is FavoriteAddLoaded) {
                    CommonFunctions.showCustomSnackBar(
                        color: Colors.green,
                        context,
                        state.authModel.message);
                    _flashDealProductBloc.add(FlashDealProduct(
                        parPage: '4',
                        page: 1,
                        language: _language,
                        token: _token));
                    commonCon.setLoading(false);
                  }
                },
                child: const SizedBox(),
              )
            : const SizedBox(),
        SizedBox(height: 8.h),
        SizedBox(
          height:screenWidth<750?550:330,
          child: Flex(
              direction: screenWidth > 750 ? Axis.horizontal : Axis.vertical,
              children: [
            Expanded(
              flex: 4,
              child: BlocConsumer<FlashDealBloc, FlashDealState>(
                builder: (_, state) {
                  if (state is FlashDealLoading) {
                    return const CarouselShimmer();
                  }
                  else if (state is FlashDealLoaded) {
                    isFlashDealLoaded = true;
                    final data = state.flashDealModel.data;
                    return data.isEmpty
                        ? const SizedBox()
                        : CommonCard(
                            mVertical: 4,
                        mHorizontal: 0,
                        widget: CarouselSlider(
                      options: CarouselOptions(
                        height: 280,
                        autoPlay: true,
                        enlargeCenterPage: true,
                        enableInfiniteScroll: true,
                        aspectRatio: 16 / 9,
                        viewportFraction: 1,
                        autoPlayAnimationDuration:
                        const Duration(seconds: 1),
                        autoPlayInterval: const Duration(seconds: 5),
                        autoPlayCurve: Curves.fastOutSlowIn,
                      ),
                      items: data.map((deal) {
                        Color bgColor = deal.backgroundColor != null
                            ? Color(int.parse(
                            deal.backgroundColor!
                                .substring(1),
                            radix: 16) +
                            0xFF000000)
                            : Colors.white;
                        Color titleColor = deal.titleColor != null
                            ? Color(int.parse(
                            deal.titleColor!.substring(1),
                            radix: 16) +
                            0xFF000000)
                            : Colors.black;
                        Color buttonBgColor = deal.buttonBgColor !=
                            null
                            ? Color(int.parse(
                            deal.buttonBgColor!.substring(1),
                            radix: 16) +
                            0xFF000000)
                            : const Color(0xFF1A73E8);
                        Color buttonTxtColor =
                        deal.buttonTextColor != null
                            ? Color(int.parse(
                            deal.buttonTextColor!
                                .substring(1),
                            radix: 16) +
                            0xFF000000)
                            : Colors.white;
                        Color timerBgColor = deal.timerBgColor != null
                            ? Color(int.parse(
                            deal.timerBgColor!.substring(1),
                            radix: 16) +
                            0xFF000000)
                            : Colors.red;
                        Color timerTxtColor = deal.timerTextColor !=
                            null
                            ? Color(int.parse(
                            deal.timerTextColor!.substring(1),
                            radix: 16) +
                            0xFF000000)
                            : Colors.white;

                        return Container(
                          height: 280,
                          width: MediaQuery.of(context).size.width,
                          decoration: BoxDecoration(
                              image: (deal.coverImageUrl != null &&
                                  deal.coverImageUrl!.isNotEmpty)
                                  ? DecorationImage(
                                image: NetworkImage(
                                    deal.coverImageUrl!),
                                fit: BoxFit.cover,
                                onError: (exception, stackTrace) {
                                  debugPrint(
                                      'Failed to load cover image: $exception');
                                },
                              )
                                  : null,
                              color: (deal.coverImageUrl == null ||
                                  deal.coverImageUrl!.isEmpty)
                                  ? bgColor
                                  : Colors
                                  .transparent,
                              borderRadius: BorderRadius.circular(4.54),
                          ),
                          child: Row(
                            children: [
                              deal.imageUrl != null &&
                                  deal.imageUrl!.isNotEmpty &&
                                  Uri.parse(deal.imageUrl!)
                                      .isAbsolute
                                  ? Image.network(
                                deal.imageUrl!,
                                height: 280,
                                width: 144,
                                fit: BoxFit.fill,
                                errorBuilder: (context, error,
                                    stackTrace) {
                                  return const SizedBox();
                                },
                              )
                                  : const SizedBox(),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  mainAxisAlignment:
                                  MainAxisAlignment.center,
                                  crossAxisAlignment:
                                  CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      deal.title ?? "Not Found",
                                      overflow: TextOverflow.ellipsis,
                                      maxLines: 2,
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        color: titleColor,
                                        letterSpacing: 1.0,
                                      ),
                                      textAlign: TextAlign.justify,
                                    ),
                                    const SizedBox(height: 8),
                                    Align(
                                      alignment: Alignment.centerLeft,
                                      child: Countdown(
                                        targetDate: DateTime.parse(
                                            deal.endTime),
                                        bgColor: timerBgColor,
                                        textColor: timerTxtColor,
                                        levelColor: titleColor,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    InkWell(
                                      onTap: () {
                                        filterCon.setProductType(
                                            "Flash Sale",
                                            flashSaleId: deal.id);
                                        homeCon
                                            .setCurrentIndexHomePage(
                                            1);
                                      },
                                      child: Container(
                                        padding: const EdgeInsets
                                            .symmetric(
                                            vertical: 10,
                                            horizontal: 12),
                                        decoration: BoxDecoration(
                                          color: buttonBgColor,
                                          borderRadius:
                                          BorderRadius.circular(
                                              5),
                                          boxShadow: const [
                                            BoxShadow(
                                              color:
                                              Color(0x1A000000),
                                              blurRadius: 8,
                                              offset: Offset(0, 4),
                                            ),
                                          ],
                                        ),
                                        child: Text(
                                          deal.buttonText ??
                                              "Not Found",
                                          style: TextStyle(
                                            fontSize: 14,
                                            fontWeight:
                                            FontWeight.w600,
                                            color: buttonTxtColor,
                                            letterSpacing: 1.0,
                                          ),
                                          textAlign: TextAlign.center,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              )
                            ],
                          ),
                        );
                      }).toList(),
                    ));
                  }
                  isFlashDealLoaded = false;
                  return Container();
                },
                listener: (context, state) {
                  if (state is FlashDealConnectionError) {
                    CommonFunctions.showUpSnack(
                      message: AppLocalizations.of(context)!.noInternet,
                      context: context,
                    );
                  } else if (state is FlashDealFailure) {
                    CommonFunctions.showUpSnack(
                      message: state.flashDealModel.message.isNotEmpty == true
                          ? state.flashDealModel.message
                          : "An error occurred",
                      context: context,
                    );
                  }
                },
              ),
            ),
            const SizedBox(width: 12,height: 12,),
            Expanded(
              flex: 6,
              child: BlocConsumer<FlashDealProductBloc, FlashDealProductState>(
                builder: (_, state) {
                  if (state is FlashDealProductLoading) {
                    return _isInitialLoad
                        ? const DesktopProductLoadingGrid(
                            itemCount: 4,
                          )
                        : DesktopProductGrid(
                            productData: productData,
                            productLength: 4,
                            physics: const NeverScrollableScrollPhysics(),
                            onFavoriteToggle: (wishlist, id) {
                              _handleFavoriteToggle(wishlist!, id);
                            },
                          );
                  }
                  else if (state is FlashDealProductLoaded) {
                    isFlashDealProductLoaded = true;
                    if (_isInitialLoad && state.hasConnectionError) {
                      CommonFunctions.showCustomSnackBar(
                          context, AppLocalizations.of(context)!.noInternet);
                    }
                    _isInitialLoad = false;
                    commonCon.setTotalPage(
                        state.flashDealProductModel.meta?.lastPage);
                    productData = state.flashDealProductModel.data;
                    return state.flashDealProductModel.data.isEmpty
                        ? const SizedBox()
                        : DesktopProductGrid(
                            productData: productData,
                      productLength: 4,
                            physics: const NeverScrollableScrollPhysics(),
                            onFavoriteToggle: (wishlist, id) {
                              _handleFavoriteToggle(wishlist!, id);
                            },
                          );
                  }
                  isFlashDealProductLoaded = false;
                  return Container();
                },
                listener: (context, state) {
                  if (state is FlashDealProductConnectionError) {
                    CommonFunctions.showUpSnack(
                      message: AppLocalizations.of(context)!.noInternet,
                      context: context,
                    );
                  } else if (state is FlashDealProductFailure) {
                    CommonFunctions.showUpSnack(
                      message:
                          state.flashDealProductModel.message.isNotEmpty == true
                              ? state.flashDealProductModel.message
                              : "An error occurred",
                      context: context,
                    );
                  }
                },
              ),
            ),
          ]),
        ),
      ],
    );
  }

  void _handleFavoriteToggle(bool isWishlist, String id) {
    var commonProvider = Provider.of<CommonProvider>(context, listen: false);
    if (_token.isEmpty) {
      CommonFunctions.showUpSnack(
          color: Colors.orangeAccent,
          context: context,
          message: 'Please log in');
      return;
    }

    if (isWishlist) {
      commonProvider.setLoading(true);
      _favoriteAddBloc.add(DeleteFavorites(productId: id, token: _token));
    } else {
      commonProvider.setLoading(true);
      _favoriteAddBloc.add(AddFavorites(productId: id, token: _token));
    }
  }
}

class Countdown extends StatefulWidget {
  final DateTime targetDate;
  final Color bgColor;
  final Color textColor;
  final Color levelColor;
  const Countdown({
    super.key,
    required this.targetDate,
    required this.bgColor,
    required this.textColor,
    required this.levelColor,
  });

  @override
  CountdownState createState() => CountdownState();
}

class CountdownState extends State<Countdown> {
  late Timer _timer;
  List<int> timeLeft = [0, 0, 0, 0]; // [days, hours, minutes, seconds]

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _updateTimeLeft();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      _updateTimeLeft();
    });
  }

  void _updateTimeLeft() {
    final now = DateTime.now();
    final distance = widget.targetDate.difference(now);

    if (distance.isNegative) {
      _timer.cancel();
      setState(() {
        timeLeft = [0, 0, 0, 0]; // Countdown has ended
      });
      return;
    }
    final days = distance.inDays;
    final hours = distance.inHours % 24;
    final minutes = distance.inMinutes % 60;
    final seconds = distance.inSeconds % 60;

    setState(() {
      timeLeft = [days, hours, minutes, seconds];
    });
  }

  @override
  void dispose() {
    if (_timer.isActive) {
      _timer.cancel();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.start,
      children: timeLeft.asMap().entries.map((entry) {
        final index = entry.key;
        final value = entry.value;

        return Padding(
          padding: const EdgeInsets.only(right: 6),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                height: 28,
                decoration: BoxDecoration(
                  color: widget.bgColor,
                  borderRadius: BorderRadius.circular(5),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x1A000000),
                      blurRadius: 6,
                      offset: Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      value.toString().padLeft(2, '0'),
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        // color: Colors.black,
                        color: widget.textColor,
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(height: 6.h),
              Text(
                index == 0
                    ? AppLocalizations.of(context)!.days
                    : index == 1
                        ? AppLocalizations.of(context)!.hours
                        : index == 2
                            ? AppLocalizations.of(context)!.minutes
                            : AppLocalizations.of(context)!.seconds,
                style: TextStyle(
                  fontSize: 8,
                  fontWeight: FontWeight.w600,
                  color: widget.levelColor,
                  // color: Colors.black,
                  letterSpacing: 0.2,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}
