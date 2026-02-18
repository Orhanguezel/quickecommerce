

import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/delivery_charge_bloc/delivery_charge_event.dart';

import 'package:quick_ecommerce/controller/bloc/delivery_charge_bloc/delivery_charge_state.dart';

import '../../../data/data_model/delivery_charge_model.dart';
import '../../../data/service/common_repository.dart';
import '../../../data/service/connectivity_repository.dart';


class DeliveryChargeBloc extends Bloc<DeliveryChargeEvent, DeliveryChargeState> {
  ConnectivityRepository connectivityRepository;
  CommonRepository commonRepository;
  DeliveryChargeBloc(
      {required this.connectivityRepository, required this.commonRepository})
      : super(DeliveryChargeInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(DeliveryChargeConnectionErrorEvent());
        }
      },
    );
    bool isFetching = false; // Add a flag to track API calls

    //===============Verify token portion================
    //--------------------------------------------
    on<DeliveryCharge>(
      (event, emit) async {
        if (isFetching) return; // Prevent duplicate calls
        isFetching = true;

        if (state is DeliveryChargeInitial ||
            state is DeliveryChargeLoading ||
            state is DeliveryChargeLoaded ||
            state is DeliveryChargeConnectionError ||
            state is DeliveryChargeFailure) {
          emit(
            DeliveryChargeLoading(),
          );

          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.deliveryCharge(
              event.ariaIds,
              event.cLatitude,
              event.cLongitude,
            );
            if (response.data == null || response.data.isEmpty) {
              throw Exception("Empty or null response from API");
            }

            //========== converting json to dart object ===========
            //-----------------------------------------------------
            final List<dynamic> responseData = response.data;

            final List<DeliveryChargeModel> deliveryChargeList =
            responseData.map((json) => DeliveryChargeModel.fromJson(json)).toList();
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------
              emit(
                DeliveryChargeLoaded(
                  deliveryChargeModel: deliveryChargeList,
                ),
              );
            } else {
              emit(
                const DeliveryChargeFailure(deliveryChargeModel: []),
              );
            }
          } on DioException catch (_) {
            emit(
              const DeliveryChargeFailure(
                deliveryChargeModel: [],
              ),
            );
          } finally {
            isFetching = false; // Reset the flag
          }
        }
      },
    );

    on<DeliveryChargeConnectionErrorEvent>(
      (event, emit) {
        if (state is DeliveryChargeInitial ||
            state is DeliveryChargeLoading ||
            state is DeliveryChargeLoaded ||
            state is DeliveryChargeConnectionError ||
            state is DeliveryChargeFailure) {
          emit(
            DeliveryChargeConnectionError(),
          );
        }
      },
    );
  }
}
