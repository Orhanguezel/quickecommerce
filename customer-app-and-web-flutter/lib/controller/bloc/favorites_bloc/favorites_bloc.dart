import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/data_model/all_product_model.dart';
import '../../../data/data_model/favorites_model.dart';
import '../../../data/data_model/store_model.dart';
import '../../../data/sirvice/connectivity_rypository.dart';
import '../../../data/sirvice/product_repository.dart';
import 'favorites_event.dart';
import 'favorites_state.dart';

class FavoritesBloc extends Bloc<FavoritesEvent, FavoritesState> {
  ConnectivityRepository connectivityRepository;
  ProductRepository productRepository;
  List<ProductData> productData = [];

  FavoritesBloc(
      {required this.connectivityRepository, required this.productRepository})
      : super(FavoritesInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(FavoritesConnectionErrorEvent());
        }
      },
    );


    //===============WishList portion================
    //--------------------------------------------
    on<WishList>(
          (event, emit) async {
        if (state is FavoritesInitial ||
            state is FavoritesLoading ||
            state is FavoritesLoaded ||
            state is FavoritesConnectionError ||
            state is FavoritesFailure) {
          emit(
            FavoritesLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await productRepository.wishList(
              event.token
            );
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            FavoritesModel favoritesModel = FavoritesModel.fromJson(response.data);
            if (response.statusCode == 200) {
              productData.addAll(favoritesModel.wishlist!);
              emit(
                FavoritesLoaded(favoritesModel:  FavoritesModel(

                  wishlist: productData,
                  // pagination:
                ),),
              );
              productData=[];
            } else if(response.statusCode == 204){
              emit(
                FavoritesLoaded(favoritesModel:  FavoritesModel(
                  wishlist: [],
                  // pagination:
                ),),
              );
              productData=[];
            }else if(response.statusCode == 401){
              emit(
                FavoritesTokenExp(),
              );
            }
            else {
              emit(
                FavoritesFailure(favoritesModel: favoritesModel),
              );
            }
          } on DioException catch (_) {

            emit(
              FavoritesFailure(
                favoritesModel: FavoritesModel(
                  wishlist: [],
                ),
              ),
            );
          }
        }
      },
    );


    //===============All product portion================
    //--------------------------------------------
    on<StoreType>(
          (event, emit) async {
        if (state is FavoritesInitial ||
            state is FavoritesLoading ||
            state is FavoritesLoaded ||
            state is FavoritesConnectionError ||
            state is FavoritesFailure) {
          emit(
            FavoritesLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await productRepository.storeType();
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            List<StoreTypeModel> storeTypeList = storeTypeModelFromJson(jsonEncode(response.data));
            if (response.statusCode == 200) {

              emit(
                StoreTypeLoaded(storeTypeModel: storeTypeList),
              );

            }else{
              emit(
                StoreTypeFailure(
                  storeTypeModel:storeTypeList,
                ),
              );
            }
          }
          on DioException catch (_) {
            emit(
              const StoreTypeFailure(
                storeTypeModel:[],
              ),
            );
          }
        }
      },
    );



    on<FavoritesConnectionErrorEvent>(
      (event, emit) {
        if (state is FavoritesLoaded) {
          final currentState = state as FavoritesLoaded;
          emit(FavoritesLoaded(
            favoritesModel: currentState.favoritesModel,
            hasConnectionError: true,
          ));
        } else {
          emit(FavoritesConnectionError());
        }
      },
    );
  }
}
