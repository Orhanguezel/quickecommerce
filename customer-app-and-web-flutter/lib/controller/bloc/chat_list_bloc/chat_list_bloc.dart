import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:quick_ecommerce/data/data_model/chat_list_model.dart';
import 'package:quick_ecommerce/data/sirvice/common_repository.dart';
import 'package:quick_ecommerce/data/sirvice/connectivity_rypository.dart';

import '../../../config/strings.dart';
import 'chat_list_event.dart';
import 'chat_list_state.dart';

class ChatListBloc extends Bloc<ChatListEvent,ChatListState> {
  ConnectivityRepository connectivityRepository;
  CommonRepository commonRepository;
  List<ChatListData> chatListData = [];
  ChatListBloc(
      {required this.connectivityRepository, required this.commonRepository})
      : super(ChatListInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(DashboardConnectionErrorEvent());
        }
      },
    );

    //===============Verify token portion================
    //--------------------------------------------
    on<ChatListDataEvent>(
      (event, emit) async {
        if (state is ChatListInitial ||
            state is ChatListLoading ||
            state is ChatListLoaded ||
            state is ChatListConnectionError ||
            state is ChatListFailure) {
          emit(
            ChatListLoading(),
          );

          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.chatList(
                event.search,event.type,event.token
                );
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            ChatListModel chatListModel = ChatListModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------
              chatListData.addAll(chatListModel.data!);
              emit(
                ChatListLoaded(chatListModel:  ChatListModel(
                  data: chatListData,
                 // pagination:
                ),),
              );
              chatListData=[];
            }
            else if(response.statusCode == 204){
              emit(
                ChatListLoaded(chatListModel:  ChatListModel(
                  data: [],
                  // pagination:
                ),),
              );
              chatListData=[];
            }
            else {
              emit(
                ChatListFailure(chatListModel: chatListModel),
              );
            }
          } on DioException catch (e) {
            final errorMessage =Utils.parseDioError(e);
            emit(
              ChatListFailure(
                chatListModel: ChatListModel(
                 data: [],
                  message:errorMessage
                ),
              ),
            );
          }
        }
      },
    );

    on<DashboardConnectionErrorEvent>(
      (event, emit) {
        if (state is ChatListLoaded) {
          final currentState = state as ChatListLoaded;
          emit(ChatListLoaded(
            chatListModel: currentState.chatListModel,
            hasConnectionError: true,
          ));
        }
        else {
          emit(ChatListConnectionError ());
        }
      },
    );
  }
}
