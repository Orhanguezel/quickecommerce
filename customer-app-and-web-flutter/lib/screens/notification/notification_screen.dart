import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:quick_ecommerce/config/icons.dart';
import 'package:quick_ecommerce/config/strings.dart';
import 'package:quick_ecommerce/controller/bloc/notification_bloc/notificatioon_event.dart';
import 'package:quick_ecommerce/controller/bloc/refresh_token/refresh_token_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/save_bloc/save_event.dart';
import 'package:quick_ecommerce/data/data_model/notification_model.dart';
import 'package:quick_ecommerce/router/route_name.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_card.dart';

import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/notification_bloc/notificatioon_bloc.dart';
import '../../controller/bloc/notification_bloc/notificatioon_state.dart';
import '../../controller/bloc/save_bloc/save_bloc.dart';
import '../../l10n/app_localizations.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/no_data_widget.dart';
import '../home/item_card.dart';
class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  late final NotificationBloc _notificationBloc;
  late final SaveBloc _saveBloc;
  late final RefreshTokenBloc _refreshTokenBloc;
  String _token = '', _language = '';
  getUserRout() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    var language = await UserSharedPreference.getValue(
      SharedPreferenceHelper.languageCode,
    );
    _token = token ?? "";
    _language = language ?? "";
    _notificationBloc.add( NotificationDataEvent(
        token: _token, language: _language
    ));
  }

  @override
  void initState() {
    _notificationBloc = context.read<NotificationBloc>();
    _saveBloc = context.read<SaveBloc>();
    _refreshTokenBloc = context.read<RefreshTokenBloc>();
    getUserRout();
    super.initState();
  }
  bool isFirstLoad=true;
  List<NotificationData> notificationData=[];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar:!kIsWeb ?  AppBar(
        title: Text(
          AppLocalizations.of(context)!.notification,
          style: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(fontWeight: FontWeight.w700, fontSize:kIsWeb ?20 : 20.sp),
        ),
        centerTitle: true,
      ):null,
      body: BlocConsumer<NotificationBloc, NotificationState>(
        builder: (_, state) {
          if (state is NotificationLoading) {
            return isFirstLoad? CommonCard(
                mHorizontal:kIsWeb ?0 :12 ,
                widget: ListView.builder(
              itemCount: 10, // Number of shimmer items
              itemBuilder: (context, index) {
                return const ShimmerLoadingWidget();
              },
            )):
            CommonCard(
              mHorizontal:kIsWeb ?0 :12 ,
              widget: ListView.builder(
                  itemCount:notificationData.length,
                  scrollDirection: Axis.vertical,
                  itemBuilder: (context, index) {
                    final data =notificationData[index];
                    return Column(
                      children: [
                        GestureDetector(
                          onTap: (){
                            _saveBloc.add(NotificationRead(id: Utils.formatString(data.id), token: _token));
                            _notificationBloc.add( NotificationDataEvent(
                                token: _token, language: _language
                            ));
                          },
                          child: Container(
                            padding: EdgeInsets.symmetric(vertical:kIsWeb ?4 : 4.h,horizontal: kIsWeb ?4 :4.w),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(kIsWeb ?4 :4.r),
                              color:data.status=="unread"?const Color(0xFFE8F1FD):Colors.white,
                            ),

                            child: Row(
                              children: [
                                CircleAvatar(
                                  radius:kIsWeb ?22 : 22.r,
                                  backgroundColor: const Color(0xFF1A73E8),
                                  child: Image.asset(
                                    AssetsIcons.notification,
                                    fit: BoxFit.cover,
                                    width: kIsWeb ?22 :22.w,
                                    height:  kIsWeb ?22 :22.h,
                                    color: Colors.white,
                                  ),
                                ),
                                SizedBox(
                                  width:kIsWeb ?8 : 8.w,
                                ),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        Utils.formatString(data.title),
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodyMedium
                                            ?.copyWith(fontWeight: FontWeight.w700, fontSize:kIsWeb ?12 : 12.sp),
                                      ),
                                      SizedBox(
                                        height: kIsWeb ?4:4.h,
                                      ),
                                      Text(
                                        Utils.formatString(data.message),
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodyMedium
                                            ?.copyWith(fontWeight: FontWeight.w400, fontSize:kIsWeb ?10 : 10.sp),
                                      ),
                                      SizedBox(
                                        height: kIsWeb ?4 :4.h,
                                      ),
                                      Row(
                                        children: [
                                          Text(
                                            Utils.formatDate(data.createdAt),
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodyMedium
                                                ?.copyWith(fontWeight: FontWeight.w400, fontSize:kIsWeb ?10 : 10.sp),
                                          ),
                                          SizedBox(width: kIsWeb ?4 :4.w,),
                                          Text(
                                            Utils.formatTime(data.createdAt),
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodyMedium
                                                ?.copyWith(fontWeight: FontWeight.w400, fontSize:kIsWeb ?10 : 10.sp),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        Divider(thickness:kIsWeb ?1 : 1.h, color: const Color(0xFFCECECE))
                      ],
                    );
                  }),
            );
          }
          if(state is NotificationTokenExp){
            CommonFunctions.checkTokenAndProceeds(
              refreshTokenBloc: _refreshTokenBloc,
              onProceed:() async {
                _notificationBloc.add( NotificationDataEvent(
                    token: _token, language: _language
                ));
              },
                onLogout: ()async{
                  context.goNamed(RouteNames.loginScreen);
                }
            );
          }
          if (state is NotificationLoaded) {
            if (isFirstLoad &&state.hasConnectionError) {
              CommonFunctions.showCustomSnackBar(
                  context, AppLocalizations.of(context)!.noInternet
              );
            }
            isFirstLoad =false;
            final data=state.notificationModel.data;
            if(data!=null){
              notificationData=data;
              return   data.isEmpty?
              const Center(child: NoDataWidget())
                  :  CommonCard(
                mHorizontal:kIsWeb ?0 :12 ,
                widget: ListView.builder(
                    itemCount: state.notificationModel.data!.length,
                    scrollDirection: Axis.vertical,
                    itemBuilder: (context, index) {
                      final data =state.notificationModel.data![index];
                      return Column(
                        children: [
                          GestureDetector(
                            onTap: (){
                              _saveBloc.add(NotificationRead(id: Utils.formatString(data.id), token: _token));
                              _notificationBloc.add( NotificationDataEvent(
                                  token: _token, language: _language
                              ));
                            },
                            child: Container(
                              padding: EdgeInsets.symmetric(vertical:kIsWeb ?4 : 4.h,horizontal:kIsWeb ?4 : 4.w),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(kIsWeb ?4 :4.r),
                                color:data.status=="unread"?const Color(0xFFE8F1FD):Colors.white,
                              ),
                              child: Row(
                                children: [
                                  CircleAvatar(
                                    radius: kIsWeb ?25 :25.r,
                                    backgroundColor: const Color(0xFF1A73E8),
                                    child: Image.asset(
                                      AssetsIcons.notification,
                                      fit: BoxFit.cover,
                                      width: kIsWeb ?22 :22.w,
                                      height:  kIsWeb ?22 :22.h,
                                      color: Colors.white,
                                    ),
                                  ),
                                  SizedBox(
                                    width: kIsWeb ?8 :8.w,
                                  ),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          Utils.formatString(data.title),
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodyMedium
                                              ?.copyWith(fontWeight: FontWeight.w700, fontSize:kIsWeb ?12 : 12.sp),
                                        ),
                                        SizedBox(
                                          height:kIsWeb ?4 : 4.h,
                                        ),
                                        Text(
                                          Utils.formatString( data.message),
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodyMedium
                                              ?.copyWith(fontWeight: FontWeight.w400, fontSize:kIsWeb ?10 : 10.sp),
                                        ),
                                        SizedBox(
                                          height: kIsWeb ?4 :4.h,
                                        ),
                                        Row(
                                          children: [
                                            Text(
                                              Utils.formatDate(data.createdAt),
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .bodyMedium
                                                  ?.copyWith(fontWeight: FontWeight.w400, fontSize: kIsWeb ?10 :10.sp),
                                            ),
                                            SizedBox(
                                              width: kIsWeb ?4 :4.w,
                                            ),
                                            Text(
                                              Utils.formatDate(data.createdAt),
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .bodyMedium
                                                  ?.copyWith(fontWeight: FontWeight.w400, fontSize: kIsWeb ?10 :10.sp),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          Divider(thickness: kIsWeb ?1 :1.h, color: const Color(0xFFCECECE))
                        ],
                      );
                    }),
              );
            }else{
              return  const Center(child: NoDataWidget());
            }

          }
          return Container();
        },
        listener: (context, state) {
          if (state is NotificationConnectionError) {
            CommonFunctions.showUpSnack(
              message: AppLocalizations.of(context)!.noInternet,
              context: context,
            );
          }
          else if (state is NotificationFailure) {
            CommonFunctions.showUpSnack(
              message: state.notificationModel.message??"",
              context: context,
            );
          }
        },
      )
    );
  }
}
