
import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:quick_ecommerce/data/data_model/h_mac_model.dart';

import '../../../data/sirvice/common_repository.dart';
import '../../../data/sirvice/connectivity_rypository.dart';
import 'hmac_generate_event.dart';
import 'hmac_generate_state.dart';

class HMacGenerateBloc extends Bloc<HMacGenerateEvent, HMacGenerateState> {
  ConnectivityRepository connectivityRepository;
  CommonRepository commonRepository;
  HMacGenerateBloc(
      {required this.connectivityRepository, required this.commonRepository})
      : super(HMacGenerateInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(HMacGenerateConnectionErrorEvent());
        }
      },
    );
    bool isFetching = false;

    //===============HMacGenerate portion================
    //--------------------------------------------
    on<HMacGenerate>(
      (event, emit) async {

        if (isFetching) return; // Prevent duplicate calls
        isFetching = true;

        if (state is HMacGenerateInitial ||
            state is HMacGenerateLoading ||
            state is HMacGenerateLoaded ||
            state is HMacGenerateConnectionError ||
            state is HMacGenerateFailure) {
          emit(
            HMacGenerateLoading(),
          );

          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.generateHMac(
                event.orderId,
                event.token,
                );
            //========== converting json to dart object ===========
            //-----------------------------------------------------
            HMacModel hMacModel = HMacModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(
                HMacGenerateLoaded(hMacModel:  HMacModel(
                  hMac: hMacModel.hMac,
                  timestamp: hMacModel.timestamp,
                 // pagination:
                ),),
              );
            }
            else {
              emit(
                HMacGenerateFailure(hMacModel: HMacModel()),
              );
            }
          } on DioException catch (_) {
            emit(
              HMacGenerateFailure(
                hMacModel: HMacModel(),
              ),
            );
          }finally {
            isFetching = false; // Reset the flag
          }
        }
      },
    );

    on<CreateStripeSession>(
          (event, emit) async {

        if (isFetching) return;
        isFetching = true;

        if (state is HMacGenerateInitial ||
            state is HMacGenerateLoading ||
            state is HMacGenerateLoaded ||
            state is HMacGenerateConnectionError ||
            state is HMacGenerateFailure) {
          emit(
            HMacGenerateLoading(),
          );

          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.createStripeSession(
              event.currencyCode,
              event.orderMasterId,
              event.token,
            );
            //========== converting json to dart object ===========
            //-----------------------------------------------------
            HMacModel hMacModel = HMacModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(
                HMacGenerateLoaded(hMacModel:  HMacModel(
                  hMac: hMacModel.hMac,
                  timestamp: hMacModel.timestamp,
                  data: hMacModel.data
                ),),
              );
            }
            else {
              emit(
                HMacGenerateFailure(hMacModel: HMacModel()),
              );
            }
          } on DioException catch (_) {
            emit(
              HMacGenerateFailure(
                hMacModel: HMacModel(),
              ),
            );
          }finally {
            isFetching = false; // Reset the flag
          }
        }
      },
    );
    on<CreateWalletStripeSession>(
          (event, emit) async {

        if (isFetching) return;
        isFetching = true;

        if (state is HMacGenerateInitial ||
            state is HMacGenerateLoading ||
            state is HMacGenerateLoaded ||
            state is HMacGenerateConnectionError ||
            state is HMacGenerateFailure) {
          emit(
            HMacGenerateLoading(),
          );

          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.createWalletStripeSession(
              event.historyId,
              event.walletId,
              event.token,
            );
            print(response);
            //========== converting json to dart object ===========
            //-----------------------------------------------------
            HMacModel hMacModel = HMacModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(
                HMacGenerateLoaded(hMacModel:  HMacModel(
                    hMac: hMacModel.hMac,
                    timestamp: hMacModel.timestamp,
                    data: hMacModel.data
                ),),
              );
            }
            else {
              emit(
                HMacGenerateFailure(hMacModel: HMacModel()),
              );
            }
          } on DioException catch (_) {
            emit(
              HMacGenerateFailure(
                hMacModel: HMacModel(),
              ),
            );
          }finally {
            isFetching = false; // Reset the flag
          }
        }
      },
    );
    //===============HMacGenerate portion================
    //--------------------------------------------
    on<WalletHMacGenerate>(
          (event, emit) async {

        if (isFetching) return; // Prevent duplicate calls
        isFetching = true;

        if (state is HMacGenerateInitial ||
            state is HMacGenerateLoading ||
            state is HMacGenerateLoaded ||
            state is HMacGenerateConnectionError ||
            state is HMacGenerateFailure) {
          emit(
            HMacGenerateLoading(),
          );

          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.walletGenerateHMac(
              event.historyId,
              event.token,
            );
            //========== converting json to dart object ===========
            //-----------------------------------------------------
            HMacModel hMacModel = HMacModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(
                HMacGenerateLoaded(hMacModel:  HMacModel(
                  hMac: hMacModel.hMac,
                  timestamp: hMacModel.timestamp,
                  // pagination:
                ),),
              );
            }
            else {
              emit(
                HMacGenerateFailure(hMacModel: HMacModel()),
              );
            }
          } on DioException catch (_) {
            emit(
              HMacGenerateFailure(
                hMacModel: HMacModel(),
              ),
            );
          }finally {
            isFetching = false; // Reset the flag
          }
        }
      },
    );



    on<HMacGenerateConnectionErrorEvent>(
      (event, emit) {
        if (state is HMacGenerateLoaded) {
          final currentState = state as HMacGenerateLoaded;
          emit(HMacGenerateLoaded(
            hMacModel: currentState.hMacModel,
            hasConnectionError: true,
          ));
        } else {
          emit(HMacGenerateConnectionError());
        }

      },
    );
  }
}
