import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/config/images.dart';
import 'package:quick_ecommerce/controller/provider/payment_option_controller.dart';

class OnlinePaymentOption extends StatefulWidget {
  const OnlinePaymentOption({super.key,this.isShowCashOnDelivery=false});
final bool isShowCashOnDelivery;
  @override
  State<OnlinePaymentOption> createState() => _OnlinePaymentOptionState();
}

class _OnlinePaymentOptionState extends State<OnlinePaymentOption> {
  @override
  Widget build(BuildContext context) {
    final paymentCon = Provider.of<PaymentOptionCon>(context);
    return   Center(
      child: Wrap(
        spacing: 8.0,
        runSpacing: 8.0,
        children: paymentCon.paymentGateways.map((dataSort) {
          return _buildRadioOption(
            context,
            dataSort.name,
            dataSort.imageUrl ?? "",
          );
        }).toList(),
      ),
    );
  }


  Widget _buildRadioOption(
      BuildContext context,
      String label,
      String assetPath,
      ) {
    return Consumer<PaymentOptionCon>(
      builder: (context, optionCon, child) {
        return GestureDetector(
          onTap: () {
            optionCon.setPaymentType(label);
          },
          child: Container(
            width:kIsWeb ? 150 :  150.w,
            margin: EdgeInsets.only(bottom:kIsWeb ? 8:  8.h),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(kIsWeb ? 5 : 5.r),
              border: Border.all(
                width: kIsWeb ? 1 : 1.w,
                color: optionCon.selectedPaymentType == label
                    ? Colors.blue
                    : Colors.grey,
              ),
            ),
            child: Row(
              children: [
                Radio<String>(
                  value: label,
                  groupValue: optionCon.selectedPaymentType,
                  fillColor: WidgetStateProperty.resolveWith<Color>(
                        (Set<WidgetState> states) {
                      if (states.contains(WidgetState.selected)) {
                        return Colors.blue;
                      }
                      return Colors.grey;
                    },
                  ),
                  onChanged: (value) {
                    if (value != null) {
                      optionCon.setPaymentType(value);
                    }
                  },
                ),
                assetPath.isNotEmpty
                    ? Image.network(
                  assetPath,
                  errorBuilder: (context, error, stackTrace) {
                    return Image.asset(
                      Images.noImage,
                      fit: BoxFit.cover,
                      width: kIsWeb ? 76 : 76.w,
                      height:kIsWeb ? 20 :  20.h,
                    ); // Fallback image
                  },
                  height:kIsWeb ? 18 :  18.h,
                  width: kIsWeb ? 50 : 50.w,
                  fit: BoxFit.cover,
                )
                    : Image.asset(
                  Images.noImage,
                  fit: BoxFit.cover,
                  width: kIsWeb ? 76 : 76.w,
                  height: kIsWeb ? 20 : 20.h,
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
