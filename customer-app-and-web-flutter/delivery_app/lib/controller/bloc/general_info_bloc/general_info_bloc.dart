
import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/general_info_bloc/general_info_event.dart';
import 'package:quick_ecommerce/controller/bloc/general_info_bloc/general_info_state.dart';
import 'package:quick_ecommerce/data/data_model/all_product_model.dart';
import '../../../data/data_model/coupon_list_model.dart';
import '../../../data/data_model/general_info_model.dart';
import '../../../data/service/common_repository.dart';
import '../../../data/service/connectivity_repository.dart';


class GeneralInfoBloc extends Bloc<GeneralInfoEvent, GeneralInfoState> {
  ConnectivityRepository connectivityRepository;
  CommonRepository commonRepository;
   List<CouponData> data=[];
  GeneralInfoBloc(
      {required this.connectivityRepository, required this.commonRepository})
      : super(GeneralInfoInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(GeneralInfoConnectionErrorEvent());
        }
      },
    );
    bool isFetching = false; // Add a flag to track API calls

    //===============Verify token portion================
    //--------------------------------------------
    on<GeneralInfoDataEvent>(
      (event, emit) async {

        if (isFetching) return; // Prevent duplicate calls
        isFetching = true;

        if (state is GeneralInfoInitial ||
            state is GeneralInfoLoading ||
            state is GeneralInfoLoaded ||
            state is GeneralInfoConnectionError ||
            state is GeneralInfoFailure) {
          emit(
            GeneralInfoLoading(),
          );

          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.generalInfo();
            if (response.data == null || response.data.isEmpty) {
              throw Exception("Empty or null response from API");
            }

            //========== converting json to dart object ===========
            //-----------------------------------------------------

            GeneralInfoModel contactModel = GeneralInfoModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(
                GeneralInfoLoaded(generalInfoModel:  GeneralInfoModel(
                  siteSettings: contactModel.siteSettings,

                 // pagination:
                ),),
              );
            }
            else if(response.statusCode == 204){
              emit(
                GeneralInfoLoaded(generalInfoModel:  GeneralInfoModel(
                  siteSettings: contactModel.siteSettings,
                ),),
              );
            }
            else {
              emit(
                GeneralInfoFailure(generalInfoModel: contactModel),
              );
            }
          } on DioException catch (_) {
            emit(
              GeneralInfoFailure(
                generalInfoModel: GeneralInfoModel(
                  siteSettings: SiteSettings(),
                ),
              ),
            );
          }finally {
            isFetching = false; // Reset the flag
          }
        }
      },
    );




    //===============Verify token portion================
    //--------------------------------------------
    on<CouponDataEvent>(
          (event, emit) async {
        if (isFetching) return; // Prevent duplicate calls
        isFetching = true;

        if (state is GeneralInfoInitial ||
            state is GeneralInfoLoading ||
            state is CouponLoaded ||
            state is GeneralInfoConnectionError ||
            state is CouponFailure) {
          emit(
            GeneralInfoLoading(),
          );

          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.couponList(
                event.searchKey,
                event.discountType,
                event.expireSoon,
                event.newest,
                event.page,
                event.language,
                event.token);


            if (response.data == null || response.data.isEmpty) {
              throw Exception("Empty or null response from API");
            }

            //========== converting json to dart object ===========
            //-----------------------------------------------------

            CouponListModel couponListModel = CouponListModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------
              data.addAll(couponListModel.data);
              emit(
                CouponLoaded(couponListModel:  CouponListModel(
                  data: data,
                  meta: couponListModel.meta

                  // pagination:
                ),),
              );
              data=[];
            }
            else if(response.statusCode == 204){
              emit(
                CouponLoaded(couponListModel:  CouponListModel(
                  data: data,
                  meta: couponListModel.meta,
                ),),
              );
            }
            else {
              emit(
                CouponFailure(couponListModel: couponListModel),
              );
            }
          } on DioException catch (_) {
            emit(
              CouponFailure(
                couponListModel: CouponListModel(
                  data: [],
                  meta: Meta()
                ),
              ),
            );
          }finally {
            isFetching = false; // Reset the flag
          }
        }
      },
    );

    on<GeneralInfoConnectionErrorEvent>(
      (event, emit) {
        if (state is GeneralInfoInitial ||
            state is GeneralInfoLoading ||
            state is GeneralInfoLoaded ||
            state is GeneralInfoConnectionError ||
            state is GeneralInfoFailure) {
          emit(
            GeneralInfoConnectionError(),
          );
        }
      },
    );
  }
}
