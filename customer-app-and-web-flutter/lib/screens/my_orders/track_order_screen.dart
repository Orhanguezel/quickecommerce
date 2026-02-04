import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_polyline_points/flutter_polyline_points.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:quick_ecommerce/config/colors.dart';
import 'package:quick_ecommerce/config/icons.dart';
import '../../config/api_urls.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/strings.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/profile_bloc/profile_bloc.dart';
import '../../controller/bloc/profile_bloc/profile_event.dart';
import '../../controller/bloc/profile_bloc/profile_state.dart';
import '../../data/data_model/order_details_model.dart';
import '../../l10n/app_localizations.dart';
import '../common_widgets/common_card.dart';
import '../common_widgets/common_funcktion.dart';

class TrackOrderScreen extends StatefulWidget {
  const TrackOrderScreen(
      {super.key,
      required this.orderId,
      required this.orderStatus,
      required this.storeLat,
      required this.storeLong,
      required this.orderTracking});
  final String orderId;
  final String orderStatus;
  final double storeLat;
  final double storeLong;
  final List<OrderTracking> orderTracking;
  @override
  State<TrackOrderScreen> createState() => _TrackOrderScreenState();
}

class _TrackOrderScreenState extends State<TrackOrderScreen> {
  late final ProfileBloc _profileBloc;
  String _token = '';
  Map<PolylineId, Polyline> polyLines = {};
  Set<Marker> markers = {};
  Position? _position;
  PolylinePoints polylinePoints = PolylinePoints(apiKey: ApiUrls.googleAPIKey);
  BitmapDescriptor deliverymanIcon = BitmapDescriptor.defaultMarker;
  BitmapDescriptor storeIcon = BitmapDescriptor.defaultMarker;
  BitmapDescriptor customerIcon = BitmapDescriptor.defaultMarker;
  late GoogleMapController mapController;
  LatLng _currentP = const LatLng(23.802903880337343, 90.3701296623558);
  LatLng endLocation = const LatLng(23.798806030350704, 90.35422227084041);
  bool get _isStoreLocation => widget.orderStatus == 'processing' ||
      widget.orderStatus == 'pending' ||
      widget.orderStatus == 'confirmed';
  @override
  void initState() {
    _profileBloc = context.read<ProfileBloc>();
    _initMap();
    getUserToken();
    super.initState();
  }

  Future<void> _initMap() async {
    await setCustomMarkerIcon();
    await getDirections();
  }

