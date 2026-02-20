import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import '../../config/text_styles.dart';
import '../../controller/provider/item_details_controler.dart';

class AttributeOptionsSelector extends StatelessWidget {
  const AttributeOptionsSelector({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<ItemDetailsProvider>(
      builder: (context, provider, child) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: provider.attributeValues.entries.map((entry) {
            String attributeKey = entry.key;
            List<String> options = entry.value;

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  attributeKey[0].toUpperCase() + attributeKey.substring(1),
                  style: Theme.of(context)
                      .textTheme
                      .bodyMedium
                      ?.copyWith(fontSize: 12.sp, fontWeight: FontWeight.w600),
                ),
                SizedBox(height: 8.h),
                Wrap(
                  spacing: 8,
                  children: options.map((option) {
                    return InkWell(
                      onTap: () {
                        provider.handleOptionSelect(attributeKey, option);
                      },
                      child: Container(
                        padding: EdgeInsets.symmetric(horizontal: 8.w,vertical: 8.h),
                        margin: EdgeInsets.symmetric(horizontal: 2.w,vertical: 2.h),
                        decoration: BoxDecoration(
                          color:
                              provider.selectedOptions[attributeKey] == option
                                  ? const Color(0xFF0F172A)
                                  : const Color(0xFFF5FAFF),
                          borderRadius: BorderRadius.circular(4.r),
                        ),
                        child: Text(
                          option,
                          style: CustomTextStyles.boldText(
                            14.sp,
                            color: provider.selectedOptions[attributeKey] ==
                                    option
                                ? Colors.white
                                : Colors.black,
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
                SizedBox(height: 6.h),
              ],
            );
          }).toList(),
        );
      },
    );
  }
}
