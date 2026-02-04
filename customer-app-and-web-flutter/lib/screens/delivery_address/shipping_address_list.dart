import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/config/strings.dart';
import 'package:quick_ecommerce/controller/bloc/address_list_bloc/address_list_state.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_button.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_card.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_child_button.dart';
import 'package:quick_ecommerce/screens/common_widgets/no_data_widget.dart';
import 'package:shimmer/shimmer.dart';
import '../../config/icons.dart';
import '../../config/images.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/address_bloc/address_bloc.dart';
import '../../controller/bloc/address_bloc/address_event.dart';
import '../../controller/bloc/address_bloc/address_state.dart';
import '../../controller/bloc/address_list_bloc/address_list_bloc.dart';
import '../../controller/bloc/address_list_bloc/address_list_event.dart';

import '../../controller/provider/common_provider.dart';
import '../../l10n/app_localizations.dart';
import '../../router/route_name.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/common_loading.dart';
import 'add_delivery_address.dart';

class ShippingAddressList extends StatefulWidget {
  const ShippingAddressList({super.key});

  @override
  State<ShippingAddressList> createState() => _ShippingAddressListState();
}

class _ShippingAddressListState extends State<ShippingAddressList> {
  String _token = "";
  late final AddressListBloc _addressListBloc;
  late final AddressBloc _addressBloc;
  @override
  void initState() {
    _addressListBloc = context.read<AddressListBloc>();
    _addressBloc = context.read<AddressBloc>();
    getUserRout();
    super.initState();
  }

