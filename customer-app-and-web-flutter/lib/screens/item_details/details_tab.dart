import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:quick_ecommerce/config/strings.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_card.dart';
import 'package:quick_ecommerce/screens/item_details/product_rating_tab.dart';

import '../../data/data_model/product_details_model.dart';
import '../../l10n/app_localizations.dart';
import '../common_widgets/no_data_widget.dart';
import 'ask_question_tab.dart';
import 'description_tab.dart';

class DetailsTab extends StatelessWidget {
  const DetailsTab({super.key, required this.product});
  final Product product;
  @override
  Widget build(BuildContext context) {
    return CommonCard(
      mVertical: 4,
      pRight: 12,
      pTop: 0,
      pLeft: 12,
      widget: DefaultTabController(
        length: 4,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TabBar(
              tabAlignment: TabAlignment.start,
              isScrollable: true,
              labelColor: Theme.of(context).primaryColor,
              unselectedLabelColor: Colors.grey,
              labelStyle: Theme.of(context)
                  .textTheme
                  .displayLarge
                  ?.copyWith(fontSize: 14.sp, fontWeight: FontWeight.w600),
              indicatorColor: Theme.of(context).primaryColor,
              tabs: [
                Tab(
                  text: AppLocalizations.of(context)!.description,
                ),
                Tab(
                  text: AppLocalizations.of(context)!.specifications,
                ),
                Tab(text: AppLocalizations.of(context)!.review),
                Tab(text: AppLocalizations.of(context)!.question),
              ],
            ),
            SizedBox(
              height: 300.h,
              child: TabBarView(
                children: [
                  SingleChildScrollView(
                    scrollDirection: Axis.vertical,
                    child: ContentRenderer(
                        content: Utils.formatString(product.description)),
                  ),
                  SpecificationsTab(
                    specifications: product.specifications != null ? product.specifications! : [],
                  ),
                  ProductRatingScreen(
                    rating: Utils.formatString(product.rating),
                    reviewCount: Utils.formatString(product.reviewCount),
                    reviewList: product.reviews != null ? product.reviews! : [],
                  ),
                  AskQuestionPage(
                    productId: Utils.formatString(product.id),
                    storeId: Utils.formatString(product.store!.id),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}


class SpecificationsTab extends StatelessWidget {
  const SpecificationsTab({super.key, required this.specifications});
 final List<Specification> specifications;
  @override
  Widget build(BuildContext context) {
    return specifications.isNotEmpty?
        ListView.builder(
        itemCount: specifications.length,
          itemBuilder: (BuildContext context, int index) {
          final data = specifications[index];
          return Container(
              decoration: BoxDecoration(
                border: Border.all(
                    color: Colors.grey,
                width: .4.w
                ),
              ),
              child:IntrinsicHeight(
                child: Row(
                  children: [
                    Expanded(
                      flex: 2,
                      child: Container(
                        color: Colors.grey.shade200,
                        padding: EdgeInsets.symmetric(horizontal:5.w,vertical: 5.h),
                        child: Text(
                          Utils.formatString(data.name),
                          style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                            fontSize: 12.sp,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ),
                    VerticalDivider(
                      color: Colors.grey,
                      thickness: 1,
                      width: 1.w,
                    ),
                    Expanded(
                      flex: 3,
                      child: Padding(
                        padding: EdgeInsets.symmetric(horizontal:5.w,vertical: 5.h),
                        child: Text(
                          Utils.formatString(data.value),
                          style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                            fontSize: 12.sp,
                            fontWeight: FontWeight.w400,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              )
          );
          }
        )
        :const Center(child: NoDataWidget());
  }
}
