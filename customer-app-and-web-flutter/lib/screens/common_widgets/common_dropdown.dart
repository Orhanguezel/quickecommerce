import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../l10n/app_localizations.dart';
class CommonDropdown extends StatelessWidget {
  final List<dynamic> dList;
  final String? dropdownValue;
  final String? title;
  final ValueChanged<String?> onChanged;

  const CommonDropdown({
    super.key,
    required this.dList,
    this.dropdownValue,
    this.title= '',
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    String? effectiveValue = dropdownValue != null && dList.contains(dropdownValue)
        ? dropdownValue
        : null;
    return Container(
      height: kIsWeb ? 40 : 40.h,
      padding: EdgeInsets.all(kIsWeb ? 4 : 4.sp),
      margin: EdgeInsets.only(top:kIsWeb ? 4 :  4.h, bottom: kIsWeb ? 4 : 4.h),
      decoration: BoxDecoration(
          color: Theme.of(context).scaffoldBackgroundColor,
          borderRadius: BorderRadius.circular(kIsWeb ? 8 : 8.r),
          border:Border.all(color:const Color(0xFFCECECE), width:kIsWeb ? 1 :  1.w)
      ),
      child: Theme(
        data: Theme.of(context).copyWith(
           focusColor: Colors.transparent,
        ),
        child:DropdownButton<String>(
        borderRadius: BorderRadius.circular(8.r),
        menuMaxHeight: kIsWeb ? 500 : 500.h,
        isExpanded: true,
        key: ValueKey(effectiveValue),
        padding: EdgeInsets.only(left:kIsWeb ? 12 :  12.w, right:kIsWeb ? 6 :  6.w),
        underline: const SizedBox(),
        dropdownColor: Theme.of(context).cardColor,
        elevation: 8,
        hint: Text('${AppLocalizations.of(context)!.pleaseSelect} $title',
          style: Theme.of(context).textTheme.displaySmall!.copyWith(fontSize:kIsWeb ? 14 :  14.sp),
        ),
        value: effectiveValue,
        items: dList.map((dynamic item) {
          return DropdownMenuItem<String>(
            value: item,
            child: Text(
              item,
              overflow: TextOverflow.clip,
              style: Theme.of(context).textTheme.displaySmall!.copyWith(fontSize:kIsWeb ? 14 :  14.sp),
            ),
          );
        }).toList(),
        onChanged: onChanged,
      )
      ),
    );
  }
}




class CommonDropdownObject<T> extends StatelessWidget {
  final List<T> dList;
  final String? dropdownValue;
  final String? title;
  final String Function(T) getLabel;
  final String Function(T) getValue;
  final ValueChanged<String?> onChanged;

  const CommonDropdownObject({
    super.key,
    required this.dList,
    this.dropdownValue,
    this.title = '',
    required this.getLabel,
    required this.getValue,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    String? effectiveValue = dropdownValue != null &&
        dList.any((item) => getValue(item) == dropdownValue)
        ? dropdownValue
        : null;

    return Container(
      height:kIsWeb ? 32 :  32.h,
      padding: EdgeInsets.symmetric(horizontal:kIsWeb ? 2 : 2.w),
      margin: EdgeInsets.only(top:kIsWeb ? 4 :  4.h, bottom: kIsWeb ? 4 : 4.h),
      decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(kIsWeb ? 8 : 8.r),
          border: Border.all(color: const Color(0xFFCCCECF), width: kIsWeb ? 1 : 1.w)),
      child:  Theme(
        data: Theme.of(context).copyWith(
          focusColor: Colors.transparent,
        ),
        child:DropdownButton<String>(
        borderRadius: BorderRadius.circular(kIsWeb ? 8 : 8.r),
        menuMaxHeight: kIsWeb ? 500 : 500.h,
        isExpanded: true,
        icon: const Icon(Icons.arrow_drop_down),
        key: ValueKey(effectiveValue),
        padding: EdgeInsets.only(left:kIsWeb ? 12 :  12.w, right: kIsWeb ?6 : 6.w),
        underline: const SizedBox(),
        dropdownColor: Theme.of(context).cardColor,
        elevation: 8,
        hint: Text(
            dropdownValue!.isNotEmpty
                ? dropdownValue!
                : '${AppLocalizations.of(context)!.pleaseSelect} $title',
            style: Theme.of(context)
                .textTheme
                .displaySmall!
                .copyWith(fontSize: kIsWeb ? 12 : 12.sp,
            fontWeight: FontWeight.w500
            )),
        value: effectiveValue,
        items: dList.map((item) {
          return DropdownMenuItem<String>(
            value: getValue(item),
            child: Text(
              getLabel(item),
              overflow: TextOverflow.clip,
              style: Theme.of(context)
                  .textTheme
                  .displaySmall!
                  .copyWith(fontSize: kIsWeb ? 14 : 14.sp),
            ),
          );
        }).toList(),
        onChanged: onChanged,
      )),
    );
  }
}

