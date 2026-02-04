import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../config/strings.dart';
import '../../../data/data_model/login_model.dart';
import '../../../data/sirvice/connectivity_rypository.dart';
import '../../../data/sirvice/save_repository.dart';
import 'cancel_order_event.dart';
import 'cancel_order_state.dart';

class CancelOrderBloc extends Bloc<CancelOrderEvent,CancelOrderState> {
  ConnectivityRepository connectivityRepository;
  SaveRepository saveRepository;
  CancelOrderBloc({required this.connectivityRepository, required this.saveRepository})
      : super(CancelOrderInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(CancelOrderConnectionErrorEvent());
        }
      },
    );

    //===============Order Cancel portion================
    //--------------------------------------------
    on<OrderCancel>(
          (event, emit) async {
        if (state is CancelOrderInitial ||
            state is CancelOrderLoading ||
            state is CancelOrderLoaded ||
            state is CancelOrderConnectionError ||
            state is CancelOrderFailure) {
          emit(
            CancelOrderLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response =
            await saveRepository.cancelOrder(event.orderId, event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------
              emit(
                CancelOrderLoaded(authModel: authModel),
              );
            } else if(response.statusCode == 401) {
              emit(
                CancelOrderTokenExp(),
              );
            }else {
              emit(
                CancelOrderFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                CancelOrderTokenExp(),
              );
            }
            final errorMessage =Utils.parseDioError(e);
            emit(
              CancelOrderFailure(
                authModel: AuthModel(
                  statusCode: 000,
                  message:errorMessage,
                  status: false,
                  role: null,
                ),
              ),
            );
          }
        }
      },
    );

    on<CancelOrderConnectionErrorEvent>(
      (event, emit) {
        if (state is CancelOrderLoaded) {
          final currentState = state as CancelOrderLoaded;
          emit(CancelOrderLoaded(
            authModel: currentState.authModel,
            hasConnectionError: true,
          ));
        } else {
          emit(CancelOrderConnectionError());
        }
      },
    );
  }
}
