import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:quick_ecommerce/data/data_model/all_product_model.dart';

import '../../../config/strings.dart';
import '../../../data/data_model/featured_product_model.dart';
import '../../../data/sirvice/connectivity_rypository.dart';
import '../../../data/sirvice/product_repository.dart';
import 'featured_product_event.dart';
import 'featured_product_state.dart';

class FeaturedProductBloc extends Bloc<FeaturedProductEvent, FeaturedProductState> {
  ConnectivityRepository connectivityRepository;
  ProductRepository productRepository;
  List<ProductData> productData = [];
  FeaturedProductBloc(
      {required this.connectivityRepository, required this.productRepository})
      : super(FeaturedProductInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(FeaturedConnectionErrorEvent());
        }
      },
    );

    //===============Verify token portion================
    //--------------------------------------------
    on<FeaturedProduct>(
      (event, emit) async {
        if (state is FeaturedProductInitial ||
            state is FeaturedProductLoading ||
            state is FeaturedProductLoaded ||
            state is FeaturedProductConnectionError ||
            state is FeaturedProductFailure) {
          emit(
            FeaturedProductLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await productRepository.featuredProducts(
               event.perPage,
            event.language,
              event.userLat,
              event.userLong,
            event.token,
            );

            //========== converting json to dart object ===========
            //-----------------------------------------------------

            FeaturedProductModel productModel = FeaturedProductModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------
              productData.addAll(productModel.data);
              emit(
                FeaturedProductLoaded(
                  featuredProductModel: FeaturedProductModel(
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
                FeaturedProductLoaded(
                  featuredProductModel: FeaturedProductModel(
                    message: productModel.message,
                    data: [],
                    // pagination:
                  ),
                ),
              );
              productData = [];
            } else {
              emit(
                FeaturedProductFailure(featuredProductModel: productModel),
              );
            }
          } on DioException catch (e) {
            final errorMessage =Utils.parseDioError(e);
            emit(
              FeaturedProductFailure(
                featuredProductModel: FeaturedProductModel(
                  message: errorMessage,
                  data: [],
                ),
              ),
            );
          }
        }
      },
    );

    on<FeaturedConnectionErrorEvent>(
      (event, emit) {
        if (state is FeaturedProductLoaded) {
          final currentState = state as FeaturedProductLoaded;
          emit(FeaturedProductLoaded(
            featuredProductModel: currentState.featuredProductModel,
            hasConnectionError: true,
          ));
        } else {
          emit(FeaturedProductConnectionError());
        }
      },
    );
  }
}