  getUserRout() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    _token = token ?? "";
    _addressListBloc
        .add(AddressList(id: "", type: "", status: "", token: _token));
  }

  @override
  Widget build(BuildContext context) {
    var commonProvider = Provider.of<CommonProvider>(context);
    return Scaffold(
      appBar: !kIsWeb
          ?AppBar(
        //  backgroundColor: Colors.white,
        title: Text(
          AppLocalizations.of(context)!.addressList,
          style: Theme.of(context)
              .textTheme
              .titleLarge!
              .copyWith(fontSize: 16.sp, fontWeight: FontWeight.w600),
        ),
        centerTitle: true,
      ):null,
      body: Column(
        children: [

          if(kIsWeb)
            CommonCard(
              mHorizontal:kIsWeb ?0 :12,
              widget:   Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  ChildButton(
                      widget: Text(
                        AppLocalizations.of(context)!.addAddress,
                        style: Theme.of(context).textTheme.titleLarge!
                            .copyWith(fontSize: 16, fontWeight: FontWeight
                                .w600),
                      ),
                      onPressed: (){
                        showDialog(
                          context: context,
                          builder: (BuildContext context) {
                            return AlertDialog(
                                insetPadding: EdgeInsets.zero,
                                contentPadding: const EdgeInsets.all(0),
                                backgroundColor: Theme.of(context).scaffoldBackgroundColor,
                                content: const SizedBox(
                                    width: 400,
                                    child: AddDeliveryAddress())
                            );
                          },
                        );
                      }
                  ),
                ],
              ),),
          Expanded(
              child:  commonProvider.isLoading
                  ? BlocConsumer<AddressBloc, AddressState>(
                listener: (context,state){
                  if(state is AddressConnectionError){
                    CommonFunctions.showUpSnack(
                        context: context,
                        message: AppLocalizations.of(context)!.noInternet
                    );
                    commonProvider.setLoading(false);
                  }
                  else if (state is AddressFailure){
                    CommonFunctions.showCustomSnackBar(
                        context, state.authModel.message);
                    commonProvider.setLoading(false);
                  }
                  else if(state is AddressLoaded){
                    commonProvider.setLoading(false);
                    CommonFunctions.showUpSnack(
                      message:state.authModel.message,
                      context: context,
                    );
                    _addressListBloc
                        .add(AddressList(id: "", type: "", status: "", token: _token));
                  }
                },
                builder: (context,state){
                  if(state is AddressLoading){
                    return const CommonLoading();
                  }

                  return const SizedBox();
                },
              )
                  : BlocConsumer<AddressListBloc, AddressListState>(
                builder: (_, state) {
                  if (state is AddressListLoading) {
                    return CommonCard(
                        mHorizontal:kIsWeb ?0 :12 ,
                        widget: ListView.builder(
                            itemCount:8,
                            scrollDirection: Axis.vertical,
                            itemBuilder: (context, index) {
                              return const AddressShimmer();
                            }));
                  }
                  else if (state is AddressListLoaded) {
                    if (state.hasConnectionError) {
                      CommonFunctions.showCustomSnackBar(
                          context, AppLocalizations.of(context)!.noInternet
                      );
                    }
                    return state.addressList.isEmpty
                        ? const Center(child: NoDataWidget())
                        : CommonCard(
                        mHorizontal:kIsWeb ?0 :12 ,
                        widget: ListView.builder(
                            itemCount: state.addressList.length,
                            scrollDirection: Axis.vertical,
                            itemBuilder: (context, index) {
                              final data = state.addressList[index];
                              return Column(
                                children: [
                                  Row(
                                    children: [
                                      data.type == "home"
                                          ? Image.asset(
                                        Images.home,
                                        height:kIsWeb ? 39 :  39.h,
                                        width:kIsWeb ? 39:  39.w,
                                      )
                                          : Image.asset(
                                        Images.office,
                                        height: kIsWeb ? 39 : 39.h,
                                        width: kIsWeb ? 39 : 39.w,
                                      ),
                                      SizedBox(
                                        width: kIsWeb ? 8 : 8.w,
                                      ),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              children: [
                                                Text(
                                                 Utils.capitalizeFirstLetter(data.type) ,
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .bodyMedium!
                                                      .copyWith(
                                                      fontSize:kIsWeb ? 16 :  16.sp,
                                                      fontWeight:
                                                      FontWeight
                                                          .w600),
                                                ),
                                                const Spacer(),
                                                InkWell(
                                                  onTap: () {
                                                    if(kIsWeb){
                                                      showDialog(
                                                        context: context,
                                                        builder: (BuildContext context) {
                                                          return   AlertDialog(
                                                              insetPadding: EdgeInsets.zero,
                                                              backgroundColor: Theme.of(context).scaffoldBackgroundColor,
                                                              content:SizedBox(
                                                                  width: 400,
                                                                  child: AddDeliveryAddress(
                                                                    id: Utils.formatString(data.id),
                                                                    title: Utils.formatString(data.title),
                                                                    type:Utils.formatString(data.type),
                                                                    email:Utils.formatString(data.email),
                                                                    contactNumber: Utils.formatString(data.contactNumber),
                                                                    countryCode: Utils.formatString(data.isoCountryCode??"BD"),
                                                                    address: Utils.formatString(data.address),
                                                                    lat:Utils.formatString( data.lat),
                                                                    long: Utils.formatString( data.long),
                                                                    area:Utils.formatInt(data.area) ,
                                                                    road: Utils.formatString(data.road),
                                                                    house:Utils.formatString(data.house) ,
                                                                    floor:Utils.formatString(data.floor) ,
                                                                    postalCode: Utils.formatString(data.postalCode),
                                                                    isDefault:data.isDefault ?? false ,
                                                                    status: Utils.formatString(data.status),

                                                                  ))
                                                          );
                                                        },
                                                      );
                                                    }else{
                                                      context.pushNamed(
                                                        RouteNames
                                                            .addDeliveryAddress,
                                                        extra: {
                                                          'id':Utils.formatString(data.id),
                                                          'title': Utils.formatString(data.title),
                                                          'type': Utils.formatString(data.type),
                                                          'email': Utils.formatString(data.email),
                                                          'contactNumber':Utils.formatString(data.contactNumber),
                                                          'country_code': Utils.formatString(data.isoCountryCode??"BD"),
                                                          'address': Utils.formatString(data.address),
                                                          'lat':Utils.formatString( data.lat),
                                                          'long':Utils.formatString(data.long ),
                                                          "area":Utils.formatInt(data.area),
                                                          'road':Utils.formatString(data.road),
                                                          'house':Utils.formatString(data.house),
                                                          'floor':Utils.formatString(data.floor),
                                                          'postalCode':Utils.formatString(data.postalCode),
                                                          'isDefault':
                                                          data.isDefault ?? false,
                                                          'status':Utils.formatString(data.status),
                                                        },
                                                      );
                                                    }

                                                  },
                                                  child: Image.asset(
                                                    AssetsIcons.edit,
                                                    height: kIsWeb ? 20 : 20.h,
                                                    width: kIsWeb ? 20 : 20.w,
                                                  ),
                                                ),
                                                SizedBox(
                                                  width: kIsWeb ? 8 : 8.w,
                                                ),
                                                InkWell(
                                                  onTap: () {
                                                    if(data.id!=null){
                                                      commonProvider.setLoading(true);
                                                      _addressBloc.add(
                                                          DeleteAddress(
                                                              id: data.id.toString(),
                                                              token: _token));
                                                    }

                                                  },
                                                  child: Image.asset(
                                                    AssetsIcons.delete,
                                                    height: kIsWeb ? 20 : 20.h,
                                                    width: kIsWeb ? 20 : 20.w,
                                                    color: Colors.red,
                                                  ),
                                                ),
                                              ],
                                            ),
                                            SizedBox(
                                              height:kIsWeb ? 6:  6.h,
                                            ),
                                            Text(
                                              data.address,
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .bodyMedium!
                                                  .copyWith(
                                                  fontSize:kIsWeb ? 10 :  10.sp,
                                                  fontWeight:
                                                  FontWeight.w400),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  SizedBox(
                                    height:kIsWeb ? 4 :  4.h,
                                  ),
                                  Divider(
                                      thickness:kIsWeb ? 1 :  1.h,
                                      color: const Color(0xFFCECECE)),
                                ],
                              );
                            }));
                  }
                  else if (state is AddressListTokenExp) {
                    context.goNamed(RouteNames.loginScreen);
                  }
                  return Container();
                },
                listener: (context, state) {
                  if (state is AddressListConnectionError) {
                    CommonFunctions.showUpSnack(
                      message: AppLocalizations.of(context)!.noInternet,
                      context: context,
                    );
                  }
                  else if (state is AddressListFailure) {
                    CommonFunctions.showUpSnack(
                      message: "Not Found",
                      context: context,
                    );
                  }
                },
              ),
          ),

          if(! kIsWeb)
          CommonButton(
              buttonText: AppLocalizations.of(context)!.addAddress,
              onTap: () {
                context.pushNamed(RouteNames.addDeliveryAddress);
              }),
          SizedBox(
            height:kIsWeb ? 8 :  8.h,
          )
        ],
      ),
    );
  }
}

