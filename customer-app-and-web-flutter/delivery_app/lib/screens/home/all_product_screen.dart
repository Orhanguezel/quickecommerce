import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_card.dart';
import 'package:quick_ecommerce/screens/home/product_grid.dart';
import '../../config/icons.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/strings.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/all_product_bloc/all_product_bloc.dart';
import '../../controller/bloc/all_product_bloc/all_product_event.dart';
import '../../controller/bloc/all_product_bloc/all_product_state.dart';

import '../../controller/bloc/favorite_add_bloc/favorite_add_bloc.dart';
import '../../controller/bloc/favorite_add_bloc/favorite_add_event.dart';
import '../../controller/bloc/favorite_add_bloc/favorite_add_state.dart';
import '../../controller/provider/all_product_controller.dart';
import '../../controller/provider/common_provider.dart';
import '../../controller/provider/home_screen_provider.dart';
import '../../controller/provider/filter_controller.dart';
import '../../l10n/app_localizations.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/common_search_widget.dart';
import '../common_widgets/filter_screen.dart';
import '../common_widgets/no_data_widget.dart';

class AllProductScreen extends StatefulWidget {
  const AllProductScreen({
    super.key,
  });

  @override
  State<AllProductScreen> createState() => _AllProductScreenState();
}

class _AllProductScreenState extends State<AllProductScreen> {
  final TextEditingController searchCon = TextEditingController();

  late final AllProductBloc _allProductBloc;
  late final FavoriteAddBloc _favoriteAddBloc;

