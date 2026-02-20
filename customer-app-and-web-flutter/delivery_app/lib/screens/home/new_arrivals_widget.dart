import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/data/data_model/all_product_model.dart';
import 'package:quick_ecommerce/screens/home/product_grid.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/favorite_add_bloc/favorite_add_bloc.dart';
import '../../controller/bloc/favorite_add_bloc/favorite_add_event.dart';
import '../../controller/bloc/favorite_add_bloc/favorite_add_state.dart';
import '../../controller/bloc/new_arrivals_bloc/new_arrival_bloc.dart';
import '../../controller/bloc/new_arrivals_bloc/new_arrival_event.dart';
import '../../controller/bloc/new_arrivals_bloc/new_arrival_state.dart';

import '../../controller/provider/cart_controler.dart';
import '../../controller/provider/common_provider.dart';
import '../../controller/provider/home_screen_provider.dart';
import '../../controller/provider/filter_controller.dart';

import '../../l10n/app_localizations.dart';
import '../auth_screens/login_confirmation_dailog.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/item_title.dart';

class NewArrivalsWidget extends StatefulWidget {
  const NewArrivalsWidget({super.key, required this.title});
  final String title;
  @override
  State<NewArrivalsWidget> createState() => _NewArrivalsWidgetState();
}

class _NewArrivalsWidgetState extends State<NewArrivalsWidget> {
  late final NewArrivalBloc _newArrivalBloc;
  late final FavoriteAddBloc _favoriteAddBloc;

  String _token = '', _language = "", _userLat = '', _userLong = '';

  Timer? _debounce;
  @override
  void initState() {
    super.initState();
    _newArrivalBloc = context.read<NewArrivalBloc>();
    _favoriteAddBloc = context.read<FavoriteAddBloc>();
    getUserRout();
  }

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
      if (_newArrivalBloc.state is! NewArrivalLoading &&
          _newArrivalBloc.state is! NewArrivalLoaded) {
        _newArrivalBloc.add(NewArrival(
            categoryId: '',
            minPrice: '',
            maxPrice: '',
            availability: '',
            perPage: '4',
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
    var cartCon = Provider.of<CartProvider>(context);
    cartCon.loadCartItems();
    return BlocConsumer<NewArrivalBloc, NewArrivalState>(
      listener: _blocListener,
      builder: _blocBuilder,
    );
  }

  Widget _blocBuilder(BuildContext context, NewArrivalState state) {
    if (state is NewArrivalLoading) {
      return _isInitialLoad?
      SizedBox(
        height: 580.h,
        child:const ProductLoadingGrid(itemCount: 4,),
      )
          :SizedBox(
        height: 560.h,
        child:ProductGrid(
          productData: productData,
          physics: const NeverScrollableScrollPhysics(),
          onFavoriteToggle: (wishlist, id) {
            _handleFavoriteToggle(wishlist!, id);
          },
        ),
      );
    }
    else if (state is NewArrivalLoaded) {
      if (_isInitialLoad&&state.hasConnectionError) {
        CommonFunctions.showCustomSnackBar(context, AppLocalizations.of(context)!.noInternet);
      }
      productData=state.newArrivalModel.data;
      if (state.newArrivalModel.data.isEmpty) {
        return const SizedBox();
      }
      _isInitialLoad = false;
      return _buildProductList(widget.title, state);
    }

    return Container(); // Default empty state
  }

  void _blocListener(BuildContext context, NewArrivalState state) {
    if (state is NewArrivalConnectionError) {
      CommonFunctions.showUpSnack(
        message: AppLocalizations.of(context)!.noInternet,
        context: context,
      );
    } else if (state is NewArrivalFailure) {
      CommonFunctions.showUpSnack(
        message: state.newArrivalModel.message.isNotEmpty
            ? state.newArrivalModel.message
            : 'An error occurred',
        context: context,
      );
    }

    // Make sure Navigator isn't locked
    if (!_isNavigatorLocked()) {
      if (state is NewArrivalFailure) {
        CommonFunctions.showUpSnack(
          message: state.newArrivalModel.message.isNotEmpty
              ? state.newArrivalModel.message
              : 'An error occurred',
          context: context,
        );
      }
    }
  }

  bool _isNavigatorLocked() {
    // Check if Navigator is locked and prevent further navigation actions
    try {
      final navigator = Navigator.of(context);
      return navigator.canPop(); // If can't pop, likely locked
    } catch (_) {
      return false;
    }
  }

  Widget _buildProductList(String title, NewArrivalLoaded state) {
    var commonProvider = Provider.of<CommonProvider>(context, listen: false);
    var homeCon = Provider.of<HomeScreenProvider>(context, listen: false);
    var filterCon = Provider.of<FilterController>(context, listen: false);
    return Column(
      children: [
        ItemTitle(
            title: title.isEmpty
                ? "${AppLocalizations.of(context)!.newA} ${AppLocalizations.of(context)!.arrivals}"
                : title,
            subTitle: "",
            onTap: () {
              filterCon.updateSelectedValue('Newest');
              filterCon.setProductType("Newest");
              homeCon.setCurrentIndexHomePage(1);
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
                      _newArrivalBloc.add(NewArrival(
                          categoryId: '',
                          minPrice: '',
                          maxPrice: '',
                          availability: '',
                          perPage: '4',
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
          height: 580.h,
          child:  ProductGrid(
            productData: productData,
            physics: const NeverScrollableScrollPhysics(),
            onFavoriteToggle: (wishlist, id) {
              _handleFavoriteToggle(wishlist!, id);
            },
          ),
        ),
      ],
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
    } else {
      if (isWishlist) {
        commonProvider.setLoading(true);
        _favoriteAddBloc.add(DeleteFavorites(productId: id, token: _token));
      } else {
        commonProvider.setLoading(true);
        _favoriteAddBloc.add(AddFavorites(productId: id, token: _token));
      }
    }
  }
}