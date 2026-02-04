import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/text_styles.dart';
import '../../controller/provider/item_details_controler.dart';

class AttributeOptions extends StatelessWidget {
  const AttributeOptions({
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
                      ?.copyWith(fontSize: 12, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: options.map((option) {
                    return InkWell(
                      onTap: () {
                        provider.handleOptionSelect(attributeKey, option);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8,vertical: 8),
                        margin: const EdgeInsets.symmetric(horizontal: 2,vertical: 2),
                        decoration: BoxDecoration(
                          color:
                              provider.selectedOptions[attributeKey] == option
                                  ? const Color(0xFF0F172A)
                                  : const Color(0xFFF5FAFF),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          option,
                          style: CustomTextStyles.boldText(
                            14,
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
                const SizedBox(height: 6),
              ],
            );
          }).toList(),
        );
      },
    );
  }
}
