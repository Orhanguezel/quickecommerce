import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/config/shared_preference_helper.dart';
import 'package:quick_ecommerce/config/strings.dart';
import 'package:quick_ecommerce/config/user_shared_preference.dart';
import 'package:quick_ecommerce/controller/bloc/categories_bloc/categories_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/categories_bloc/categories_event.dart';
import 'package:quick_ecommerce/controller/bloc/categories_bloc/categories_state.dart';
import 'package:quick_ecommerce/controller/bloc/currency_bloc/currency_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/currency_bloc/currency_event.dart';
import 'package:quick_ecommerce/controller/bloc/currency_bloc/currency_state.dart';
import 'package:quick_ecommerce/controller/bloc/currency_list_bloc/currency_list_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/currency_list_bloc/currency_list_event.dart';
import 'package:quick_ecommerce/controller/bloc/home_title_bloc/home_title_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/home_title_bloc/home_title_event.dart';
import 'package:quick_ecommerce/controller/bloc/home_title_bloc/home_title_state.dart';
import 'package:quick_ecommerce/controller/bloc/payment_gateways_bloc/payment_gateways_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/payment_gateways_bloc/payment_gateways_event.dart';
import 'package:quick_ecommerce/controller/bloc/payment_gateways_bloc/payment_gateways_state.dart';
import 'package:quick_ecommerce/controller/bloc/profile_bloc/profile_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/profile_bloc/profile_event.dart';
import 'package:quick_ecommerce/controller/provider/all_product_controller.dart';
import 'package:quick_ecommerce/controller/provider/common_provider.dart';
import 'package:quick_ecommerce/controller/provider/currencie_controler.dart';
import 'package:quick_ecommerce/controller/provider/delivery_address_controller.dart';
import 'package:quick_ecommerce/controller/provider/filter_controller.dart';
import 'package:quick_ecommerce/controller/provider/home_screen_provider.dart';
import 'package:quick_ecommerce/controller/provider/payment_option_controller.dart';
import 'package:quick_ecommerce/l10n/app_localizations.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_funcktion.dart';
import 'package:quick_ecommerce/screens/desktop_home/best_selling_widget.dart';
import 'package:quick_ecommerce/screens/desktop_home/desktop_home.dart';
import 'package:quick_ecommerce/screens/desktop_home/desktop_super_deal_widget.dart';
import 'package:quick_ecommerce/screens/desktop_home/featured_widget.dart';
import 'package:quick_ecommerce/screens/desktop_home/new_arrivals_widget.dart';
import 'package:quick_ecommerce/screens/desktop_home/popular_products.dart';
import 'package:quick_ecommerce/screens/home/item_card.dart';
import 'package:shimmer/shimmer.dart';

class DesktopPremiumHome extends StatefulWidget {
  const DesktopPremiumHome({super.key});

  @override
  State<DesktopPremiumHome> createState() => _DesktopPremiumHomeState();
}

class _DesktopPremiumHomeState extends State<DesktopPremiumHome> {
  late final PaymentGatewaysBloc _paymentGatewaysBloc;
  late final CurrencyBloc _currencyBloc;
  late final CurrencyListBloc _currencyListBloc;
  late final ProfileBloc _profileBloc;
  late final HomeTitleBloc _homeTitleBloc;
  String _token = '';
  String _emailSettingsOn = '';
  bool _emailVerified = false;

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

  Future<void> getUserRout() async {
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
          SharedPreferenceHelper.customerAddress,
        ) ??
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

  void checkLogin() {
    var commonCon = Provider.of<CommonProvider>(context, listen: false);
    if (_token.isNotEmpty) {
      commonCon.setLogin(true);
      if (_emailSettingsOn == "on" && _emailVerified) {
        _profileBloc.add(Profile(token: _token));
      }
    }
  }

  void getCustomerAddress(String address) {
    Provider.of<DeliveryAddressController>(context, listen: false)
        .setAddress(address);
  }

