
import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../config/strings.dart';
import '../../../data/data_model/all_product_model.dart';
import '../../../data/data_model/best_sale_model.dart';
import '../../../data/sirvice/connectivity_rypository.dart';
import '../../../data/sirvice/product_repository.dart';
import 'best_saleing_event.dart';
import 'best_saleing_state.dart';

class BestSaleBloc extends Bloc<BestSaleEvent,BestSaleState> {
  ConnectivityRepository connectivityRepository;
  ProductRepository productRepository;
  List<ProductData> bestItemData = [];
  BestSaleBloc(
      {required this.connectivityRepository, required this.productRepository})
      : super(BestSaleInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(MoveToLoveConnectionErrorEvent());
        }
      },
    );


    bool isFetching = false; // Add a flag to track API calls

    //===============Verify token portion================
    //--------------------------------------------
    on<BestSale>(
      (event, emit) async {
        if (isFetching) return; // Prevent duplicate calls
        isFetching = true;
        if (state is BestSaleInitial ||
            state is BestSaleLoading ||
            state is BestSaleLoaded ||
            state is BestSaleConnectionError ||
            state is BestSaleFailure) {
          emit(
            BestSaleLoading(),
          );

          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await productRepository.bestSale(
                event.id,
                event.categoryId,
                event.brandId,
                event.limit,
                event.language,
                event.userLat,
                event.userLong,
                event.token,
                );
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            BestSaleModel bestSaleModel = BestSaleModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------
              bestItemData.addAll(bestSaleModel.data!);
              emit(
                BestSaleLoaded(bestSaleModel:  BestSaleModel(
                  message: bestSaleModel.message,
                  data: bestItemData,
                 // pagination:
                ),),
              );
              bestItemData=[];
            }
            else if(response.statusCode == 204){
              emit(
                BestSaleLoaded(bestSaleModel:  BestSaleModel(
                  message: bestSaleModel.message,
                  data: [],
                  // pagination:
                ),),
              );
              bestItemData=[];
            }
            else {
              emit(
                BestSaleFailure(bestSaleModel: bestSaleModel),
              );
            }
          }on DioException catch (e) {
            final errorMessage =Utils.parseDioError(e);
            emit(
              BestSaleFailure(
                bestSaleModel: BestSaleModel(
                  message:errorMessage,
                 data: [],
                ),
              ),
            );
          }finally {
            isFetching = false; // Reset the flag
          }
        }
      },
    );

    on<MoveToLoveConnectionErrorEvent>(
      (event, emit) {
        if (state is BestSaleLoaded) {
          final currentState = state as BestSaleLoaded;
          emit(BestSaleLoaded(
            bestSaleModel: currentState.bestSaleModel,
            hasConnectionError: true,
          ));
        }
        else {
          emit(BestSaleConnectionError ());
        }
      },
    );
  }
}


