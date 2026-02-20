import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:quick_ecommerce/data/data_model/all_product_model.dart';

import '../../../data/data_model/flush_deal_product_model.dart';
import '../../../data/service/connectivity_repository.dart';
import '../../../data/service/product_repository.dart';
import 'flash_deal_product_event.dart';
import 'flash_deal_product_state.dart';

class FlashDealProductBloc extends Bloc<FlashDealProductEvent, FlashDealProductState> {
  ConnectivityRepository connectivityRepository;
  ProductRepository productRepository;
  List<ProductData> productData = [];
  FlashDealProductBloc(
      {required this.connectivityRepository, required this.productRepository})
      : super(FlashDealProductInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(FlashDealProductConnectionErrorEvent());
        }
      },
    );


    //===============WishList portion================
    //--------------------------------------------
    on<FlashDealProduct>(
          (event, emit) async {
        if (state is FlashDealProductInitial ||
            state is FlashDealProductLoading ||
            state is FlashDealProductLoaded ||
            state is FlashDealProductConnectionError ||
            state is FlashDealProductFailure) {
          emit(
            FlashDealProductLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await productRepository.flashProducts(
              event.parPage,event.page,event.language,event.token
            );

            //========== converting json to dart object ===========
            //-----------------------------------------------------

            FlashDealProductModel flashDealProductModel = FlashDealProductModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------
              productData.addAll(flashDealProductModel.data);
              emit(
                FlashDealProductLoaded(flashDealProductModel:  FlashDealProductModel(
                  message: flashDealProductModel.message,
                  data: productData,
                  meta: flashDealProductModel.meta
                  // pagination:
                ),),
              );
              productData=[];
            } else if(response.statusCode == 204){
              emit(
                FlashDealProductLoaded(flashDealProductModel:  FlashDealProductModel(
                  message: flashDealProductModel.message,
                  data: [],
                  meta: flashDealProductModel.meta
                  // pagination:
                ),),
              );
              productData=[];
            }
            else {
              emit(
                FlashDealProductFailure(flashDealProductModel: flashDealProductModel),
              );
            }
          } on DioException catch (_) {
            emit(
              FlashDealProductFailure(
                flashDealProductModel: FlashDealProductModel(
                  message: "Something went wrong",
                  data: [],
                ),
              ),
            );
          }
        }
      },
    );


    on<FlashDealProductConnectionErrorEvent>(
      (event, emit) {
        if (state is FlashDealProductLoaded) {
          final currentState = state as FlashDealProductLoaded;
          emit(FlashDealProductLoaded(
            flashDealProductModel: currentState.flashDealProductModel,
            hasConnectionError: true,
          ));
        } else {
          emit(FlashDealProductConnectionError());
        }
      },
    );
  }
}
