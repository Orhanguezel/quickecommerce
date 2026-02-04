
import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../config/strings.dart';
import '../../../data/data_model/login_model.dart';
import '../../../data/sirvice/connectivity_rypository.dart';
import '../../../data/sirvice/save_repository.dart';
import 'message_send_event.dart';
import 'message_send_state.dart';

class MessageSendBloc extends Bloc<MessageSendEvent, MessageSendState> {
  ConnectivityRepository connectivityRepository;
  SaveRepository saveRepository;
  MessageSendBloc({required this.connectivityRepository, required this.saveRepository})
      : super(MessageSendInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(UploadConnectionErrorEvent());
        }
      },
    );


    //===============Upload Image portion================
    //--------------------------------------------
    on<MessageSend>(
          (event, emit) async {
        if (state is MessageSendInitial ||
            state is MessageSendLoading ||
            state is MessageSendLoaded ||
            state is MessageSendConnectionError ||
            state is MessageSendFailure) {
          emit(
            MessageSendLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response =
            await saveRepository.chatMessageSend(
                event.receiverId,
                event.message,
                event.receiverType,
                event.files,
                event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(
                MessageSendLoaded(authModel:AuthModel(
                  statusCode: 000,
                  message: authModel.message,
                  status: false,
                  role: null,
                ),),
              );
            } else {
              emit(
                MessageSendFailure(authModel:AuthModel(
                  statusCode: 000,
                  message: authModel.message,
                  status: false,
                  role: null,
                ),),
              );
            }
          } on DioException catch (e) {
            final errorMessage =Utils.parseDioError(e);
            emit(
              MessageSendFailure(
                authModel:AuthModel(
                  statusCode: 000,
                  message: errorMessage,
                  status: false,
                  role: null,
                ),
              ),
            );
          }
        }
      },
    );


    //===============Send Message portion================
    //--------------------------------------------
    on<SendTicketMessage>(
          (event, emit) async {
        if (state is MessageSendInitial ||
            state is MessageSendLoading ||
            state is MessageSendLoaded ||
            state is MessageSendConnectionError ||
            state is MessageSendFailure) {
          emit(
            MessageSendLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await saveRepository.sendMessage(
                event.message, event.image, event.ticketId, event.token);

            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 201) {
              emit(
                MessageSendLoaded(authModel: authModel),
              );
            }else if(response.statusCode == 401) {
              emit(
                MessageSendTokenExp(),
              );
            } else {
              emit(
                MessageSendFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                MessageSendTokenExp(),
              );
            }
            final errorMessage =Utils.parseDioError(e);
            emit(
              MessageSendFailure(
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



    on<UploadConnectionErrorEvent>(
      (event, emit) {
        if (state is MessageSendLoaded) {
          final currentState = state as MessageSendLoaded;
          emit(MessageSendLoaded(
            authModel: currentState.authModel,
            hasConnectionError: true,
          ));
        }
        else {
          emit(MessageSendConnectionError());
        }
      },
    );
  }
}
