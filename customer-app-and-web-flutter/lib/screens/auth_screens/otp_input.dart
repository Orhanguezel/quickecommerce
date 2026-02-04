import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class OTPInput extends StatefulWidget {
  final TextEditingController otpCon;
  final double height,width;
  const OTPInput({
    super.key,
    required this.otpCon,
    this.height=45,
    this.width=48,
  });

  @override
  State<OTPInput> createState() => _OTPInputState();
}

class _OTPInputState extends State<OTPInput> {
  late final List<TextEditingController> controllers;

  @override
  void initState() {
    super.initState();
    controllers = List.generate(6, (_) => TextEditingController());
  }

  @override
  void dispose() {
    for (var controller in controllers) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(
        6,
            (index) => _buildOTPBox(context, controllers[index], index,widget.height,widget.width),
      ),
    );
  }

  Widget _buildOTPBox(
      BuildContext context, TextEditingController controller, int index,double height,double width) {
    return ValueListenableBuilder<TextEditingValue>(
      valueListenable: controller,
      builder: (context, value, _) {
        final borderColor =
        value.text.isNotEmpty ? const Color(0xFF1A73E8) : Colors.grey;

        return Container(
          height:kIsWeb?height: height.h,
          width: kIsWeb?width:width.w,
          margin: EdgeInsets.only(right: index == 5 ? 0 :kIsWeb?8:  8.0.w),
          decoration: BoxDecoration(
            border: Border.all(color: borderColor, width: 1.0),
            borderRadius: BorderRadius.circular(5.0),
          ),
          child: TextField(
            controller: controller,
            keyboardType: TextInputType.number,
            maxLength: 1,
            textAlign: TextAlign.center,
            onChanged: (value) {
              if (value.isNotEmpty) {
                if (index < 5) {
                  FocusScope.of(context).nextFocus();
                }
              } else if (value.isEmpty && index > 0) {
                FocusScope.of(context).previousFocus();
              }

              // Collect OTP when all fields are filled
              final otp = controllers.map((e) => e.text).join();
              if (otp.length == 6) {
                widget.otpCon.text = otp;
              }
            },
            style: Theme.of(context)
                .textTheme
                .bodyLarge
                ?.copyWith(fontSize:kIsWeb?16:  16.sp, fontWeight: FontWeight.w500),
            decoration: const InputDecoration(
              border: InputBorder.none,
              counterText: '',
            ),
          ),
        );
      },
    );
  }
}