  @override
  Widget build(BuildContext context) {
    final currencyCon = Provider.of<CurrencyController>(context);
    final paymentCon = Provider.of<PaymentOptionCon>(context);
    final homeTitleState = context.watch<HomeTitleBloc>().state;
    final titles = homeTitleState is HomeTitleLoaded
        ? homeTitleState.homeSectionTitleModel.data
        : null;

    final categoryTitle = Utils.formatString(titles?.categorySectionTitle);
    final flashTitle = Utils.formatString(titles?.flashSaleSectionTitle);
    final featuredTitle = Utils.formatString(titles?.featuredSectionTitle);
    final bestSellingTitle = Utils.formatString(titles?.topSellingSectionTitle);
    final latestTitle = Utils.formatString(titles?.latestProductSectionTitle);
    final popularTitle = Utils.formatString(titles?.popularProductSectionTitle);

    return Scaffold(
      backgroundColor: const Color(0xFFF3F5F7),
      body: BlocConsumer<CurrencyBloc, CurrencyState>(
        listener: (context, state) {
          if (state is CurrencyConnectionError) {
            CommonFunctions.showUpSnack(
              message: AppLocalizations.of(context)!.noInternet,
              context: context,
            );
          }
        },
        builder: (context, state) {
          if (state is CurrencyLoaded) {
            final currenciesInfo = state.currenciesModel.currenciesInfo;
            final position = currenciesInfo.comSiteCurrencySymbolPosition ?? "";
            final decimalPoint =
                currenciesInfo.comSiteEnableDisableDecimalPoint ?? "NO";
            final commaAdjustment =
                currenciesInfo.comSiteCommaFormAdjustmentAmount ?? "NO";
            WidgetsBinding.instance.addPostFrameCallback((_) {
              currencyCon.setCurrencySymbol(
                position,
                decimalPoint,
                commaAdjustment,
              );
            });
          }

          return SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 18, 16, 28),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _PremiumHeroSection(
                    categoryTitle: categoryTitle,
                  ),
                  const SizedBox(height: 22),
                  _PremiumSectionSurface(
                    child: DesktopSuperDealsScreen(
                      title: flashTitle,
                      isPremium: true,
                    ),
                  ),
                  const SizedBox(height: 22),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: _PremiumSectionSurface(
                          child: DesktopFeaturedWidget(
                            title: featuredTitle,
                            isPremium: true,
                          ),
                        ),
                      ),
                      const SizedBox(width: 18),
                      Expanded(
                        child: _PremiumSectionSurface(
                          child: DesktopBestSellingWidget(
                            title: bestSellingTitle,
                            isPremium: true,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 22),
                  _PremiumSectionSurface(
                    child: DesktopNewArrivalsWidget(
                      title: latestTitle,
                      isPremium: true,
                    ),
                  ),
                  const SizedBox(height: 22),
                  _PremiumSectionSurface(
                    child: DesktopPopularProducts(
                      title: popularTitle,
                      isPremium: true,
                    ),
                  ),
                  if (paymentCon.paymentGateways.isEmpty)
                    BlocConsumer<PaymentGatewaysBloc, PaymentGatewaysState>(
                      listener: (context, state) {
                        if (state is PaymentGatewaysConnectionError) {
                          CommonFunctions.showUpSnack(
                            context: context,
                            message: AppLocalizations.of(context)!.noInternet,
                          );
                        } else if (state is PaymentGatewaysLoaded) {
                          final data =
                              state.paymentGatewaysModel.paymentGateways;
                          paymentCon.addPaymentGateway(data);
                        }
                      },
                      builder: (context, state) {
                        return const SizedBox.shrink();
                      },
                    ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _PremiumHeroSection extends StatelessWidget {
  final String categoryTitle;

  const _PremiumHeroSection({
    required this.categoryTitle,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isCompact = constraints.maxWidth < 1180;

        if (isCompact) {
          return Column(
            children: [
              const _PremiumHeroCard(
                padding: EdgeInsets.all(14),
                child: DesktopSlider(),
              ),
              const SizedBox(height: 16),
              _PremiumHeroCard(
                padding: const EdgeInsets.all(18),
                child: _PremiumCategoryPanel(
                  title: categoryTitle,
                ),
              ),
            ],
          );
        }

        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Expanded(
              flex: 8,
              child: _PremiumHeroCard(
                padding: EdgeInsets.all(14),
                child: DesktopSlider(),
              ),
            ),
            const SizedBox(width: 18),
            Expanded(
              flex: 4,
              child: _PremiumHeroCard(
                padding: const EdgeInsets.all(18),
                child: _PremiumCategoryPanel(
                  title: categoryTitle,
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

class _PremiumHeroCard extends StatelessWidget {
  final Widget child;
  final EdgeInsets padding;

  const _PremiumHeroCard({
    required this.child,
    required this.padding,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            Color(0xFFFFFFFF),
            Color(0xFFF7FAFC),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: const Color(0xFFE2E8F0),
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x120F172A),
            blurRadius: 24,
            offset: Offset(0, 10),
          ),
        ],
      ),
      child: child,
    );
  }
}

class _PremiumSectionSurface extends StatelessWidget {
  final Widget child;

  const _PremiumSectionSurface({
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: const Color(0xFFE2E8F0),
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0F0F172A),
            blurRadius: 18,
            offset: Offset(0, 8),
          ),
        ],
      ),
      child: child,
    );
  }
}

class _PremiumCategoryPanel extends StatefulWidget {
  final String title;

  const _PremiumCategoryPanel({
    required this.title,
  });

  @override
  State<_PremiumCategoryPanel> createState() => _PremiumCategoryPanelState();
}

class _PremiumCategoryPanelState extends State<_PremiumCategoryPanel> {
  late final CategoriesBloc _categoriesBloc;
  Timer? _debounce;
  String _language = '';

  @override
  void initState() {
    _categoriesBloc = context.read<CategoriesBloc>();
    _loadCategories();
    super.initState();
  }

  Future<void> _loadCategories() async {
    var language = await UserSharedPreference.getValue(
      SharedPreferenceHelper.languageCode,
    );
    _language = language ?? "";
    if (_debounce?.isActive ?? false) _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      _categoriesBloc.add(
        Categories(
          limit: '8',
          language: _language,
          searchKey: '',
          sortField: '',
          sort: '',
          all: false,
        ),
      );
    });
  }

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<CategoriesBloc, CategoriesState>(
      listener: (context, state) {
        if (state is CategoriesConnectionError) {
          CommonFunctions.showUpSnack(
            message: AppLocalizations.of(context)!.noInternet,
            context: context,
          );
        } else if (state is CategoriesFailure) {
          CommonFunctions.showUpSnack(
            message: state.categoryModel.message.isNotEmpty == true
                ? state.categoryModel.message
                : 'An error occurred',
            context: context,
          );
        }
      },
      builder: (context, state) {
        final heading = widget.title.isEmpty
            ? AppLocalizations.of(context)!.category
            : widget.title;

        if (state is CategoriesLoading) {
          return _PremiumCategoryLoading(title: heading);
        }

        if (state is CategoriesLoaded && state.categoryModel.data != null) {
          final data = state.categoryModel.data!;
          if (data.isEmpty) {
            return const SizedBox.shrink();
          }

          final visibleItems = data.take(math.min(8, data.length)).toList();
          final filterCon = Provider.of<FilterController>(context);
          final homeCon = Provider.of<HomeScreenProvider>(context);
          final allProduct = Provider.of<AllProductController>(context);

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                heading,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF0F172A),
                    ),
              ),
              const SizedBox(height: 6),
              Text(
                AppLocalizations.of(context)!.searchProductsHere,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: const Color(0xFF64748B),
                      fontWeight: FontWeight.w400,
                    ),
              ),
              const SizedBox(height: 18),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: visibleItems.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 2.15,
                ),
                itemBuilder: (context, index) {
                  final category = visibleItems[index];
                  final bgColor = _parseCategoryColor(category.categoryBanner);

                  return InkWell(
                    onTap: () {
                      allProduct.allProductClear();
                      filterCon.toggleCategory(
                        category.categoryName,
                        category.id.toString(),
                      );
                      homeCon.setCurrentIndexHomePage(1);
                      homeCon.setTabType("Products");
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 10,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(
                          color: const Color(0xFFE2E8F0),
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: bgColor,
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: Center(
                              child: CommonImage(
                                imageUrl: category.categoryThumbUrl ?? "",
                                width: 30,
                                height: 30,
                                radius: BorderRadius.circular(10),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              Utils.formatString(category.label),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context)
                                  .textTheme
                                  .bodyMedium
                                  ?.copyWith(
                                    fontWeight: FontWeight.w600,
                                    color: const Color(0xFF0F172A),
                                  ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ],
          );
        }

        return const SizedBox.shrink();
      },
    );
  }

  Color _parseCategoryColor(String? value) {
    if (value == null || value.isEmpty) {
      return const Color(0xFFE2F3FF);
    }

    try {
      return Color(
        int.parse(value.replaceFirst("#", "0xFF")),
      );
    } catch (_) {
      return const Color(0xFFE2F3FF);
    }
  }
}

class _PremiumCategoryLoading extends StatelessWidget {
  final String title;

  const _PremiumCategoryLoading({
    required this.title,
  });

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade200,
      highlightColor: Colors.grey.shade100,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 180,
            height: 26,
            color: Colors.white,
          ),
          const SizedBox(height: 8),
          Text(
            title,
            style: const TextStyle(color: Colors.transparent),
          ),
          const SizedBox(height: 18),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: 8,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 2.15,
            ),
            itemBuilder: (context, index) {
              return Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
