import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../config/strings.dart';
import '../../../data/data_model/all_product_model.dart';

import '../../../data/service/connectivity_repository.dart';
import '../../../data/service/product_repository.dart';
import 'all_product_event.dart';
import 'all_product_state.dart';

class AllProductBloc extends Bloc<AllProductEvent, AllProductState> {
  ConnectivityRepository connectivityRepository;
  ProductRepository productRepository;
  List<ProductData> productData = [];
  AllProductBloc(
      {required this.connectivityRepository, required this.productRepository})
      : super(AllProductInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(SaveConnectionErrorEvent());
        }
      },
    );


    //===============All product portion================
    //--------------------------------------------
    on<AllProduct>(
          (event, emit) async {
        if (state is AllProductInitial ||
            state is AllProductLoading ||
            state is AllProductLoaded ||
            state is AllProductConnectionError ||
            state is AllProductFailure) {
          emit(
            AllProductLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------
            final response = await productRepository.allProduct(
                event.categoryId,
                event.search,
                event.perPage,
                event.page,
                event.minPrice,
                event.maxPrice,
                event.brandId,
                event.availability,
                event.sort,
                event.type,
                event.minRating,
                event.language,
                event.isFeatured,
                event.bestSelling,
                event.popularProducts,
                event.flashSale,
                event.flashSaleId,
                event.userLat,
                event.userLong,
                event.token,
               );
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AllProductModel productModel = AllProductModel.fromJson(response.data);

            if (response.statusCode == 200) {

              productData.addAll(productModel.data!);
              emit(
                AllProductLoaded(allProductModel:  AllProductModel(
                  message: productModel.message,
                  data: productData,
                  meta: productModel.meta
                  // pagination:
                ),),
              );
              productData=[];
            }
            else {
              emit(
                AllProductFailure(allProductModel: productModel),
              );
            }
          } on DioException catch (e) {
            final errorMessage =Utils.parseDioError(e);
            emit(
              AllProductFailure(
                allProductModel: AllProductModel(
                  message: errorMessage,
                  data: [],
                ),
              ),
            );
          }
        }
      },
    );
    on<SaveConnectionErrorEvent>(
      (event, emit) {
        if (state is AllProductLoaded) {
          final currentState = state as AllProductLoaded;
          emit(AllProductLoaded(
            allProductModel: currentState.allProductModel,
            hasConnectionError: true,
          ));
        } else {
          emit(AllProductConnectionError());
        }
      },
    );
  }
}
