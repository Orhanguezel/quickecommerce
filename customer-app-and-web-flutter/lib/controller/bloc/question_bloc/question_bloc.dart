import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../data/data_model/question_mode.dart';
import '../../../data/sirvice/common_repository.dart';
import '../../../data/sirvice/connectivity_rypository.dart';
import 'question_event.dart';
import 'question_state.dart';

class QuestionBloc extends Bloc<QuestionEvent, QuestionState> {
  ConnectivityRepository connectivityRepository;
  CommonRepository commonRepository;
  List<QuestionData> questionData = [];
  QuestionBloc(
      {required this.connectivityRepository, required this.commonRepository})
      : super(QuestionInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(QuestionConnectionErrorEvent());
        }
      },
    );

    //===============Verify token portion================
    //--------------------------------------------
    on<QuestionDadaEvent>(
      (event, emit) async {
        if (state is QuestionInitial ||
            state is QuestionLoading ||
            state is QuestionLoaded ||
            state is QuestionConnectionError ||
            state is QuestionFailure) {
          emit(
            QuestionLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.question(
                event.productId,
                event.search,
                event.perPage,
            );
           // print(response);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            QuestionModel questionModel = QuestionModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------
              questionData.addAll(questionModel.data!);
              emit(
                QuestionLoaded(questionModel: QuestionModel(
                     meta:questionModel.meta,
                  data: questionData,
                 // pagination:
                ),),
              );
              questionData=[];
            } else if(response.statusCode == 204){
              emit(
                QuestionLoaded(questionModel:  QuestionModel(
                  data: questionData,
                  meta: questionModel.meta,
                  // pagination:
                ),),
              );
              questionData=[];
            }
            else {
              emit(
                QuestionFailure(questionModel: questionModel),
              );
            }
          } on DioException catch (_) {
            emit(
              QuestionFailure(
                questionModel: QuestionModel(
                 data: [],
                ),
              ),
            );
          }
        }
      },
    );

    on<QuestionConnectionErrorEvent>(
      (event, emit) {
        if (state is QuestionInitial ||
            state is QuestionLoading ||
            state is QuestionLoaded ||
            state is QuestionConnectionError ||
            state is QuestionFailure) {
          emit(
            QuestionConnectionError(),
          );
        }
      },
    );
  }
}
