import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/data_model/home_section_title_model.dart';
import '../../../data/service/common_repository.dart';
import '../../../data/service/connectivity_repository.dart';
import 'home_title_event.dart';
import 'home_title_state.dart';

class HomeTitleBloc extends Bloc<HomeTitleEvent, HomeTitleState> {
  ConnectivityRepository connectivityRepository;
  CommonRepository commonRepository;
  HomeTitleBloc(
      {required this.connectivityRepository, required this.commonRepository})
      : super(HomeTitleInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(HomeTitleConnectionErrorEvent());
        }
      },
    );

    //===============WishList portion================
    //--------------------------------------------
    on<HomeTitleDataEvent>(
      (event, emit) async {
        if (state is HomeTitleInitial ||
            state is HomeTitleLoading ||
            state is HomeTitleLoaded ||
            state is HomeTitleConnectionError ||
            state is HomeTitleFailure) {
          emit(
            HomeTitleLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.homePageSettings();
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            HomeSectionTitleModel imageListModel =
                HomeSectionTitleModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(
                HomeTitleLoaded(
                  homeSectionTitleModel:
                      HomeSectionTitleModel(data: imageListModel.data),
                ),
              );
            } else if (response.statusCode == 204) {
              emit(
                HomeTitleLoaded(
                  homeSectionTitleModel: HomeSectionTitleModel(data: Data()),
                ),
              );
            } else {
              emit(
                HomeTitleFailure(
                  homeSectionTitleModel: HomeSectionTitleModel(data: Data()),
                ),
              );
            }
          } on DioException catch (_) {
            emit(
              HomeTitleFailure(
                homeSectionTitleModel: HomeSectionTitleModel(data: Data()),
              ),
            );
          }
        }
      },
    );

    on<HomeTitleConnectionErrorEvent>(
      (event, emit) {
        if (state is HomeTitleInitial ||
            state is HomeTitleLoading ||
            state is HomeTitleLoaded ||
            state is HomeTitleConnectionError ||
            state is HomeTitleFailure) {
          emit(
            HomeTitleConnectionError(),
          );
        }
      },
    );
  }
}
