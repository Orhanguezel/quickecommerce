import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:provider/provider.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/best_saleing_bloc/best_saleing_bloc.dart';
import '../../controller/bloc/best_saleing_bloc/best_saleing_event.dart';
import '../../controller/bloc/best_saleing_bloc/best_saleing_state.dart';
import '../../controller/bloc/favorite_add_bloc/favorite_add_bloc.dart';
import '../../controller/bloc/favorite_add_bloc/favorite_add_event.dart';

import '../../controller/bloc/favorite_add_bloc/favorite_add_state.dart';

import '../../controller/provider/cart_controler.dart';
import '../../controller/provider/common_provider.dart';
import '../../controller/provider/home_screen_provider.dart';
import '../../controller/provider/filter_controller.dart';
import '../../data/data_model/all_product_model.dart';
import '../../l10n/app_localizations.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/item_title.dart';
import 'product_grid.dart';

class DesktopBestSellingWidget extends StatefulWidget {
  const DesktopBestSellingWidget({super.key, required this.title});
  final String title;
  @override
  State<DesktopBestSellingWidget> createState() => _DesktopBestSellingWidgetState();
}

class _DesktopBestSellingWidgetState extends State<DesktopBestSellingWidget> {
  late final BestSaleBloc _bestSaleBloc;
  late final FavoriteAddBloc _favoriteAddBloc;
  String _token = '', _language = '', _userLat = '', _userLong = '';

  @override
  void initState() {
    _bestSaleBloc = context.read<BestSaleBloc>();
    _favoriteAddBloc = context.read<FavoriteAddBloc>();
    getUserRout();
    super.initState();
  }

  Timer? _debounce;

  getUserRout() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
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
    _token = token ?? "";
    _language = language ?? "";
    _userLat = customerLat ?? "";
    _userLong = customerLong ?? "";
    // Debounce API calls
    if (_debounce?.isActive ?? false) _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      if (_bestSaleBloc.state is! BestSaleLoading &&
          _bestSaleBloc.state is! BestSaleLoaded) {
        _bestSaleBloc.add(BestSale(
            id: "",
            categoryId: '',
            brandId: "",
            limit: '10',
            language: _language,
            userLat: _userLat,
            userLong: _userLong,
            token: _token));
      }
    });
  }

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  bool _isInitialLoad = true;
  List<ProductData> productData=[];
  @override
  Widget build(BuildContext context) {
    var commonProvider = Provider.of<CommonProvider>(context);
    var homeCon = Provider.of<HomeScreenProvider>(context);
    var filterCon = Provider.of<FilterController>(context);
    var cartCon = Provider.of<CartProvider>(context);
    cartCon.loadCartItems();
    return BlocConsumer<BestSaleBloc, BestSaleState>(
      builder: (_, state) {
        if (  state is BestSaleLoading) {
          return _isInitialLoad?
          const DesktopProductLoadingGrid(itemCount: 4,)
              :DesktopProductGrid(
                productData: productData,
                physics: const NeverScrollableScrollPhysics(),
                onFavoriteToggle: (wishlist, id) {
                  _handleFavoriteToggle(wishlist!, id);
                },
              );
        }

        if (state is BestSaleLoaded) {
          if (_isInitialLoad && state.hasConnectionError) {
            CommonFunctions.showCustomSnackBar(context, AppLocalizations.of(context)!.noInternet);
          }
          _isInitialLoad = false;
          productData=state.bestSaleModel.data!;
          return productData.isEmpty
              ? const SizedBox()
              : Column(
                  children: [
                   ItemTitle(
                        title: widget.title.isEmpty
                            ? AppLocalizations.of(context)!.best
                            : widget.title,
                        subTitle: '',
                        onTap: () {
                          homeCon.setTabType("Products");
                          filterCon.setProductType("Best Selling");
                          filterCon.updateSelectedValue("Best Selling");
                        }),
                    commonProvider.isLoading
                        ? BlocListener<FavoriteAddBloc, FavoriteAddState>(
                            listener: (context, state) {
                              if (state is FavoriteAddConnectionError) {
                                commonProvider.setLoading(false);
                                CommonFunctions.showCustomSnackBar(
                                    context, AppLocalizations.of(context)!.noInternet);
                              } else if (state is FavoriteAddFailure) {
                                commonProvider.setLoading(false);
                                CommonFunctions.showCustomSnackBar(
                                    context, state.authModel.message);
                              }
                              else if (state is FavoriteAddLoaded) {
                                CommonFunctions.showCustomSnackBar(
                                    color: Colors.green,
                                    context,
                                    state.authModel.message);
                                _bestSaleBloc.add(BestSale(
                                    id: "",
                                    categoryId: '',
                                    brandId: "",
                                    limit: '10',
                                    language: _language,
                                    userLat: _userLat,
                                    userLong: _userLong,
                                    token: _token));
                                commonProvider.setLoading(false);
                              }
                            },
                            child: const SizedBox(),
                          )
                        : const SizedBox(),
                    const SizedBox(height: 16),
                    DesktopProductGrid(
                      productData: productData,
                      physics: const NeverScrollableScrollPhysics(),
                      onFavoriteToggle: (wishlist, id) {
                        _handleFavoriteToggle(wishlist!, id);
                      },
                    ),
                  ],
                );
        }
        return Container();
      },
      listener: (context, state) {
        if (state is BestSaleConnectionError) {
          CommonFunctions.showUpSnack(
            message: AppLocalizations.of(context)!.noInternet,
            context: context,
          );
        }
        if (state is BestSaleFailure) {
          CommonFunctions.showUpSnack(
            message: state.bestSaleModel.message.isNotEmpty == true
                ? state.bestSaleModel.message
                : "An error occurred",
            context: context,
          );
        }
      },
    );
  }

  void _handleFavoriteToggle(bool isWishlist, String id) {
    var commonProvider = Provider.of<CommonProvider>(context, listen: false);
    if (_token.isEmpty) {
      CommonFunctions.showUpSnack(context: context, message: 'Please log in');
      return;
    }else{
      if (isWishlist) {
        commonProvider.setLoading(true);
        _favoriteAddBloc.add(DeleteFavorites(productId: id, token: _token));
      }
      else {
        commonProvider.setLoading(true);
        _favoriteAddBloc.add(AddFavorites(productId: id, token: _token));
      }
    }
  }
}
