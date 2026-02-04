import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/data_model/tax_info_model.dart';
import '../../../data/data_model/tickate_message_model.dart';
import '../../../data/sirvice/common_repository.dart';
import '../../../data/sirvice/connectivity_rypository.dart';
import 'get_message_event.dart';
import 'get_message_state.dart';

class GetMessageBloc extends Bloc<GetMessageEvent, GetMessageState> {
  ConnectivityRepository connectivityRepository;
  CommonRepository commonRepository;
  List<MessageData> messageData = [];
  List<TaxInfo> taxInfoData = [];
  GetMessageBloc(
      {required this.connectivityRepository, required this.commonRepository})
      : super(GetMessageInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(StoreDetailsConnectionErrorEvent());
        }
      },
    );

    //===============Get Message portion================
    //--------------------------------------------
    on<GetMessage>(
      (event, emit) async {
        if (state is GetMessageInitial ||
            state is GetMessageLoading ||
            state is GetMessageLoaded ||
            state is GetMessageConnectionError ||
            state is GetMessageFailure) {
          emit(
            GetMessageLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.getMessages(
                event.ticketId, event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------


            TicketMessageModel ticketMessageModel = TicketMessageModel.fromJson(response.data);

            if (response.statusCode == 200) {
              messageData.addAll(ticketMessageModel.data);
              emit(GetMessageLoaded(ticketMessageModel: TicketMessageModel(
                  status: ticketMessageModel.status,
                  statusCode: ticketMessageModel.statusCode,
                  data: ticketMessageModel.data
              )));
            } else if (response.statusCode == 204) {
              emit(GetMessageLoaded(ticketMessageModel: TicketMessageModel(
                  status: ticketMessageModel.status,
                  statusCode: ticketMessageModel.statusCode,
                  data:messageData
              )));
              messageData=[];
            } else if (response.statusCode == 401) {
              emit(
                GetMessageTokenExp(),
              );
            } else {
              emit(
                GetMessageFailure(
                  ticketMessageModel: TicketMessageModel(
                      status:false,
                      statusCode: 000,
                      data: []
                  ),
                ),
              );
            }
          } on DioException catch (_) {
            emit(
              GetMessageFailure(
                ticketMessageModel: TicketMessageModel(
                    status:false,
                    statusCode: 000,
                    data: []
                ),
              ),
            );
          }
        }
      },
    );


    //===============WishList portion================
    //--------------------------------------------
    on<GetTaxInfo>(
          (event, emit) async {
        if (state is GetMessageInitial ||
            state is GetMessageLoading ||
            state is GetMessageLoaded ||
            state is GetMessageConnectionError ||
            state is GetMessageFailure) {
          emit(
            GetMessageLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.taxInfo(
                event.storeIds, event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------


            TaxModel taxModel = TaxModel.fromJson(response.data);

            if (response.statusCode == 200) {
              taxInfoData.addAll(taxModel.taxInfo!);
              emit(GetTaxInfoLoaded(
                  taxModel: TaxModel(
                  taxInfo:taxModel.taxInfo,
                      success: taxModel.success
              )));
            }  else {
              emit(
                GetMessageFailure(
                  ticketMessageModel: TicketMessageModel(
                      status:false,
                      statusCode: 000,
                      data: []
                  ),
                ),
              );
            }
          } on DioException catch (_) {
            emit(
              GetMessageFailure(
                ticketMessageModel: TicketMessageModel(
                    status:false,
                    statusCode: 000,
                    data: []
                ),
              ),
            );
          }
        }
      },
    );



    on<StoreDetailsConnectionErrorEvent>(
      (event, emit) {
        if (state is GetMessageLoaded) {
          final currentState = state as GetMessageLoaded;
          emit(GetMessageLoaded(
            ticketMessageModel: currentState.ticketMessageModel,
            hasConnectionError: true,
          ));
        } else {
          emit(GetMessageConnectionError());
        }
      },
    );
  }
}
