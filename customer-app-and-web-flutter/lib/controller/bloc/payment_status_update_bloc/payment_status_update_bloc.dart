
import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../config/strings.dart';
import '../../../data/data_model/login_model.dart';
import '../../../data/service/connectivity_repository.dart';
import '../../../data/service/save_repository.dart';
import 'payment_status_update_event.dart';
import 'payment_status_update_state.dart';

class PaymentStatusUpdateBloc extends Bloc<PaymentStatusUpdateEvent, PaymentStatusUpdateState> {
  ConnectivityRepository connectivityRepository;
  SaveRepository saveRepository;
  PaymentStatusUpdateBloc({required this.connectivityRepository, required this.saveRepository})
      : super(PaymentStatusUpdateInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(PaymentStatusUpdateConnectionErrorEvent());
        }
      },
    );

    on<DepositUpdate>(
          (event, emit) async {
        if (state is PaymentStatusUpdateInitial ||
            state is PaymentStatusUpdateLoading ||
            state is PaymentStatusUpdateLoaded ||
            state is PaymentStatusUpdateConnectionError ||
            state is PaymentStatusUpdateFailure) {
          emit(
            PaymentStatusUpdateLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await saveRepository.depositUpdate(
                event.walletHistoryId,
                event.transactionId,
                event.transactionDetails,
                event.hMacSignature,
                event.timestamp,
                event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(
                PaymentStatusUpdateLoaded(authModel: authModel),
              );
            } else if(response.statusCode == 401) {
              emit(
                PaymentStatusUpdateTokenExp(),
              );
            }else {
              emit(
                PaymentStatusUpdateFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                PaymentStatusUpdateTokenExp(),
              );
            }
            final errorMessage =Utils.parseDioError(e);
            emit(
              PaymentStatusUpdateFailure(
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



    on<OrderPaymentStatusUpdate>(
          (event, emit) async {
        if (state is PaymentStatusUpdateInitial ||
            state is PaymentStatusUpdateLoading ||
            state is PaymentStatusUpdateLoaded ||
            state is PaymentStatusUpdateConnectionError ||
            state is PaymentStatusUpdateFailure) {
          emit(
            PaymentStatusUpdateLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await saveRepository.paymentStatusUpdate(
                event.orderId,
                event.transactionId,
                event.timestamp,
                event.hMacSignature,
                event.token);

            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(
                PaymentStatusUpdateLoaded(authModel: AuthModel(message: authModel.message)),
              );
            }
            else {
              emit(
                PaymentStatusUpdateFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                PaymentStatusUpdateTokenExp(),
              );
            }
            final errorMessage =Utils.parseDioError(e);
            emit(
              PaymentStatusUpdateFailure(
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

    on<StripeWebhook>(
          (event, emit) async {
        if (state is PaymentStatusUpdateInitial ||
            state is PaymentStatusUpdateLoading ||
            state is PaymentStatusUpdateLoaded ||
            state is PaymentStatusUpdateConnectionError ||
            state is PaymentStatusUpdateFailure) {
          emit(
            PaymentStatusUpdateLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await saveRepository.stripeWebhook(
                event.objectData, event.token
            );

            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(
                PaymentStatusUpdateLoaded(authModel: AuthModel(message: authModel.message)),
              );
            }
            else {
              emit(
                PaymentStatusUpdateFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                PaymentStatusUpdateTokenExp(),
              );
            }
            final errorMessage =Utils.parseDioError(e);
            emit(
              PaymentStatusUpdateFailure(
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


    on<PaymentStatusUpdateConnectionErrorEvent>(
      (event, emit) {
        if (state is PaymentStatusUpdateLoaded) {
          final currentState = state as PaymentStatusUpdateLoaded;
          emit(PaymentStatusUpdateLoaded(
            authModel: currentState.authModel,
            hasConnectionError: true,
          ));
        }
        else {
          emit(PaymentStatusUpdateConnectionError());
        }
      },
    );
  }
}
