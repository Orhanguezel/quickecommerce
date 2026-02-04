
import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/data_model/brand_model.dart';
import '../../../data/data_model/maintenance_settings.dart';
import '../../../data/sirvice/connectivity_rypository.dart';
import '../../../data/sirvice/product_repository.dart';
import 'maintenance_settings_event.dart';
import 'maintenance_settings_state.dart';

class MaintenanceSettingsBloc extends Bloc<MaintenanceSettingsEvent,MaintenanceSettingsState> {
  ConnectivityRepository connectivityRepository;
  ProductRepository productRepository;
  MaintenanceSettingsBloc(
      {required this.connectivityRepository, required this.productRepository})
      : super(MaintenanceSettingsInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(MaintenanceSettingsConnectionErrorEvent());
        }
      },
    );


    on<MaintenanceSettings>(
          (event, emit) async {
        if (state is MaintenanceSettingsInitial ||
            state is MaintenanceSettingsLoading ||
            state is MaintenanceSettingsLoaded ||
            state is MaintenanceSettingsConnectionError ||
            state is MaintenanceSettingsFailure) {
          emit(
            MaintenanceSettingsLoading(),
          );

          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await productRepository.maintenanceSettings();
            //========== converting json to dart object ===========
            //-----------------------------------------------------
            MaintenanceSettingsModel maintenanceSettingsModel=MaintenanceSettingsModel.fromJson(response.data);
            // final brandModel = BrandModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------

              emit(
                MaintenanceSettingsLoaded(
                  maintenanceSettingsModel:  maintenanceSettingsModel,),
              );
            }
            else if(response.statusCode == 204){
              emit(
                MaintenanceSettingsLoaded(
                  maintenanceSettingsModel: maintenanceSettingsModel,),
              );
            }
            else {
              emit(
                MaintenanceSettingsFailure(brandModel: BrandModel()),
              );
            }
          } on DioException catch (_) {
            emit(
              MaintenanceSettingsFailure(
                brandModel: BrandModel(),
              ),
            );
          }
        }
      },
    );

    on<MaintenanceSettingsConnectionErrorEvent>(
      (event, emit) {
        if (state is MaintenanceSettingsLoaded) {
          final currentState = state as MaintenanceSettingsLoaded;
          emit(MaintenanceSettingsLoaded(
            maintenanceSettingsModel: currentState.maintenanceSettingsModel,
            hasConnectionError: true,
          ));
        } else {
          emit(MaintenanceSettingsConnectionError());
        }
      },
    );
  }
}
