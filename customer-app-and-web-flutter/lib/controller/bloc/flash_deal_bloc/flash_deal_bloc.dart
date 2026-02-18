import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:quick_ecommerce/config/strings.dart';

import '../../../data/data_model/flush_deal_model.dart';
import '../../../data/service/connectivity_repository.dart';
import '../../../data/service/product_repository.dart';
import 'flash_deal_event.dart';
import 'flash_deal_state.dart';

class FlashDealBloc extends Bloc<FlashDealEvent, FlashDealState> {
  ConnectivityRepository connectivityRepository;
  ProductRepository productRepository;
  List<FlushData> flushData = [];
  FlashDealBloc(
      {required this.connectivityRepository, required this.productRepository})
      : super(FlashDealInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(FlashDealConnectionErrorEvent());
        }
      },
    );


    //===============WishList portion================
    //--------------------------------------------
    on<FlashDeal>(
          (event, emit) async {
        if (state is FlashDealInitial ||
            state is FlashDealLoading ||
            state is FlashDealLoaded ||
            state is FlashDealConnectionError ||
            state is FlashDealFailure) {
          emit(
            FlashDealLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await productRepository.flashDeals();

            //========== converting json to dart object ===========
            //-----------------------------------------------------

            FlashDealModel favoritesModel = FlashDealModel.fromJson(response.data);
            if (response.statusCode == 200) {
              flushData.addAll(favoritesModel.data);
              emit(
                FlashDealLoaded(flashDealModel:  FlashDealModel(
                  message: favoritesModel.message,
                  data: flushData,
                  // pagination:
                ),),
              );
              flushData=[];
            }
            else {
              emit(
                FlashDealFailure(flashDealModel: favoritesModel),
              );
            }
          } on DioException catch (e) {
            final errorMessage =Utils.parseDioError(e);
            emit(
              FlashDealFailure(
                flashDealModel: FlashDealModel(
                  message:errorMessage,
                  data: [],
                ),
              ),
            );
          }
        }
      },
    );


    on<FlashDealConnectionErrorEvent>(
      (event, emit) {
        if (state is FlashDealInitial ||
            state is FlashDealLoading ||
            state is FlashDealLoaded ||
            state is FlashDealConnectionError ||
            state is FlashDealFailure) {
          emit(
            FlashDealConnectionError(),
          );
        }
      },
    );
  }
}
