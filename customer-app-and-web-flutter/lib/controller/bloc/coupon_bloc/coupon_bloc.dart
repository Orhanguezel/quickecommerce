
import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../config/strings.dart';
import '../../../data/data_model/coupon_model.dart';
import '../../../data/sirvice/common_repository.dart';
import '../../../data/sirvice/connectivity_rypository.dart';
import 'coupon_event.dart';
import 'coupon_state.dart';

class CouponBloc extends Bloc<CouponEvent, CouponState> {
  ConnectivityRepository connectivityRepository;
  CommonRepository commonRepository;
  CouponBloc(
      {required this.connectivityRepository, required this.commonRepository})
      : super(CouponInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(CouponConnectionErrorEvent());
        }
      },
    );
    bool isFetching = false;

    //===============Verify token portion================
    //--------------------------------------------
    on<Coupons>(
      (event, emit) async {

        if (isFetching) return; // Prevent duplicate calls
        isFetching = true;

        if (state is CouponInitial ||
            state is CouponLoading ||
            state is CouponLoaded ||
            state is CouponConnectionError ||
            state is CouponFailure) {
          emit(
            CouponLoading(),
          );

          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.checkCoupon(
                event.couponCode,
                event.subtotal,
                event.currencyCode,
                event.token,
                );


            if (response.data == null || response.data.isEmpty) {
              throw Exception("Empty or null response from API");
            }

            //========== converting json to dart object ===========
            //-----------------------------------------------------

            CouponModel couponModel = CouponModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(
                CouponLoaded(couponModel:  CouponModel(
                  message: couponModel.message,
                  coupon: couponModel.coupon,
                 // pagination:
                ),),
              );
            }
            else {
              emit(
                CouponFailure(couponModel: couponModel),
              );
            }
          } on DioException catch (e) {
            final errorMessage =Utils.parseDioError(e);
            emit(
              CouponFailure(
                couponModel: CouponModel(
                  message: errorMessage,
                 coupon: Coupon(),
                ),
              ),
            );
          }finally {
            isFetching = false; // Reset the flag
          }
        }
      },
    );

    on<CouponConnectionErrorEvent>(
      (event, emit) {
        if (state is CouponLoaded) {
          final currentState = state as CouponLoaded;
          emit(CouponLoaded(
            couponModel: currentState.couponModel,
            hasConnectionError: true,
          ));
        } else {
          emit(CouponConnectionError());
        }

      },
    );
  }
}
