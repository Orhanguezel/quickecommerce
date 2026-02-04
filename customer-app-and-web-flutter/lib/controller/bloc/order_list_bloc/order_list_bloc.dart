import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:quick_ecommerce/data/data_model/all_product_model.dart';
import '../../../config/strings.dart';
import '../../../data/data_model/order_list.dart';
import '../../../data/sirvice/common_repository.dart';
import '../../../data/sirvice/connectivity_rypository.dart';
import 'order_list_event.dart';
import 'order_list_state.dart';

class OrderListBloc extends Bloc<OrderListEvent, OrderListState> {
  ConnectivityRepository connectivityRepository;
  CommonRepository commonRepository;
  List<OrderData> orderData = [];
  OrderListBloc(
      {required this.connectivityRepository, required this.commonRepository})
      : super(OrderListInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(OrderListConnectionErrorEvent());
        }
      },
    );

    //===============WishList portion================
    //--------------------------------------------
    on<OrderList>(
      (event, emit) async {
        if (state is OrderListInitial ||
            state is OrderListLoading ||
            state is OrderListLoaded ||
            state is OrderListConnectionError ||
            state is OrderListFailure) {
          emit(
            OrderListLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.orderList(
                event.language, event.status, event.page, event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            if (response.statusCode == 200) {
              final orderListModel = Utils.parseApiResponse(response.data, OrderListModel.fromJson);

              if (orderListModel == null) {
                return;
              }
              orderData.addAll(orderListModel.data!);
              emit(OrderListLoaded(
                  orderListModel: OrderListModel(
                      data: orderData,
                      meta: orderListModel.meta,
                      message: '')));
              orderData = [];
            } else {
              emit(
                OrderListFailure(
                  orderListModel: OrderListModel(
                    message: '',
                    data: [],
                    meta: Meta(),
                  ),
                ),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                OrderListTokenExp(),
              );
            }
            final errorMessage =Utils.parseDioError(e);
            emit(
              OrderListFailure(
                orderListModel: OrderListModel(
                  message: errorMessage,
                  data: [],
                  meta: Meta(),
                ),
              ),
            );
          }
        }
      },
    );

    on<OrderListConnectionErrorEvent>(
      (event, emit) {
        if (state is OrderListLoaded) {
          final currentState = state as OrderListLoaded;
          emit(OrderListLoaded(
            orderListModel: currentState.orderListModel,
            hasConnectionError: true,
          ));
        } else {
          emit(OrderListConnectionError());
        }
      },
    );
  }
}
