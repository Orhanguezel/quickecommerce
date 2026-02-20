import 'package:flutter/material.dart';
import 'package:intl_phone_field/country_picker_dialog.dart';
import 'package:intl_phone_field/intl_phone_field.dart';
import 'package:intl_phone_field/phone_number.dart';

class CommonPhoneField extends StatelessWidget {
  final TextEditingController controller;
  final String initialCountryCode;
  final void Function(PhoneNumber)? onChanged;
  final String? hintText;

  const CommonPhoneField({
    super.key,
    required this.controller,
    required this.initialCountryCode,
    required this.onChanged,
    this.hintText,
  });

  @override
  Widget build(BuildContext context) {
    return IntlPhoneField(
      cursorColor: Colors.grey,
      controller: controller,
      showDropdownIcon: true,
      dropdownIcon: const Icon(
        Icons.arrow_drop_down, // or any icon you prefer
        color: Colors.grey,
        size: 24,
      ),
      initialCountryCode: initialCountryCode,
      onChanged: onChanged,
      dropdownTextStyle: Theme.of(context)
          .textTheme
          .displayMedium!
          .copyWith(fontSize: 14),
      style: Theme.of(context)
          .textTheme
          .displayMedium!
          .copyWith(fontSize: 14),
      decoration: InputDecoration(
        hintText: hintText ?? 'Enter phone number',
        hintStyle: Theme.of(context).textTheme.displayMedium!.copyWith(
          fontSize: 10,
          fontWeight: FontWeight.w400,
        ),
        counterStyle: Theme.of(context).textTheme.displayMedium!.copyWith(
          fontSize: 10,
          color: Colors.black,
          fontWeight: FontWeight.w600,
        ),
        errorStyle: Theme.of(context)
            .textTheme
            .displayMedium!
            .copyWith(fontSize: 10, color: Colors.red),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(5),
          borderSide: const BorderSide(
            width: 0.2,
            color: Color(0xFFCECECE),
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(5),
          borderSide: const BorderSide(
            width: 0.2,
            color: Color(0xFFCECECE),
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(5),
          borderSide: const BorderSide(
            width: 0.2,
            color: Color(0xFFCECECE),
          ),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(5),
          borderSide: const BorderSide(
            width: 0.2,
            color: Color(0xFFCECECE),
          ),
        ),
        disabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(5),
          borderSide: const BorderSide(
            width: 0.2,
            color: Color(0xFFCECECE),
          ),
        ),
      ),
      pickerDialogStyle: PickerDialogStyle(
        countryNameStyle: Theme.of(context).textTheme.bodyMedium!.copyWith(
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        searchFieldInputDecoration: const InputDecoration(
          hintText: 'Search country',
          border: OutlineInputBorder(),
        ),
      ),
    );
  }
}