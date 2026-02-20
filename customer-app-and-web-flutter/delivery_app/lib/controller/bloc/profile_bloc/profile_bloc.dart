import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:quick_ecommerce/config/strings.dart';

import '../../../data/data_model/department_model.dart';
import '../../../data/data_model/profile_model.dart';
import '../../../data/service/common_repository.dart';
import '../../../data/service/connectivity_repository.dart';
import 'profile_event.dart';
import 'profile_state.dart';

class ProfileBloc extends Bloc<ProfileEvent, ProfileState> {
  ConnectivityRepository connectivityRepository;
  CommonRepository commonRepository;
List<DepartmentData> departmentData=[];
  ProfileBloc(
      {required this.connectivityRepository, required this.commonRepository})
      : super(ProfileInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(ProfileConnectionErrorEvent());
        }
      },
    );

    //===============Profile portion================
    //--------------------------------------------
    on<Profile>(
      (event, emit) async {
        if (state is ProfileInitial ||
            state is ProfileLoading ||
            state is ProfileLoaded ||
            state is ProfileConnectionError ||
            state is ProfileFailure) {
          emit(
            ProfileLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.profile(
                event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------





            if (response.statusCode == 200) {
              final profileModel = Utils.parseApiResponse(response.data, ProfileModel.fromJson);

              if (profileModel == null) {
                return;
              }
              emit(
                ProfileLoaded(profileModel:ProfileModel(
                  data: profileModel.data
                )),
              );
            }
            else {
              emit(
                ProfileFailure(profileModel:  ProfileModel(
                  data: ProfileData(),
                )),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                TokenExp(),
              );
            }
            emit(
              ProfileFailure(
                profileModel: ProfileModel(
                 data:ProfileData(),
                ),
              ),
            );
          }
        }
      },
    );


    //===============Profile portion================
    //--------------------------------------------
    on<OrderTrack>(
          (event, emit) async {
        if (state is ProfileInitial ||
            state is ProfileLoading ||
            state is ProfileLoaded ||
            state is ProfileConnectionError ||
            state is ProfileFailure) {
          emit(
            ProfileLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.orderTracking(
                event.orderId,
                event.token,
            );
            //========== converting json to dart object ===========
            //-----------------------------------------------------


            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------
              final profileModel = ProfileModel.fromJson(response.data);
              emit(
                ProfileLoaded(profileModel:ProfileModel(
                    data: profileModel.data
                )),
              );
            }
            else if(response.statusCode == 204){
              emit(ProfileLoaded(
                profileModel: ProfileModel(
                  data: ProfileData(),
                ),
              ));
            }
            else {
              emit(
                ProfileFailure(profileModel:  ProfileModel(
                  data: ProfileData(),
                )),
              );
            }
          } on DioException catch (_) {
            emit(
              ProfileFailure(
                profileModel: ProfileModel(
                  data:ProfileData(),
                ),
              ),
            );
          }
        }
      },
    );



    //===============DepartmentList portion================
    //--------------------------------------------
    on<DepartmentList>(
          (event, emit) async {
        if (state is ProfileInitial ||
            state is ProfileLoading ||
            state is ProfileLoaded ||
            state is DepartmentLoaded ||
            state is ProfileConnectionError ||
            state is ProfileFailure) {
          emit(
            ProfileLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.departmentList(
                event.token);
            // print(response);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            DepartmentModel departmentModel = DepartmentModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------

              departmentData.addAll(departmentModel.data);
              emit(
                DepartmentLoaded(departmentModel:DepartmentModel(
                    status: departmentModel.status,
                    statusCode: departmentModel.statusCode,
                    data: departmentData
                )
                ),
              );
              departmentData=[];
            }
            else if(response.statusCode == 204){
              emit(DepartmentLoaded(
                departmentModel:DepartmentModel(
                  status: departmentModel.status,
                  statusCode: departmentModel.statusCode,
                  data: []
              ),
              ));
              departmentData=[];
            }
            else {
              emit(
                ProfileFailure(profileModel:  ProfileModel(
                  data: ProfileData(),
                )),
              );
            }
          } on DioException catch (_) {
            emit(
              ProfileFailure(
                profileModel: ProfileModel(
                  data:ProfileData(),
                ),
              ),
            );
          }
        }
      },
    );
//DepartmentList

    on<ProfileConnectionErrorEvent>(
      (event, emit) {
        if (state is ProfileLoaded) {
          final currentState = state as ProfileLoaded;
          emit(ProfileLoaded(
            profileModel: currentState.profileModel,
            hasConnectionError: true,
          ));
        } else {
          emit(ProfileConnectionError());
        }
      },
    );
  }
}
