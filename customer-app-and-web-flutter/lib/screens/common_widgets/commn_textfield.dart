// ignore_for_file: must_be_immutable

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';


class CommonTextField extends StatelessWidget {
  const CommonTextField(
      {super.key,
      required this.controler,
      required this.hint,
      this.label,
      this.iconData,
      this.prefixIcon,
      this.inputType,
      this.onChange,
        this.inputFormatters,
      required this.textAlign,
       this.redOnly=false,
        this.validator,
        this.focusNode,
        this.isPasswordHidden=false,
      this.onTap, this.textInputAction=TextInputAction.done});
  final TextEditingController controler;
  final String hint;
  final String? label;
  final Widget? iconData;
  final Widget? prefixIcon;
  final TextInputType? inputType;
  final Function(String)? onChange;
  final TextAlign textAlign;
  final TextInputAction textInputAction;
  final bool redOnly;
  final VoidCallback? onTap;
  final List<TextInputFormatter>? inputFormatters;
  final String? Function(String?)? validator;
  final bool isPasswordHidden;
  final FocusNode? focusNode;
  @override
  Widget build(BuildContext context) {
    return Container(
      height: kIsWeb ? 42 :42.h,
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
         border: Border.all(
             color:const Color(0xFFCECECE),
             width: kIsWeb ? 1 :1.w),
        borderRadius: BorderRadius.circular(kIsWeb ? 10 :10.r),
      ),
      child: SizedBox(
        height:kIsWeb ? 52 : 52.h,
        child: TextFormField(
          focusNode: focusNode,
          onTap: onTap,
          inputFormatters:inputFormatters,
          keyboardType: inputType,
          autocorrect: false,
          controller: controler,
          readOnly: redOnly,
          onChanged: onChange,
          textAlign: textAlign,
          textInputAction: textInputAction,
          obscureText: isPasswordHidden,
          cursorColor: Colors.black,
          style: Theme.of(context).textTheme.displaySmall!.copyWith(fontSize: 14,
          color: const Color(0xFF5A637E)
          ),
          enableInteractiveSelection: true,
          contextMenuBuilder: (BuildContext context, EditableTextState editableTextState) {
            return AdaptiveTextSelectionToolbar.buttonItems(
              anchors: editableTextState.contextMenuAnchors,
              buttonItems: editableTextState.contextMenuButtonItems,
            );
          },
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: Theme.of(context).textTheme.displayLarge!.copyWith(
                fontSize:kIsWeb ? 12 : 12.sp,fontWeight: FontWeight.w400,
                color: const Color(0x497E7B7B)
            ),
            labelText: label,
            labelStyle: Theme.of(context).textTheme.bodyMedium!.copyWith(fontSize: 14),
            suffixIcon: iconData,
            prefixIcon: prefixIcon,
            fillColor: const Color(0xFFFFFFFF),
            contentPadding:
            EdgeInsets.only(left: kIsWeb ? 12 :12.w, top: kIsWeb ? 4 :4.h, bottom:kIsWeb ? 0 : 0.h,right: kIsWeb ? 12 :12.w),
            border: OutlineInputBorder(
                borderRadius: BorderRadius.all(Radius.circular(kIsWeb ? 8 :8.0.r)),
                borderSide: BorderSide.none
            ),
            filled: true,
          ),
          validator: validator, // Pass the validator here
        ),
      ),
    );
  }
}
/// this class use for controler length validation


class NumericRangeFormatter extends TextInputFormatter {
  final double min;
  final double max;

  NumericRangeFormatter({required this.min, required this.max});

  @override
  TextEditingValue formatEditUpdate(
      TextEditingValue oldValue,
      TextEditingValue newValue,
      ) {
    if (newValue.text.isEmpty) {
      return newValue;
    }

    final newValueNumber = double.tryParse(newValue.text);

    if (newValueNumber == null) {
      return oldValue;
    }

    // Allow decimal numbers
    if (newValue.text == '.') {
      return newValue.copyWith(text: '0.');
    }

    // Handle the case when the value is out of range
    if (newValueNumber < min) {
      return newValue.copyWith(text: min.toString());
    } else if (newValueNumber > max) {
      return newValue.copyWith(text: max.toString());
    } else {
      return newValue;
    }
  }
}

class MaxAmountInputFormatter extends TextInputFormatter {
  final double maxAmount;

  MaxAmountInputFormatter(this.maxAmount);

  @override
  TextEditingValue formatEditUpdate(
      TextEditingValue oldValue, TextEditingValue newValue) {
    try {
      final input = double.tryParse(newValue.text) ?? 0;
      if (input > maxAmount) {
        return oldValue;
      }
      return newValue;
    } catch (e) {
      return oldValue;
    }
  }
}


class CommonTextFields extends StatelessWidget {
  const CommonTextFields({
    super.key,
    required this.controler,
    required this.hint,
    this.label,
    this.iconData,
    this.prefixIcon,
    this.inputType,
    this.onChange,
    this.inputFormatters,
    required this.textAlign,
    required this.redOnly,
    this.validator,
    this.focusNode,
    this.isPasswordHidden = false,
    this.onTap,
    this.textInputAction = TextInputAction.done,
  });

  final TextEditingController controler;
  final String hint;
  final String? label;
  final Widget? iconData;
  final Widget? prefixIcon;
  final TextInputType? inputType;
  final Function(String)? onChange;
  final TextAlign textAlign;
  final TextInputAction textInputAction;
  final bool redOnly;
  final VoidCallback? onTap;
  final List<TextInputFormatter>? inputFormatters;
  final String? Function(String?)? validator;
  final bool isPasswordHidden;
  final FocusNode? focusNode;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: kIsWeb ? 70 :70.h,
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        border: Border.all(color: const Color(0xFFCCCECF), width:kIsWeb ?0.5 : 0.5.w),
        borderRadius: BorderRadius.circular(kIsWeb ? 5 :5.r),
      ),
      child: TextFormField(
        focusNode: focusNode,
        onTap: onTap,
        inputFormatters: inputFormatters,
        keyboardType: inputType,
        autocorrect: false,
        controller: controler,
        readOnly: redOnly,
        onChanged: onChange,
        textAlign: textAlign,
        textInputAction: textInputAction,
        obscureText: isPasswordHidden,
        maxLines: 4,
        style: Theme.of(context).textTheme.displaySmall!.copyWith(fontSize: kIsWeb ? 14 :14.sp),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: Theme.of(context).textTheme.displayLarge!.copyWith(
              fontSize: 12, fontWeight: FontWeight.w400,
              color: const Color(0x497E7B7B)
          ),
          labelText: label,
          labelStyle:
          Theme.of(context).textTheme.bodyMedium!.copyWith(fontSize: kIsWeb ? 14 :14.sp),
          suffixIcon: iconData,
          prefixIcon: prefixIcon,
          fillColor: const Color(0xFFFFFFFF),
          contentPadding: EdgeInsets.only(
              left: kIsWeb ? 12 :12.w, top:kIsWeb ? 12 : 12.h, bottom:kIsWeb ? 12 : 12.h, right:kIsWeb ? 12 : 12.w),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.all(Radius.circular(kIsWeb ? 5.0 :5.0.r)),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.all(Radius.circular(kIsWeb ? 5.0 :5.0.r)),
            borderSide: BorderSide.none,
          ),
          filled: true,
        ),
        validator: validator,
      ),
    );
  }
}

