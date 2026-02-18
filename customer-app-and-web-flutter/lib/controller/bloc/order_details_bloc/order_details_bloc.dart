
import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/data_model/order_details_model.dart';
import '../../../data/service/common_repository.dart';
import '../../../data/service/connectivity_repository.dart';
import 'order_details_event.dart';
import 'order_details_state.dart';

class OrderDetailsBloc extends Bloc<OrderDetailsEvent, OrderDetailsState> {
  ConnectivityRepository connectivityRepository;
  CommonRepository commonRepository;
  OrderDetailsBloc(
      {required this.connectivityRepository, required this.commonRepository})
      : super(OrderDetailsInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(OrderDetailsConnectionErrorEvent());
        }
      },
    );

    //===============WishList portion================
    //--------------------------------------------
    on<OrderDetails>(
          (event, emit) async {
        if (state is OrderDetailsInitial ||
            state is OrderDetailsLoading ||
            state is OrderDetailsLoaded ||
            state is OrderDetailsConnectionError ||
            state is OrderDetailsFailure) {
          emit(
            OrderDetailsLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.orderDetails(
                event.language,event.id, event.token);



            if (response.statusCode == 200) {
              //========== converting json to dart object ===========
              //-----------------------------------------------------
              OrderDetailsModel orderDetailsModel = OrderDetailsModel.fromJson(response.data);
              emit(OrderDetailsLoaded(
                  orderDetailsModel: OrderDetailsModel(
                       orderData: orderDetailsModel.orderData,
                      orderSummary: orderDetailsModel.orderSummary,
                    refund: orderDetailsModel.refund,
                    orderTracking:orderDetailsModel.orderTracking ,
                    orderPaymentTracking: orderDetailsModel.orderPaymentTracking,
                    orderRefundTracking: orderDetailsModel.orderRefundTracking,
              )));
            }  else {
              emit(
                OrderDetailsFailure(
                  orderDetailsModel: OrderDetailsModel(
                      orderData: OrderData(),
                      orderSummary: OrderSummary()
                  ),
                ),
              );
            }
          } on DioException catch (_) {
            emit(
              OrderDetailsFailure(
                orderDetailsModel: OrderDetailsModel(
                    orderData: OrderData(),
                    orderSummary: OrderSummary()
                ),
              ),
            );
          }
        }
      },
    );



    on<OrderDetailsConnectionErrorEvent>(
      (event, emit) {
        if (state is OrderDetailsLoaded) {
          final currentState = state as OrderDetailsLoaded;
          emit(OrderDetailsLoaded(
            orderDetailsModel: currentState.orderDetailsModel,
            hasConnectionError: true,
          ));
        } else {
          emit(OrderDetailsConnectionError());
        }
      },
    );
  }
}
