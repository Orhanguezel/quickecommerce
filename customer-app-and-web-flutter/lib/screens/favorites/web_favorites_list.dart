
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/data/data_model/all_product_model.dart';
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
import '../desktop_home/product_grid.dart';

class WebFavoritesList extends StatefulWidget {
  const WebFavoritesList({super.key});

  @override
  State<WebFavoritesList> createState() => _WebFavoritesListState();
}

class _WebFavoritesListState extends State<WebFavoritesList> {
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
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
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
                    const DesktopProductLoadingGrid(itemCount: 10,)
                        :DesktopProductGrid(
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
                        : DesktopProductGrid(
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
                  return Container();
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


