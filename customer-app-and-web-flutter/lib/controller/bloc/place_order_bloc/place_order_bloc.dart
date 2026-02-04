import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../config/strings.dart';
import '../../../data/data_model/login_model.dart';
import '../../../data/sirvice/connectivity_rypository.dart';
import '../../../data/sirvice/save_repository.dart';
import 'place_order_event.dart';
import 'place_order_state.dart';

class PlaceOrderBloc extends Bloc<PlaceOrderEvent,PlaceOrderState> {
  ConnectivityRepository connectivityRepository;
  SaveRepository saveRepository;
  PlaceOrderBloc({required this.connectivityRepository, required this.saveRepository})
      : super(PlaceOrderInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(PlaceOrderConnectionErrorEvent());
        }
      },
    );


    //===============Place Order portion================
    //--------------------------------------------
    on<PlaceOrder>(
          (event, emit) async {
        if (state is PlaceOrderInitial ||
            state is PlaceOrderLoading ||
            state is PlaceOrderLoaded ||
            state is PlaceOrderConnectionError ||
            state is PlaceOrderFailure) {
          emit(
            PlaceOrderLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await saveRepository.placeOrder(
                event.latitude,
                event.longitude,
                event.addressId,
                event.name,
                event.email,
                event.contactNumber,
                event.paymentGateway,
                event.comment,
                event.couponCode,
                event.currencyCode,
                event.packages,
                event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(
                PlaceOrderLoaded(
                    authModel: AuthModel(
                        order: authModel.order,
                        message: authModel.message,
                        orderMaster: authModel.orderMaster)),
              );
            } else {
              emit(
                PlaceOrderFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                PlaceOrderTokenExp(),
              );
            }
            final errorMessage =Utils.parseDioError(e);
            emit(
              PlaceOrderFailure(
                authModel: AuthModel(
                  statusCode: 000,
                  message:errorMessage,
                  status: false,
                ),
              ),
            );
          }
        }
      },
    );

    on<PlaceOrderConnectionErrorEvent>(
      (event, emit) {
        if (state is PlaceOrderLoaded) {
          final currentState = state as PlaceOrderLoaded;
          emit(PlaceOrderLoaded(
            authModel: currentState.authModel,
            hasConnectionError: true,
          ));
        } else {
          emit(PlaceOrderConnectionError());
        }
      },
    );
  }
}
