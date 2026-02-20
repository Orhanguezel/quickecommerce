import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/dashboard_bloc/dashboard_state.dart';

import '../../../data/data_model/dashboard_model.dart';
import '../../../data/service/common_repository.dart';
import '../../../data/service/connectivity_repository.dart';
import 'dashboard_event.dart';

class DashboardBloc
    extends Bloc<DashboardEvent, DashboardState> {
  ConnectivityRepository connectivityRepository;
  CommonRepository commonRepository;
  DashboardBloc(
      {required this.connectivityRepository, required this.commonRepository})
      : super(DashboardInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(DashboardConnectionErrorEvent());
        }
      },
    );
    bool isFetching = false;

    //===============Verify token portion================
    //--------------------------------------------
    on<Dashboard>(
      (event, emit) async {
        if (isFetching) return; // Prevent duplicate calls
        isFetching = true;

        if (state is DashboardInitial ||
            state is DashboardLoading ||
            state is DashboardLoaded ||
            state is DashboardConnectionError ||
            state is DashboardFailure) {
          emit(
            DashboardLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.dashboard(
             event.language, event.token,
            );

            if (response.data == null || response.data.isEmpty) {
              throw Exception("Empty or null response from API");
            }

            //========== converting json to dart object ===========
            //-----------------------------------------------------

            DashboardModel dashboardModel =
            DashboardModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------
              emit(
                DashboardLoaded(
                  dashboardModel: DashboardModel(
                    status: dashboardModel.status,
                    statusCode: dashboardModel.statusCode,
                    data: dashboardModel.data,
                    // pagination:
                  ),
                ),
              );
            } else {
              emit(
                DashboardFailure(dashboardModel: dashboardModel),
              );
            }
          } on DioException catch (_) {

            emit(
              DashboardFailure(
                dashboardModel: DashboardModel(
                    status: false,
                    statusCode: 000,
                    data: DashboardData()
                ),
              ),
            );
          } finally {
            isFetching = false; // Reset the flag
          }
        }
      },
    );

    on<DashboardConnectionErrorEvent>(
      (event, emit) {
        if (state is DashboardInitial ||
            state is DashboardLoading ||
            state is DashboardLoaded ||
            state is DashboardConnectionError ||
            state is DashboardFailure) {
          emit(
            DashboardConnectionError(),
          );
        }
      },
    );
  }
}
