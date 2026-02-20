import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../config/strings.dart';
import '../../../data/data_model/product_details_model.dart';
import '../../../data/service/connectivity_repository.dart';
import '../../../data/service/product_repository.dart';
import 'product_details_event.dart';
import 'product_details_state.dart';

class ProductDetailsBloc extends Bloc<ProductDetailsEvent, ProductDetailsState> {
  ConnectivityRepository connectivityRepository;
  ProductRepository productRepository;
  List<Product> productData = [];
  List<RelatedProduct> relatedProduct = [];
  ProductDetailsBloc(
      {required this.connectivityRepository, required this.productRepository})
      : super(ProductDetailsInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(ProductDetailsConnectionErrorEvent());
        }
      },
    );


    //===============All product portion================
    //--------------------------------------------
    on<ProductDetails>(
          (event, emit) async {
        if (state is ProductDetailsInitial ||
            state is ProductDetailsLoading ||
            state is ProductDetailsLoaded ||
            state is ProductDetailsConnectionError ||
            state is ProductDetailsFailure) {
          emit(
            ProductDetailsLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await productRepository.productDetails(
                event.slug,
                event.language,
                event.token,
               );
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            ProductDetailsModel productDetailsModel = ProductDetailsModel.fromJson(response.data);
            if (response.statusCode == 200) {
              relatedProduct.clear();
              relatedProduct.addAll(productDetailsModel.relatedProducts!);
              emit(
                ProductDetailsLoaded(productDetailsModel:  ProductDetailsModel(
                  message: productDetailsModel.message,
                  data: productDetailsModel.data,
                  relatedProducts:relatedProduct
                  // pagination:
                ),),
              );
            } else if(response.statusCode == 204){
              emit(
                ProductDetailsLoaded(productDetailsModel:  ProductDetailsModel(
                  message: productDetailsModel.message,
                  data: Product(),
                  // pagination:
                ),),
              );
              productData=[];
            }
            else {
              emit(
                ProductDetailsFailure(productDetailsModel: productDetailsModel),
              );
            }
          } on DioException catch (e) {
            final errorMessage =Utils.parseDioError(e);
            emit(
              ProductDetailsFailure(
                productDetailsModel: ProductDetailsModel(
                  message:errorMessage,
                  data: Product(),
                ),
              ),
            );
          }
        }
      },
    );

    on<ProductDetailsConnectionErrorEvent>(
      (event, emit) {
        if (state is ProductDetailsLoaded) {
          final currentState = state as ProductDetailsLoaded;
          emit(ProductDetailsLoaded(
            productDetailsModel: currentState.productDetailsModel,
            hasConnectionError: true,
          ));
        } else {
          emit(ProductDetailsConnectionError());
        }
      },
    );
  }
}
