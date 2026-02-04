import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:provider/provider.dart';
import '../../controller/bloc/delivery_charge_bloc/delivery_charge_bloc.dart';
import '../../controller/bloc/delivery_charge_bloc/delivery_charge_event.dart';
import '../../controller/bloc/delivery_charge_bloc/delivery_charge_state.dart';
import '../../controller/bloc/get_messsage_bloc/get_message_state.dart';
import '../../controller/provider/checkout_controler.dart';
import '../../l10n/app_localizations.dart';
import '../common_widgets/common_funcktion.dart';

class GetDeliveryCharge extends StatefulWidget {
  const GetDeliveryCharge({
    super.key,
    required this.lat,
    required this.long,
  });

  final double lat;
  final double long;

  @override
  State<GetDeliveryCharge> createState() => _GetDeliveryChargeState();
}

class _GetDeliveryChargeState extends State<GetDeliveryCharge> {
  late final DeliveryChargeBloc _deliveryChargeBloc;
  @override
  void initState() {
    super.initState();
    _deliveryChargeBloc = context.read<DeliveryChargeBloc>();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      getUserToken();
    });
  }

  Future<void> getUserToken() async {
    final checkoutController =
        Provider.of<CheckoutController>(context, listen: false);

    _deliveryChargeBloc.add(DeliveryCharge(
      ariaIds: checkoutController.ariaIds,
      cLatitude: widget.lat,
      cLongitude: widget.long,
    ));
  }

  @override
  Widget build(BuildContext context) {
    final checkoutCon = context.watch<CheckoutController>();
    return BlocConsumer<DeliveryChargeBloc, DeliveryChargeState>(
      builder: (context, state) {
        if (state is DeliveryChargeLoading) {
          return const SizedBox();
        }
        if(state is DeliveryChargeFailure){
          checkoutCon.setChargeAPIColl(false);
        }
        return const SizedBox();
      },
      listener: (context, state) {
        if (state is GetMessageConnectionError) {
          CommonFunctions.showUpSnack(
            message: AppLocalizations.of(context)!.noInternet,
            context: context,
          );
          checkoutCon.setChargeAPIColl(false);
        }
        else if (state is DeliveryChargeLoaded) {
          final data = state.deliveryChargeModel;
          if(data.isNotEmpty){
            if (checkoutCon.selectedDeliveryOption == 'Home Delivery'){
              // Update the checkout delivery charge
              WidgetsBinding.instance.addPostFrameCallback((_) {
                checkoutCon. updatePackageDeliveryCharges(data);
                checkoutCon.setChargeAPIColl(false);
              });
            }
          }

        }
      },
    );
  }
}
