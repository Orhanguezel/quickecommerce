
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/data/data_model/all_product_model.dart';
import 'package:quick_ecommerce/screens/home/product_grid.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/favorite_add_bloc/favorite_add_bloc.dart';
import '../../controller/bloc/favorite_add_bloc/favorite_add_event.dart';
import '../../controller/bloc/favorite_add_bloc/favorite_add_state.dart';
import '../../controller/bloc/favorites_bloc/favorites_bloc.dart';
import '../../controller/bloc/favorites_bloc/favorites_event.dart';
import '../../controller/bloc/favorites_bloc/favorites_state.dart';
import '../../controller/bloc/refresh_token/refresh_token_bloc.dart';
import '../../controller/provider/common_provider.dart';
import '../../l10n/app_localizations.dart';
import '../../router/route_name.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/no_data_widget.dart';

class FavoritesListScreen extends StatefulWidget {
  const FavoritesListScreen({super.key});

  @override
  State<FavoritesListScreen> createState() => _FavoritesListScreenState();
}

class _FavoritesListScreenState extends State<FavoritesListScreen> {
  late final FavoritesBloc _favoritesBloc;
  late final FavoriteAddBloc _favoriteAddBloc;
  late final RefreshTokenBloc _refreshTokenBloc;
  String _token = '';
  getUserRout() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    _token = token ?? "";
    _favoritesBloc.add(WishList(token: _token));
  }

  @override
  void initState() {
    _favoritesBloc = context.read<FavoritesBloc>();
    _favoriteAddBloc = context.read<FavoriteAddBloc>();
    _refreshTokenBloc = context.read<RefreshTokenBloc>();
    getUserRout();
    super.initState();
  }
  bool isInitialLoad = true;

  List<ProductData> favoriteList=[];

  @override
  Widget build(BuildContext context) {
    var commonProvider = Provider.of<CommonProvider>(context);
    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
        title: Text(AppLocalizations.of(context)!.myWishlist,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontSize: 18.sp,fontWeight: FontWeight.w600
          ),
        ),
      ),
      body: Padding(
        padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 8.h),
        child: Column(
          children: [
            commonProvider.isLoading?
            BlocListener<FavoriteAddBloc, FavoriteAddState>(
              listener: (context, state) {
                if (state is FavoriteAddConnectionError) {
                  CommonFunctions.showCustomSnackBar(
                      context, AppLocalizations.of(context)!.noInternet
                  );
                    commonProvider.setLoading(false);
                }
                else if (state is FavoriteAddLoaded) {
                    CommonFunctions.showUpSnack(
                      context: context,
                      message: state.authModel.message,
                    );
                    _favoritesBloc.add(WishList(token: _token));
                    commonProvider.setLoading(false);
                }
                else if (state is FavoriteAddFailure) {
                  CommonFunctions.showCustomSnackBar(
                      context, state.authModel.message
                  );
                  commonProvider.setLoading(false);
                }
              },
              child: const SizedBox.shrink(),
            )
                :const SizedBox(),
            Expanded(
              child: BlocConsumer<FavoritesBloc, FavoritesState>(
                builder: (_, state) {
                  if (state is FavoritesLoading) {
                    return isInitialLoad?
                    const ProductLoadingGrid(itemCount: 6,)
                        :ProductGrid(
                      productData: favoriteList,
                      physics: const AlwaysScrollableScrollPhysics(),
                      onFavoriteToggle: (wishlist, id) {
                        _favoriteAddBloc.add(
                          DeleteFavorites(
                            productId: id,
                            token: _token,
                          ),
                        );
                        commonProvider.setLoading(true);
                        favoriteList.removeWhere((item) => item.id == id);
                      },
                    );
                  }
                  if (state is FavoritesTokenExp) {
                    CommonFunctions.checkTokenAndProceeds(
                      refreshTokenBloc: _refreshTokenBloc,
                      onProceed:() async {
                        _favoritesBloc.add(WishList(token: _token));
                      },
                        onLogout: ()async{
                          context.goNamed(RouteNames.loginScreen);
                        }
                    );
                  }
                  if (state is FavoritesLoaded) {
                    if (isInitialLoad && state.hasConnectionError) {
                      CommonFunctions.showCustomSnackBar(
                          context, AppLocalizations.of(context)!.noInternet
                      );
                    }
                    isInitialLoad = false;
                    final data =state.favoritesModel.wishlist;
                    if(data!=null&&data.isNotEmpty){
                      for (var item in data) {
                        if (!favoriteList.contains(item)) {
                          favoriteList.add(item);
                        }
                      }
                    }

                    return  data!.isEmpty
                        ? const Center(child: NoDataWidget())
                        : ProductGrid(
                      productData: data,
                      physics: const AlwaysScrollableScrollPhysics(),
                      onFavoriteToggle: (wishlist, id) {
                        _favoriteAddBloc.add(
                          DeleteFavorites(
                            productId: id,
                            token: _token,
                          ),
                        );
                        commonProvider.setLoading(true);
                      },
                    );
                  }
                  return  const Center(child: NoDataWidget());
                },
                listener: (context, state) {
                  if (state is FavoritesConnectionError) {
                    CommonFunctions.showUpSnack(
                      message: AppLocalizations.of(context)!.noInternet,
                      context: context,
                    );
                  } else if (state is FavoritesFailure) {
                    CommonFunctions.showUpSnack(
                      message: "Something went wrong",
                      context: context,
                    );
                  }
                },
              ),
            ),
          ],
        )
      ),
    );
  }
}