import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../data/data_model/payment_gateways_model.dart';
import '../../../data/data_model/product_details_settings_model.dart';
import '../../../data/service/common_repository.dart';
import '../../../data/service/connectivity_repository.dart';
import 'payment_gateways_event.dart';
import 'payment_gateways_state.dart';

class PaymentGatewaysBloc
    extends Bloc<PaymentGatewaysEvent, PaymentGatewaysState> {
  ConnectivityRepository connectivityRepository;
  CommonRepository commonRepository;
  List<PaymentGateway> paymentGet = [];
  PaymentGatewaysBloc(
      {required this.connectivityRepository, required this.commonRepository})
      : super(PaymentGatewaysInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(PaymentGatewaysConnectionErrorEvent());
        }
      },
    );

    //===============Verify token portion================
    //--------------------------------------------
    on<PaymentGateways>(
      (event, emit) async {
        if (state is PaymentGatewaysInitial ||
            state is PaymentGatewaysLoading ||
            state is PaymentGatewaysLoaded ||
            state is PaymentGatewaysConnectionError ||
            state is PaymentGatewaysFailure) {
          emit(
            PaymentGatewaysLoading(),
          );

          try {
            //============ calling the api ============
            //-----------------------------------------

            final response =
                await commonRepository.getPaymentGateways();

            //========== converting json to dart object ===========
            //-----------------------------------------------------
            PaymentGatewaysModel transactionModel =
            PaymentGatewaysModel.fromJson(response.data);
            if (response.statusCode == 200) {
              paymentGet.addAll(transactionModel.paymentGateways);

              emit(
                PaymentGatewaysLoaded(
                  paymentGatewaysModel: PaymentGatewaysModel(
                      paymentGateways: paymentGet
                  ),
                ),
              );
              paymentGet = [];
            }
           else {
              emit(
                PaymentGatewaysFailure(
                    paymentGatewaysModel:  PaymentGatewaysModel(
                        paymentGateways: []
                    ),),
              );
            }
          } on DioException catch (_) {
            emit(
              PaymentGatewaysFailure(
                paymentGatewaysModel:  PaymentGatewaysModel(
                    paymentGateways: []
                ),
              ),
            );
          }
        }
      },
    );


    //===============Verify token portion================
    //--------------------------------------------
    on<ProductDetailsSetting>(
          (event, emit) async {
        if (state is PaymentGatewaysInitial ||
            state is PaymentGatewaysLoading ||
            state is ProductDetailsSettingLoaded ||
            state is PaymentGatewaysConnectionError ||
            state is PaymentGatewaysFailure) {
          emit(
            PaymentGatewaysLoading(),
          );

          try {
            //============ calling the api ============
            //-----------------------------------------

            final response =
            await commonRepository.productDetailsSetting(event.language);
            //========== converting json to dart object ===========
            //-----------------------------------------------------
            ProductDetailsSettingsModel productDetailsSettingsModel =
            ProductDetailsSettingsModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(
                ProductDetailsSettingLoaded(
                  productDetailsSettingsModel: ProductDetailsSettingsModel(
                      data: productDetailsSettingsModel.data
                  ),
                ),
              );
            } else if (response.statusCode == 204) {
              emit(
                ProductDetailsSettingLoaded(
                  productDetailsSettingsModel:  ProductDetailsSettingsModel(
                      data:productDetailsSettingsModel.data
                  ),
                ),
              );
            } else {
              emit(
                PaymentGatewaysFailure(
                  paymentGatewaysModel:  PaymentGatewaysModel(
                      paymentGateways: []
                  ),),
              );
            }
          } on DioException catch (_) {
            emit(
              PaymentGatewaysFailure(
                paymentGatewaysModel:  PaymentGatewaysModel(
                    paymentGateways: []
                ),
              ),
            );
          }
        }
      },
    );

    on<PaymentGatewaysConnectionErrorEvent>(
      (event, emit) {
        if (state is PaymentGatewaysLoaded) {
          final currentState = state as PaymentGatewaysLoaded;
          emit(PaymentGatewaysLoaded(
            paymentGatewaysModel: currentState.paymentGatewaysModel,
            hasConnectionError: true,
          ));
        } else {
          emit(PaymentGatewaysConnectionError());
        }
      },
    );
  }
}
