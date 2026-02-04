import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../config/strings.dart';
import '../../../data/data_model/notification_model.dart';
import '../../../data/sirvice/common_repository.dart';
import '../../../data/sirvice/connectivity_rypository.dart';
import 'notificatioon_event.dart';
import 'notificatioon_state.dart';

class NotificationBloc extends Bloc<NotificationEvent, NotificationState> {
  ConnectivityRepository connectivityRepository;
  CommonRepository commonRepository;
  List<NotificationData> notificationData = [];
  NotificationBloc(
      {required this.connectivityRepository, required this.commonRepository})
      : super(NotificationInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(NotificationConnectionErrorEvent());
        }
      },
    );

    //===============Verify token portion================
    //--------------------------------------------
    on<NotificationDataEvent>(
      (event, emit) async {
        if (state is NotificationInitial ||
            state is NotificationLoading ||
            state is NotificationLoaded ||
            state is NotificationConnectionError ||
            state is NotificationFailure) {
          emit(
            NotificationLoading(),
          );

          try {
            final response = await commonRepository.notification(
             event.language, event.token,
            );

            NotificationModel notification = NotificationModel.fromJson(response.data);
            if (response.statusCode == 200) {
              notificationData.addAll(notification.data!);
              emit(
                NotificationLoaded(notificationModel: NotificationModel(
                  success: notification.success,
                  message: notification.message,
                  data: notificationData,
                )),
              );
              notificationData = [];
            }
            else {
              emit(
                NotificationFailure(notificationModel: notification),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                NotificationTokenExp(),
              );
            }
            final errorMessage =Utils.parseDioError(e);
              NotificationFailure(
                notificationModel: NotificationModel(
                  success: false,
                  message:errorMessage,
                  data: [],
                ),
            );
          }
        }
      },
    );


    on<RefundReasonListEvent>(
          (event, emit) async {
        if (state is NotificationInitial ||
            state is NotificationLoading ||
            state is NotificationLoaded ||
            state is NotificationConnectionError ||
            state is NotificationFailure) {
          emit(
            NotificationLoading(),
          );

          try {
            final response = await commonRepository.refundReasonList(
              event.token,
            );
            NotificationModel notification = NotificationModel.fromJson(response.data);
            if (response.statusCode == 200) {
              notificationData.addAll(notification.data!);
              emit(
                NotificationLoaded(notificationModel: NotificationModel(
                  data: notificationData,
                )),
              );
              notificationData = [];
            }
            else if (response.statusCode == 204) {
              emit(
                NotificationLoaded(notificationModel:NotificationModel(
                  data: [],
                )),
              );
              notificationData = [];
            }
            else if(response.statusCode == 401){
              emit(
                NotificationTokenExp(),
              );
            }
            else {
              emit(
                NotificationFailure(notificationModel: notification),
              );
            }
          } on DioException catch (_) {
            NotificationFailure(
              notificationModel: NotificationModel(
                data: [],
              ),
            );
          }

        }
      },
    );


    on<NotificationConnectionErrorEvent>(
      (event, emit) {
        if (state is NotificationLoaded) {
          final currentState = state as NotificationLoaded;
          emit(NotificationLoaded(
            notificationModel: currentState.notificationModel,
            hasConnectionError: true,
          ));
        } else {
          emit(NotificationConnectionError());
        }

      },
    );
  }
}
