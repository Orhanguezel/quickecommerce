import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../config/strings.dart';
import '../../../data/data_model/support_ticket_model.dart';
import '../../../data/sirvice/common_repository.dart';
import '../../../data/sirvice/connectivity_rypository.dart';
import 'support_ticket_list_event.dart';
import 'support_ticket_list_state.dart';

class SupportTicketListBloc extends Bloc<SupportTicketListEvent, SupportTicketListState> {
  ConnectivityRepository connectivityRepository;
  CommonRepository commonRepository;
  List<TicketData> ticketData = [];
  SupportTicketListBloc(
      {required this.connectivityRepository, required this.commonRepository})
      : super(SupportTicketListInitial()) {
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
    on<SupportTicketList>(
      (event, emit) async {
        if (state is SupportTicketListInitial ||
            state is SupportTicketListLoading ||
            state is SupportTicketListLoaded ||
            state is SupportTicketListConnectionError ||
            state is SupportTicketListFailure) {
          emit(
            SupportTicketListLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.supportTicketList(
                event.departmentId, event.status, event.perPage, event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------
            final supportTicketModel = Utils.parseApiResponse(response.data, SupportTicketModel.fromJson);
            if (supportTicketModel == null) {
              emit( SupportTicketListEmailValidity());
              return;
            }

            if (response.statusCode == 200) {
              ticketData.addAll(supportTicketModel.data!);
              emit(SupportTicketListLoaded(supportTicketModel:
              SupportTicketModel(
                  message: supportTicketModel.message,
                  data: ticketData,
                  meta: supportTicketModel.meta)
              )
              );
              ticketData=[];
            }
            else if (response.statusCode == 204) {
              emit(
                 SupportTicketListLoaded(
                  supportTicketModel:
                  SupportTicketModel(
                      message: supportTicketModel.message,
                      data: [],
                      meta: supportTicketModel.meta
                  ),
                ),
              );
              ticketData=[];
            }
            else {
              emit(
                 SupportTicketListFailure(
                  supportTicketModel:
                  SupportTicketModel(
                      message: supportTicketModel.message,
                      data: [],
                      meta: supportTicketModel.meta
                  ),
                ),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                SupportTicketListTokenExp(),
              );
            }
            final errorMessage =Utils.parseDioError(e);
            emit(
               SupportTicketListFailure(
                supportTicketModel:
                SupportTicketModel(
                    message:errorMessage,
                    data: [],
                ),
              ),
            );
          }
        }
      },
    );

    on<SupportTicketListConnectionErrorEvent>(
      (event, emit) {
        if (state is SupportTicketListLoaded) {
          final currentState = state as SupportTicketListLoaded;
          emit(SupportTicketListLoaded(
            supportTicketModel: currentState.supportTicketModel,
            hasConnectionError: true,
          ));
        } else {
          emit(SupportTicketListConnectionError());
        }
      },
    );
  }
}
