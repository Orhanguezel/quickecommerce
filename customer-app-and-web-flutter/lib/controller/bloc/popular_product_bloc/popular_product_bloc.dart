import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:quick_ecommerce/data/data_model/all_product_model.dart';

import '../../../data/data_model/popular_products_model.dart';
import '../../../data/service/connectivity_repository.dart';
import '../../../data/service/product_repository.dart';
import 'popular_product_event.dart';
import 'popular_product_state.dart';

class PopularProductBloc extends Bloc<PopularProductEvent, PopularProductState> {
  ConnectivityRepository connectivityRepository;
  ProductRepository productRepository;
  List<ProductData> productData = [];
  PopularProductBloc(
      {required this.connectivityRepository, required this.productRepository})
      : super(PopularProductInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(SaveConnectionErrorEvent());
        }
      },
    );

    //===============Verify token portion================
    //--------------------------------------------
    on<PopularProduct>(
      (event, emit) async {
        if (state is PopularProductInitial ||
            state is PopularProductLoading ||
            state is PopularProductLoaded ||
            state is PopularProductConnectionError ||
            state is PopularProductFailure) {
          emit(
            PopularProductLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await productRepository.popularProducts(
                event.id, event.categoryId, event.brandId, event.perPage,
            event.language,event.userLat,
              event.userLong,
            event.token,
            );
            // print(response);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            PopularProductsModel productModel = PopularProductsModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------
              productData.addAll(productModel.data);
              emit(
                PopularProductLoaded(
                  popularProductsModel: PopularProductsModel(
                    message: productModel.message,
                    data: productData,
                    meta: productModel.meta,
                    // pagination:
                  ),
                ),
              );
              productData = [];
            } else if (response.statusCode == 204) {
              emit(
                PopularProductLoaded(
                  popularProductsModel: PopularProductsModel(
                    message: productModel.message,
                    data: [],
                    meta:Meta(),
                    // pagination:
                  ),
                ),
              );
              productData = [];
            } else {
              emit(
                PopularProductFailure(popularProductsModel: productModel),
              );
            }
          } on DioException catch (_) {
            emit(
              PopularProductFailure(
                popularProductsModel: PopularProductsModel(
                  message: "SomeThing went wring",
                  data: [],
                  meta:Meta()
                ),
              ),
            );
          }
        }
      },
    );

    on<SaveConnectionErrorEvent>(
      (event, emit) {
        if (state is PopularProductLoaded) {
          final currentState = state as PopularProductLoaded;
          emit(PopularProductLoaded(
            popularProductsModel: currentState.popularProductsModel,
            hasConnectionError: true,
          ));
        } else {
          emit(PopularProductConnectionError());
        }
      },
    );
  }
}