  final ScrollController _scrollController = ScrollController();
  String _token = '', _language = '', _userLat = '', _userLong = '';
  bool _isLoading = true;
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
    if (!mounted) return;
    var allProduct = Provider.of<AllProductController>(context, listen: false);
    var filterCon = Provider.of<FilterController>(context, listen: false);
    searchCon.text = filterCon.searchValue;
    filterCon.setSearchValue("");
    allProduct.allProductClear();
    _allProductBloc.add(AllProduct(
        categoryId: filterCon.categoriesId,
        search: searchCon.text,
        perPage: "10",
        page: 1,
        minPrice: "",
        maxPrice: "",
        brandId: const [],
        availability: "",
        sort: filterCon.shortValue,
        type: const [],
        minRating: "",
        language: _language,
        isFeatured: filterCon.isFeatured,
        bestSelling: filterCon.bestSelling,
        popularProducts: filterCon.popularProducts,
        flashSale: filterCon.flashSale,
        flashSaleId: filterCon.flashSaleId,
        userLat: _userLat,
        userLong: _userLong,
        token: _token));
  }

  @override
  void initState() {
    _allProductBloc = context.read<AllProductBloc>();
    _favoriteAddBloc = context.read<FavoriteAddBloc>();
    _scrollController.addListener(_onScroll);
    getUserRout();
    _isLoading=true;
    super.initState();
  }

  Timer? _debounce;
  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _debounce?.cancel();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels ==
        _scrollController.position.maxScrollExtent) {
      _loadMoreProducts();
    }
  }

  void _loadMoreProducts() {
    var allProduct = Provider.of<AllProductController>(context, listen: false);
    var filterCon = Provider.of<FilterController>(context, listen: false);
    if (allProduct.allPCurrentPage < allProduct.allPTotalPages) {
      allProduct.goToAllPNextPage();
      _allProductBloc.add(AllProduct(
        categoryId: filterCon.categoriesId,
        search: "",
        perPage: "10",
        page: allProduct.allPCurrentPage,
        minPrice: filterCon.priceRange.start.toString(),
        maxPrice: filterCon.priceRange.end.toString(),
        brandId: filterCon.brandIds,
        availability: "",
        sort: filterCon.shortValue,
        type:filterCon.selectedStoreTypeIds,
        minRating: "",
        language: _language,
        isFeatured: filterCon.isFeatured,
        bestSelling: filterCon.bestSelling,
        popularProducts: filterCon.popularProducts,
        flashSale: filterCon.flashSale,
        flashSaleId: 0,
        userLat: _userLat,
        userLong: _userLong,
        token: _token,
      ));
    }
  }

  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  bool _isInitialLoad = true;

  @override
  Widget build(BuildContext context) {
    var allProduct = Provider.of<AllProductController>(context);
    var filterCon = Provider.of<FilterController>(context);
    var commonProvider = Provider.of<CommonProvider>(context, listen: false);
    var homeCon = Provider.of<HomeScreenProvider>(context, listen: true);
    return Scaffold(
      key: _scaffoldKey,
      endDrawer: Drawer(
        elevation: 0,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.zero,
        ),
        child: FilterDrawer(
          onTap: () {
            if (filterCon.isCleared) {
              // Trigger the AllProduct event with default filters
              allProduct.allProductClear();
              _allProductBloc.add(AllProduct(
                  categoryId: filterCon.categoriesId,
                  search: filterCon.searchValue,
                  perPage: "10",
                  page: 1,
                  minPrice: filterCon.priceRange.start.toString(),
                  maxPrice: filterCon.priceRange.end.toString(),
                  brandId:  filterCon.brandIds,
                  availability: "",
                  sort: filterCon.shortValue,
                  type: filterCon.selectedStoreTypeIds,
                  minRating: "",
                  language: _language,
                  isFeatured: filterCon.isFeatured,
                  bestSelling: filterCon.bestSelling,
                  popularProducts: filterCon.popularProducts,
                  flashSale: filterCon.flashSale,
                  flashSaleId: filterCon.flashSaleId,
                  userLat: _userLat,
                  userLong: _userLong,
                  token: _token));
            }
            else if (filterCon.categoriesId.isNotEmpty ||
                filterCon.brandIds.isNotEmpty ||
                filterCon.shortValue.isNotEmpty ||
                filterCon.selectedStoreTypeIds.isNotEmpty||
                filterCon.selectedRating>0 ||
                filterCon.isFeatured ||
                filterCon.bestSelling ||
                filterCon.popularProducts ||
                filterCon.flashSale) {
              allProduct.allProductClear();
              _allProductBloc.add(AllProduct(
                  categoryId: filterCon.categoriesId,
                  search: "",
                  perPage: "10",
                  page: 1,
                  minPrice: filterCon.priceRange.start.toString(),
                  maxPrice: filterCon.priceRange.end.toString(),
                  brandId: filterCon.brandIds,
                  availability: "",
                  sort: filterCon.shortValue,
                  type: filterCon.selectedStoreTypeIds,
                  minRating: filterCon.selectedRating > 0
                      ? filterCon.selectedRating.toString()
                      : "",
                  language: _language,
                  isFeatured: filterCon.isFeatured,
                  bestSelling: filterCon.bestSelling,
                  popularProducts: filterCon.popularProducts,
                  flashSale: filterCon.flashSale,
                  flashSaleId: 0,
                  userLat: _userLat,
                  userLong: _userLong,
                  token: _token));
            }
            else {
              allProduct.allProductClear();
              _allProductBloc.add(AllProduct(
                  categoryId: filterCon.categoriesId,
                  search: filterCon.searchValue,
                  perPage: "10",
                  page: 1,
                  minPrice: filterCon.priceRange.start.toString(),
                  maxPrice: filterCon.priceRange.end.toString(),
                  brandId:  filterCon.brandIds,
                  availability: "",
                  sort: filterCon.shortValue,
                  type:filterCon.selectedStoreTypeIds,
                  minRating: "",
                  language: _language,
                  isFeatured: filterCon.isFeatured,
                  bestSelling: filterCon.bestSelling,
                  popularProducts: filterCon.popularProducts,
                  flashSale: filterCon.flashSale,
                  flashSaleId: filterCon.flashSaleId,
                  userLat: _userLat,
                  userLong: _userLong,
                  token: _token));
            }
            _isLoading=true;
            Navigator.pop(context);
          },
          cancel: () {
            Navigator.pop(context);
            filterCon.resetFilters();
            allProduct.allProductClear();
            _allProductBloc.add(AllProduct(
                categoryId: const [],
                search: '',
                perPage: "10",
                page: 1,
                minPrice:'',
                maxPrice: '',
                brandId: const [],
                availability: "",
                sort: "newest",
                type: const [],
                minRating: "",
                language: _language,
                isFeatured: filterCon.isFeatured,
                bestSelling: filterCon.bestSelling,
                popularProducts: filterCon.popularProducts,
                flashSale: filterCon.flashSale,
                flashSaleId: filterCon.flashSaleId,
                userLat: _userLat,
                userLong: _userLong,
                token: _token));
            _isLoading=true;
          },
        ),
      ),
      appBar: AppBar(
        leading: IconButton(
            onPressed: () {
              filterCon.resetFilters();
              filterCon.setProductType("all");
              _isInitialLoad=true;
              homeCon.setCurrentIndexHomePage(0);
            },
            icon: const Icon(
              Icons.arrow_back,
              color: Colors.white,
            )),
        title: Text(
          AppLocalizations.of(context)!.products,
          style: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(fontSize: 18.sp, fontWeight: FontWeight.w600),
        ),
        centerTitle: true,
        actions: [
          InkWell(
            onTap: () {
              _scaffoldKey.currentState?.openEndDrawer();
            },
            child: ImageIcon(
              const AssetImage(AssetsIcons.filter),
              size: 22.sp,
              color: Colors.white,
            ),
          ),
          SizedBox(
            width: 10.w,
          )
        ],
        elevation: 0,
        titleTextStyle: Theme.of(context)
            .textTheme
            .titleLarge
            ?.copyWith(fontWeight: FontWeight.w600, fontSize: 18.sp),
      ),
      body: Column(
        children: [
          SizedBox(
            height: 8.h,
          ),
          CommonCard(
            pBottom: 4,
            pTop: 4,
            pLeft: 14,
            pRight: 14,
            mHorizontal: 0,
            mVertical: 0,
            widget: CommonSearchWidget(
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
            ),
          ),
          commonProvider.isLoading
              ? BlocConsumer<FavoriteAddBloc, FavoriteAddState>(
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
                  },
                  builder: (context, state) {
                    if (_isInitialLoad && state is FavoriteAddLoading) {
                    } else if (state is FavoriteAddLoaded) {
                      WidgetsBinding.instance.addPostFrameCallback((_) {
                        _isInitialLoad = false;
                        CommonFunctions.showCustomSnackBar(
                            color: Colors.green,
                            context,
                            state.authModel.message);

                        commonProvider.setLoading(false);
                      });
                    }
                    return const SizedBox();
                  },
                )
              : const SizedBox(),
          Expanded(
              child: allProduct.allProducts.isNotEmpty
                  ? Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: ProductGrid(
                        productData: allProduct.allProducts,
                      controller: _scrollController,
                        physics: const AlwaysScrollableScrollPhysics(),
                        onFavoriteToggle: (wishlist, id) {
                          _handleFavoriteToggle(wishlist!, id);
                          allProduct.updateProductWishlist(Utils.formatInt(id), !wishlist);
                        },
                      ),
                    )
                  : _isInitialLoad||_isLoading
                      ?   const ProductLoadingGrid(itemCount: 6,)
                      : const Center(child: NoDataWidget())
          ),
          BlocConsumer<AllProductBloc, AllProductState>(
            builder: (_, state) {
              if (_isInitialLoad && state is AllProductLoading) {
                return const CircularProgressIndicator();
              }
              return Container();
            },
            listener: (context, state) {
              if (state is AllProductConnectionError) {
                CommonFunctions.showUpSnack(
                  message: AppLocalizations.of(context)!.noInternet,
                  context: context,
                );
              }
              else if (state is AllProductFailure) {
                CommonFunctions.showUpSnack(
                  message: state.allProductModel.message,
                  context: context,
                );
              }
              else if (state is AllProductLoaded) {
                if (_isInitialLoad && state.hasConnectionError) {
                  CommonFunctions.showCustomSnackBar(
                      context, AppLocalizations.of(context)!.noInternet);
                }
                  _isInitialLoad = false;
                  var data=state.allProductModel.meta;
                  if(data!=null){
                    allProduct.setAllPTotalPage(data.lastPage,data.currentPage);
                  }
                  for (var data in state.allProductModel.data!) {
                    allProduct.addAllProduct(data);
                  }
                  _isLoading=false;
              }
            },
          ),
        ],
      ),
    );
  }

  void _handleFavoriteToggle(bool wishlist, String productId) {
    var commonProvider = Provider.of<CommonProvider>(context, listen: false);
    if (_token.isEmpty) {
      CommonFunctions.showUpSnack(context: context, message: 'Please log in');
      return;
    }
    commonProvider.setLoading(true);
    _favoriteAddBloc.add(
      wishlist
          ? DeleteFavorites(productId: productId, token: _token)
          : AddFavorites(productId: productId, token: _token),
    );
  }
}