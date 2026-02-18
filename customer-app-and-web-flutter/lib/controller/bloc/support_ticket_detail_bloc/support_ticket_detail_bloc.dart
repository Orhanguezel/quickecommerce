import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/data_model/ticket_detail_model.dart';
import '../../../data/service/common_repository.dart';
import '../../../data/service/connectivity_repository.dart';
import 'support_ticket_detail_event.dart';
import 'support_ticket_detail_state.dart';

class SupportTicketDetailBloc extends Bloc<SupportTicketDetailEvent, SupportTicketDetailState> {
  ConnectivityRepository connectivityRepository;
  CommonRepository commonRepository;
  SupportTicketDetailBloc(
      {required this.connectivityRepository, required this.commonRepository})
      : super(TicketDetailInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(SupportTicketListConnectionErrorEvent());
        }
      },
    );

    //===============WishList portion================
    //--------------------------------------------
    on<TicketDetails>(
      (event, emit) async {
        if (state is TicketDetailInitial ||
            state is TicketDetailLoading ||
            state is TicketDetailLoaded ||
            state is TicketDetailConnectionError ||
            state is TicketDetailFailure) {
          emit(
            TicketDetailLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.supportTicketDetails(
                event.id, event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------
            TicketDetailsModel ticketDetailsModel=TicketDetailsModel.fromJson(response.data);

            if (response.statusCode == 200) {
              emit(TicketDetailLoaded(ticketDetailsModel:
              TicketDetailsModel(
                  data: ticketDetailsModel.data,
              )));
            } else if (response.statusCode == 204) {
              emit(
                TicketDetailLoaded(
                  ticketDetailsModel:
                  TicketDetailsModel(

                      data:TicketData(),
                  ),
                ),
              );
            } else if (response.statusCode == 401) {
              emit(
                TicketDetailTokenExp(),
              );
            } else {
              emit(
                TicketDetailFailure(
                  ticketDetailsModel:
                  TicketDetailsModel(
                      data: TicketData(),
                  ),
                ),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                TicketDetailTokenExp(),
              );
            }

            emit(
              TicketDetailFailure(
                ticketDetailsModel:
                TicketDetailsModel(
                    data: TicketData(),
                ),
              ),
            );
          }
        }
      },
    );

    on<SupportTicketListConnectionErrorEvent>(
      (event, emit) {
        if (state is TicketDetailLoaded) {
          final currentState = state as TicketDetailLoaded;
          emit(TicketDetailLoaded(
            ticketDetailsModel: currentState.ticketDetailsModel,
            hasConnectionError: true,
          ));
        } else {
          emit(TicketDetailConnectionError());
        }
      },
    );
  }
}
