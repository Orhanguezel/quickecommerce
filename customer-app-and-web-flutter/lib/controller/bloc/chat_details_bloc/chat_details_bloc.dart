
import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/chat_details_bloc/chat_details_event.dart';
import 'package:quick_ecommerce/controller/bloc/chat_details_bloc/chat_details_state.dart';
import 'package:quick_ecommerce/data/data_model/chat_details_model.dart';
import 'package:quick_ecommerce/data/sirvice/common_repository.dart';
import 'package:quick_ecommerce/data/sirvice/connectivity_rypository.dart';



class ChatDetailsBloc extends Bloc<ChatDetailsEvent,ChatDetailsState> {
  ConnectivityRepository connectivityRepository;
  CommonRepository commonRepository;
  List<MessagesData> chatListData = [];
  ChatDetailsBloc(
      {required this.connectivityRepository, required this.commonRepository})
      : super(ChatDetailsInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(ChatDetailsConnectionErrorEvent());
        }
      },
    );

    //===============Verify token portion================
    //--------------------------------------------
    on<ChatDetailsDataEvent>(
      (event, emit) async {
        if (state is ChatDetailsInitial ||
            state is ChatDetailsLoading ||
            state is ChatDetailsLoaded ||
            state is ChatDetailsConnectionError ||
            state is ChatDetailsFailure) {
          emit(
            ChatDetailsLoading(),
          );

          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.messagesDetails(
                event.receiverId, event.receiverType,event.search,event.token
                );
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            MessagesDetailsModel messagesDetailsModel = MessagesDetailsModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------
              chatListData.addAll(messagesDetailsModel.data!);
              emit(
                ChatDetailsLoaded(messagesDetailsModel:  MessagesDetailsModel(
                  data: chatListData,
                 // pagination:
                ),),
              );
              chatListData=[];
            }
            else if(response.statusCode == 204){
              emit(
                ChatDetailsLoaded(messagesDetailsModel:  MessagesDetailsModel(
                  data: [],
                  // pagination:
                ),),
              );
              chatListData=[];
            }
            else {
              emit(
                ChatDetailsFailure(messagesDetailsModel: messagesDetailsModel),
              );
            }
          } on DioException catch (_) {
            emit(
              ChatDetailsFailure(
                messagesDetailsModel: MessagesDetailsModel(
                 data: [],
                ),
              ),
            );
          }
        }
      },
    );


    on<NewMessageReceivedEvent>((event, emit) {
      if (state is ChatDetailsLoaded) {
        final currentState = state as ChatDetailsLoaded;
        final currentMessages = List<MessagesData>.from(currentState.messagesDetailsModel.data ?? []);

        currentMessages.add(event.newMessage);

        final updatedModel = MessagesDetailsModel(
          success: currentState.messagesDetailsModel.success,
          unreadMessage: currentState.messagesDetailsModel.unreadMessage,
          data: currentMessages,
          meta: currentState.messagesDetailsModel.meta,
        );

        emit(ChatDetailsLoaded(
          messagesDetailsModel: updatedModel,
          hasConnectionError: false,
        ));
      }
    });



    on<ChatDetailsConnectionErrorEvent>(
      (event, emit) {
        if (state is ChatDetailsLoaded) {
          final currentState = state as ChatDetailsLoaded;
          emit(ChatDetailsLoaded(
            messagesDetailsModel: currentState.messagesDetailsModel,
            hasConnectionError: true,
          ));
        }
        else {
          emit(ChatDetailsConnectionError ());
        }
      },
    );
  }
}