  Future<void> getUserToken() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    _token = token ?? "";
 if(!_isStoreLocation){
   _profileBloc.add(OrderTrack(orderId: widget.orderId, token: _token));
 }

  }

  Future<void> setCustomMarkerIcon() async {
    deliverymanIcon = await BitmapDescriptor.asset(
      ImageConfiguration.empty,
      AssetsIcons.dLocation,
      width: kIsWeb?30 : 30.w,
      height: kIsWeb?30 : 30.h,
    );

    storeIcon = await BitmapDescriptor.asset(
      ImageConfiguration.empty,
      AssetsIcons.sLocation,
      width:  kIsWeb?30 :30.w,
      height: kIsWeb?30 : 30.h,
    );

    customerIcon = await BitmapDescriptor.asset(
      ImageConfiguration.empty,
      AssetsIcons.hLocation,
      width:  kIsWeb?30 :30.w,
      height:  kIsWeb?30 :30.h,
    );
  }


  ///this function use for user get destination direction  and darw polyline
  getDirections() async {
    List<LatLng> polylineCoordinates = [];
    _position = await CommonFunctions.perMissionCheck();
    _currentP = LatLng(_position!.latitude, _position!.longitude);
    RoutesApiResponse result = await polylinePoints.getRouteBetweenCoordinatesV2(
      request: RoutesApiRequest(
        origin: PointLatLng(_currentP.latitude, _currentP.longitude),
        destination:!_isStoreLocation?
        PointLatLng(widget.storeLat, widget.storeLong)
            :PointLatLng(endLocation.latitude, endLocation.longitude),
        travelMode: TravelMode.driving,
        routingPreference: RoutingPreference.trafficAware,  // optional
      ),
    );
    if (result.routes.isNotEmpty) {
      final route = result.routes.first;
      if (route.polylinePoints!=null) {
        for (var point in route.polylinePoints!) {
          polylineCoordinates.add(LatLng(point.latitude, point.longitude));
        }
      }
    }
    else {
      return Text(result.errorMessage.toString());
    }
    addPolyLine(polylineCoordinates);
  }

  ///this function use for draw polyline
  addPolyLine(List<LatLng> polylineCoordinates) {
    PolylineId id = const PolylineId("poly");
    Polyline polyline = Polyline(
      polylineId: id,
      color: CustomColors.baseColor,
      points: polylineCoordinates,
      width: 6,
    );

    setState(() {
      polyLines[polyline.polylineId] = polyline;
      markers.clear();
      /// this function use for start marker
      markers.add(Marker(
        rotation: _position != null ? _position!.heading : 0.0,
        //add start location marker
        markerId: MarkerId(_position.toString()),
        position: _position != null
            ? LatLng(_position!.latitude, _position!.longitude)
            : const LatLng(
                23.800805626847517, 90.37113074042452), //position of marker
        infoWindow: const InfoWindow(
          //popup info
          title: 'Starting Point ',
          snippet: 'Start Marker',
        ),
        icon: customerIcon, //Icon for Marker
      ));
      if(_isStoreLocation){
        /// this function use for destination marker
        markers.add(Marker(
          //add destination location marker
          markerId: MarkerId(widget.storeLat.toString()),
          position: LatLng(widget.storeLat, widget.storeLong),
          infoWindow: const InfoWindow(
            title: 'Destination Point ',
            snippet: 'Destination Marker',
          ),
          icon: storeIcon, //Icon for Marker
        ));
      }
      else{
        markers.add(Marker(
          //add destination location marker
          markerId: const MarkerId("Destination"),
          position: LatLng(endLocation.longitude, endLocation.longitude),
          infoWindow: const InfoWindow(
            //popup info
            title: 'Destination Point ',
            snippet: 'Destination Marker',
          ),
          icon: deliverymanIcon, //Icon for Marker
        ));
      }
    });
  }

  @override
  void dispose() {
    mapController.dispose();
    super.dispose();
  }


  final List<String> steps = [
    "Pending",
    "Confirmed",
    "Processing",
    "Pick-Up",
    "Shipped",
    "Delivered",
  ];
  int getStatusIndex() {
    final latestStatus = widget.orderStatus;
    return steps.indexWhere((step) =>
        step.toLowerCase().replaceAll('-', '') ==
        latestStatus.replaceAll('-', ''));
  }
  String getStatusDate() {
    final latestStatus = widget.orderStatus.toLowerCase().replaceAll('-', '');
    final matchedTracking = widget.orderTracking.firstWhere(
      (tracking) =>
          tracking.status.toLowerCase().replaceAll('-', '') == latestStatus,
      orElse: () => widget.orderTracking.first,
    );
    return matchedTracking.createdAt;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar:  kIsWeb?null: AppBar(
          title: Text(
            AppLocalizations.of(context)!.trackOrder,
            style: TextStyle(fontSize:22.sp, color: Colors.white),
          ),
          centerTitle: true,
        ),
        body: Column(
          children: [
            Padding(
              padding: EdgeInsets.symmetric(horizontal:  kIsWeb?16 :16.w, vertical: kIsWeb?20 : 20.h),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: List.generate(steps.length, (index) {
                    final isActive = getStatusIndex() >= index;
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          mainAxisAlignment: MainAxisAlignment.start,
                          children: [
                            SizedBox(width: kIsWeb?4 : 4.h),
                            Container(
                              padding: EdgeInsets.all( kIsWeb?6 :6.w),
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: isActive ? Colors.blue : Colors.grey,
                                  width: 2,
                                ),
                                color: isActive
                                    ? const Color(0xFF2196F3)
                                    : Colors.transparent,
                              ),
                              child: Icon(
                                Icons.check,
                                size:  kIsWeb?16 :16.sp,
                                color: isActive ? Colors.blue : Colors.grey,
                              ),
                            ),
                            SizedBox(width:  kIsWeb?6 :6.h),
                            if (index < steps.length - 1)
                              Container(
                                height: kIsWeb?4 : 4.h,
                                width:  kIsWeb?50 :50.w,
                                decoration: BoxDecoration(
                                  gradient: (getStatusIndex() > index)
                                      ? const LinearGradient(
                                          colors: [
                                            Colors.blue,
                                            Color(0xFFE8F1FD),
                                          ],
                                          begin: Alignment.centerLeft,
                                          end: Alignment.centerRight,
                                        )
                                      : null, // No gradient when not completed
                                  color: getStatusIndex() > index
                                      ? null
                                      : Colors.grey[300],
                                ),
                              ),
                            SizedBox(width: kIsWeb?4 : 4.h),
                          ],
                        ),
                        SizedBox(height: kIsWeb?4 : 4.h),
                        Text(
                          steps[index],
                          style: TextStyle(
                            fontSize:  kIsWeb?12 :12.sp,
                            fontWeight: FontWeight.w500,
                            color: isActive ? Colors.blue : Colors.grey,
                          ),
                        ),
                        SizedBox(height: kIsWeb?4 : 4.h),
                        if (getStatusIndex() == index)
                          Text(
                            getStatusDate(),
                            style: Theme.of(context)
                                .textTheme
                                .displayLarge!
                                .copyWith(
                                  fontSize:  kIsWeb?8 :8.sp,
                                  fontWeight: FontWeight.w400,
                                ),
                          )
                      ],
                    );
                  }),
                ),
              ),
            ),

            Expanded(
              child:Stack(
                children: [
                  CommonCard(
                    mHorizontal: kIsWeb?0:20,
                      pRight: 0,
                      pLeft: 0,
                      pTop: 0,
                      pBottom: 0,
                      widget: GoogleMap(
                        initialCameraPosition: CameraPosition(
                          target: _currentP,
                          zoom: 14,
                        ),
                        onMapCreated: (controller) {
                          mapController = controller;
                        },
                        markers:markers,
                        polylines: Set<Polyline>.of(polyLines.values),
                      )),
                 if(!_isStoreLocation)BlocListener<ProfileBloc, ProfileState>(
                    listener: (context, state) {
                      if (state is ProfileConnectionError) {
                        CommonFunctions.showUpSnack(
                          message: AppLocalizations.of(context)!.noInternet,
                          context: context,
                        );
                        return;
                      }
                      if (state is ProfileLoaded) {
                        if (state.hasConnectionError) {
                          CommonFunctions.showCustomSnackBar(
                            context,
                            AppLocalizations.of(context)!.noInternet,
                          );
                        }
                        final mapData = state.profileModel.data;
                        final lat = mapData?.lat;
                        final lng = mapData?.lng;
                        if (lat != null && lng != null) {
                          final latitude = Utils.formatDouble(lat);
                          final longitude = Utils.formatDouble(lng);
                          endLocation = LatLng(latitude, longitude);
                          getDirections();
                        }
                      }
                    },
                    child: const SizedBox(),
                  ),
                  if(!_isStoreLocation)Positioned(
                      bottom: kIsWeb?40 : 40.h,
                      left:  kIsWeb?20 :20.w,
                      child: InkWell(
                        onTap: () {
                           _profileBloc.add(OrderTrack(orderId:widget.orderId,token: _token));
                        },
                        child: Container(
                          padding: EdgeInsets.symmetric(
                              vertical:  kIsWeb?6 :6.h, horizontal: kIsWeb?10 : 10.w),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1A73E8),
                            borderRadius: BorderRadius.circular( kIsWeb?2 :2.r),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                Icons.refresh,
                                size:  kIsWeb?16 :16.sp,
                                color: Colors.white,
                              ),
                              SizedBox(width:  kIsWeb?8 :8.h),
                              Text(
                                AppLocalizations.of(context)!.refresh,
                                style: Theme.of(context)
                                    .textTheme
                                    .titleLarge
                                    ?.copyWith(
                                  fontSize:  kIsWeb?10 :10.sp,
                                  color: const Color(0xFFFFFFFF),
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ))
                ],
              ),
            ),
          ],
        ));
  }
}