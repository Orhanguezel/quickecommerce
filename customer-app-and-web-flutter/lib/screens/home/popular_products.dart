
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/screens/home/product_grid.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/favorite_add_bloc/favorite_add_bloc.dart';
import '../../controller/bloc/favorite_add_bloc/favorite_add_event.dart';
import '../../controller/bloc/favorite_add_bloc/favorite_add_state.dart';
import '../../controller/bloc/popular_product_bloc/popular_product_bloc.dart';
import '../../controller/bloc/popular_product_bloc/popular_product_event.dart';
import '../../controller/bloc/popular_product_bloc/popular_product_state.dart';
import '../../controller/provider/common_provider.dart';
import '../../controller/provider/home_screen_provider.dart';
import '../../controller/provider/filter_controller.dart';
import '../../data/data_model/all_product_model.dart';
import '../../l10n/app_localizations.dart';
import '../auth_screens/login_confirmation_dailog.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/item_title.dart';

class PopularProducts extends StatefulWidget {
  const PopularProducts({super.key, required this.title});
  final String title;
  @override
  State<PopularProducts> createState() => _PopularProductsState();
}

class _PopularProductsState extends State<PopularProducts> {
  late final PopularProductBloc _popularProductBloc;
  late final FavoriteAddBloc _favoriteAddBloc;
  String _token = '', _language = '', _userLat = '', _userLong = '';
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
    _popularProductBloc.add(PopularProduct(
        id: '',
        categoryId: '',
        brandId: "",
        perPage: '6',
        language: _language,
        userLat: _userLat,
        userLong: _userLong,
        token: _token));
  }

  @override
  void initState() {
    _popularProductBloc = context.read<PopularProductBloc>();
    _favoriteAddBloc = context.read<FavoriteAddBloc>();
    getUserRout();
    super.initState();
  }

  bool _isInitialLoad = true;
  List<ProductData> productData = [];
  @override
  Widget build(BuildContext context) {
    var commonProvider = Provider.of<CommonProvider>(context);
    var homeCon = Provider.of<HomeScreenProvider>(context);
    var filterCon = Provider.of<FilterController>(context);
    return BlocConsumer<PopularProductBloc, PopularProductState>(
      builder: (_, state) {
        if (state is PopularProductLoading) {
          return _isInitialLoad
              ? SizedBox(
                  height: 870.h,
                  child:const ProductLoadingGrid(itemCount: 6,),
                )
              : SizedBox(
                  height: 850.h,
                  child:  ProductGrid(
                    productData: productData,
                    physics: const NeverScrollableScrollPhysics(),
                    onFavoriteToggle: (wishlist, id) {
                      _handleFavoriteToggle(wishlist!, id);
                    },
                  ),
                );
        }

        if (state is PopularProductLoaded) {
          if (_isInitialLoad && state.hasConnectionError) {
            CommonFunctions.showCustomSnackBar(
                context, AppLocalizations.of(context)!.noInternet);
          }
          _isInitialLoad = false;
          productData = state.popularProductsModel.data;
          return state.popularProductsModel.data.isEmpty
              ? const SizedBox()
              : Column(
                  children: [
                    ItemTitle(
                        title: widget.title.isEmpty
                            ? AppLocalizations.of(context)!.popular
                            : widget.title,
                        subTitle: "",
                        onTap: () {
                          filterCon.updateSelectedValue("Popular Products");
                          filterCon.setProductType("Popular Products");
                          homeCon.setCurrentIndexHomePage(1);
                        }),
                    commonProvider.isLoading
                        ? BlocListener<FavoriteAddBloc, FavoriteAddState>(
                            listener: (context, state) {
                              if (state is FavoriteAddConnectionError) {
                                commonProvider.setLoading(false);
                                CommonFunctions.showCustomSnackBar(context,
                                    AppLocalizations.of(context)!.noInternet);
                              } else if (state is FavoriteAddFailure) {
                                commonProvider.setLoading(false);
                                CommonFunctions.showCustomSnackBar(
                                    context, state.authModel.message);
                              } else if (state is FavoriteAddLoaded) {
                                CommonFunctions.showCustomSnackBar(
                                    color: Colors.green,
                                    context,
                                    state.authModel.message);
                                _popularProductBloc.add(PopularProduct(
                                    id: '',
                                    categoryId: '',
                                    brandId: "",
                                    perPage: '6',
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
                    SizedBox(height: 16.h),
                    SizedBox(
                        height: 870.h,
                        child: ProductGrid(
                          productData: productData,
                          physics: const NeverScrollableScrollPhysics(),
                          onFavoriteToggle: (wishlist, id) {
                            _handleFavoriteToggle(wishlist!, id);
                          },
                        )),
                  ],
                );
        }
        return Container();
      },
      listener: (context, state) {
        if (state is PopularProductConnectionError) {
          CommonFunctions.showUpSnack(
            message: AppLocalizations.of(context)!.noInternet,
            context: context,
          );
        }
        if (state is PopularProductFailure) {
          CommonFunctions.showUpSnack(
            message: state.popularProductsModel.message.isNotEmpty == true
                ? state.popularProductsModel.message
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
      showDialog(
        context: context,
        builder: (BuildContext context) {
          return const ConfirmationDialog();
        },
      );
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


