
import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/extra_charge_bloc/extra_charge_event.dart';
import 'package:quick_ecommerce/controller/bloc/extra_charge_bloc/extra_charge_state.dart';

import '../../../data/data_model/extra_charge_model.dart';
import '../../../data/sirvice/common_repository.dart';
import '../../../data/sirvice/connectivity_rypository.dart';


class ExtraChargeBloc extends Bloc<ExtraChargeEvent, ExtraChargeState> {
  ConnectivityRepository connectivityRepository;
  CommonRepository commonRepository;
   final  List<FlashSaleProduct> product=[];
   final  List<FlashSale> flashSale=[];
  ExtraChargeBloc(
      {required this.connectivityRepository, required this.commonRepository})
      : super(ExtraChargeInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(ExtraChargeConnectionErrorEvent());
        }
      },
    );
    bool isFetching = false; // Add a flag to track API calls

    //===============Verify token portion================
    //--------------------------------------------
    on<ExtraChargeData>(
      (event, emit) async {

        if (isFetching) return; // Prevent duplicate calls
        isFetching = true;

        if (state is ExtraChargeInitial ||
            state is ExtraChargeLoading ||
            state is ExtraChargeLoaded ||
            state is ExtraChargeConnectionError ||
            state is ExtraChargeFailure) {
          emit(
            ExtraChargeLoading(),
          );

          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.extraCharge(
              event.productIds
            );
            if (response.data == null || response.data.isEmpty) {
              throw Exception("Empty or null response from API");
            }

            //========== converting json to dart object ===========
            //-----------------------------------------------------


            ExtraChargeModel extraChargeModel = ExtraChargeModel.fromJson(response.data);
            product.addAll(extraChargeModel.flashSaleProducts!);
            flashSale.addAll(extraChargeModel.flashSale!);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------
              emit(
                ExtraChargeLoaded(extraChargeModel:  ExtraChargeModel(
                  flashSaleProducts: product,
                 flashSale: flashSale,
                 additionalCharge:extraChargeModel.additionalCharge ,
                 orderIncludeTaxAmount: extraChargeModel.orderIncludeTaxAmount,

                 // pagination:
                ),),
              );

            }
            else if(response.statusCode == 204){
              emit(
                ExtraChargeLoaded(extraChargeModel:  ExtraChargeModel(
                  flashSaleProducts: [],

                  // pagination:
                ),),
              );
            }
            else {
              emit(
                ExtraChargeFailure(extraChargeModel: extraChargeModel),
              );
            }
          } on DioException catch (_) {
            emit(
              ExtraChargeFailure(
                extraChargeModel: ExtraChargeModel(),
              ),
            );
          }finally {
            isFetching = false; // Reset the flag
          }
        }
      },
    );

    on<ExtraChargeConnectionErrorEvent>(
      (event, emit) {
        if (state is ExtraChargeInitial ||
            state is ExtraChargeLoading ||
            state is ExtraChargeLoaded ||
            state is ExtraChargeConnectionError ||
            state is ExtraChargeFailure) {
          emit(
            ExtraChargeConnectionError(),
          );
        }
      },
    );
  }
}