class AddressShimmer extends StatelessWidget {
  const AddressShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding:  EdgeInsets.all(kIsWeb ? 10.0 : 10.0.sp),
      child: Column(
        children: [
          Row(
            children: [
              Shimmer.fromColors(
                baseColor: Colors.grey[200]!,
                highlightColor: Colors.grey[100]!,
                child: Container(
                  height:kIsWeb ? 39 :  39.h,
                  width: kIsWeb ? 39 : 39.w,
                  color: Colors.grey,
                ),
              ),
              SizedBox(width:kIsWeb ? 8 :  8.w),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Shimmer.fromColors(
                          baseColor: Colors.grey[200]!,
                          highlightColor: Colors.grey[100]!,
                          child: Container(
                            height: kIsWeb ? 16 : 16.h,
                            width: kIsWeb ? 100 : 100.w,
                            color: Colors.grey,
                          ),
                        ),
                        const Spacer(),
                        Shimmer.fromColors(
                          baseColor: Colors.grey[200]!,
                          highlightColor: Colors.grey[100]!,
                          child: Container(
                            height: kIsWeb ? 20 : 20.h,
                            width: kIsWeb ? 20 : 20.w,
                            color: Colors.grey,
                          ),
                        ),
                        SizedBox(width:kIsWeb ? 8 :  8.w),
                        Shimmer.fromColors(
                          baseColor: Colors.grey[200]!,
                          highlightColor: Colors.grey[100]!,
                          child: Container(
                            height: kIsWeb ? 20 : 20.h,
                            width:kIsWeb ? 20 :  20.w,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: kIsWeb ? 6 : 6.h),
                    Shimmer.fromColors(
                      baseColor: Colors.grey[200]!,
                      highlightColor: Colors.grey[100]!,
                      child: Container(
                        height: kIsWeb ? 10 : 10.h,
                        width: double.infinity,
                        color: Colors.grey,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: kIsWeb ? 4 : 4.h),
          Shimmer.fromColors(
            baseColor: Colors.grey[300]!,
            highlightColor: Colors.grey[100]!,
            child: Container(
              height: kIsWeb ? 1 : 1.h,
              color: const Color(0xFFCECECE),
            ),
          ),
        ],
      ),
    );
  }
}
