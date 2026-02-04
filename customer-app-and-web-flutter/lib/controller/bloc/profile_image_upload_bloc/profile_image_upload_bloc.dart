import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../config/strings.dart';
import '../../../data/data_model/profile_image_upload_model.dart';
import '../../../data/sirvice/connectivity_rypository.dart';
import '../../../data/sirvice/save_repository.dart';
import 'profile_image_upload_event.dart';
import 'profile_image_upload_state.dart';

class ProfileImageUploadBloc extends Bloc<ProfileImageUploadEvent, ProfileImageUploadState> {
  ConnectivityRepository connectivityRepository;
  SaveRepository saveRepository;
  ProfileImageUploadBloc({required this.connectivityRepository, required this.saveRepository})
      : super(UploadInitial()) {
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
    on<UploadImage>(
          (event, emit) async {
        if (state is UploadInitial ||
            state is UploadLoading ||
            state is UploadLoaded ||
            state is UploadConnectionError ||
            state is UploadFailure) {
          emit(
            UploadLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response =
            await saveRepository.uploadImage(event.image, event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            ProfileImageUploadModel authModel = ProfileImageUploadModel.fromJson(response.data);
            if (response.statusCode == 201) {
              emit(
                UploadLoaded(uploadModel: ProfileImageUploadModel(
                  message:authModel.message,
                  imageId:authModel.imageId,
                  imageUrl: authModel.imageUrl
                )),
              );
            } else {
              emit(
                UploadFailure(uploadModel:  ProfileImageUploadModel(
                  message:authModel.message,
                ),),
              );
            }
          } on DioException catch (e) {
            final errorMessage =Utils.parseDioError(e);
            emit(
              UploadFailure(
                uploadModel: ProfileImageUploadModel(
                  message:errorMessage,
                ),
              ),
            );
          }
        }
      },
    );

    on<ResendOtpEvent>(
          (event, emit) async {
        if (state is UploadInitial ||
            state is UploadLoading ||
            state is UploadLoaded ||
            state is UploadConnectionError ||
            state is UploadFailure) {
          emit(
            UploadLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await saveRepository.resendOTP(
                event.phone,event.region);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            ProfileImageUploadModel authModel = ProfileImageUploadModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------

              emit(
                UploadLoaded(uploadModel: authModel),
              );
            } else {
              emit(
                UploadFailure(uploadModel: authModel),
              );
            }
          } on DioException catch (_) {
            emit(
              UploadFailure(
                uploadModel: ProfileImageUploadModel(
                  message:"Something went wrong",
                ),
              ),
            );
          }
        }
      },
    );



    on<UploadConnectionErrorEvent>(
      (event, emit) {
        if (state is UploadLoaded) {
          final currentState = state as UploadLoaded;
          emit(UploadLoaded(
            uploadModel: currentState.uploadModel,
            hasConnectionError: true,
          ));
        }
        else {
          emit(UploadConnectionError());
        }
      },
    );
  }
}
