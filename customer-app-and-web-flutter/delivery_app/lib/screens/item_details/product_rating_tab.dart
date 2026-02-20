import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:quick_ecommerce/config/colors.dart';
import 'package:quick_ecommerce/config/icons.dart';
import 'package:quick_ecommerce/config/shared_preference_helper.dart';
import 'package:quick_ecommerce/config/strings.dart';
import 'package:quick_ecommerce/config/user_shared_preference.dart';
import 'package:quick_ecommerce/controller/bloc/save_bloc/save_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/save_bloc/save_event.dart';
import 'package:quick_ecommerce/screens/home/item_card.dart';
import '../../data/data_model/product_details_model.dart';
import '../../l10n/app_localizations.dart';

class ProductRatingScreen extends StatefulWidget {
  const ProductRatingScreen(
      {super.key,
      required this.rating,
      required this.reviewCount,
      required this.reviewList});
  final String rating;
  final String reviewCount;
  final List<Review> reviewList;
  @override
  ProductRatingScreenState createState() => ProductRatingScreenState();
}

class ProductRatingScreenState extends State<ProductRatingScreen> {
  bool showAllReviews = false;
  late final SaveBloc _saveBloc;
  @override
  void initState() {
    _saveBloc = context.read<SaveBloc>();
    getUserRout();
    super.initState();
  }

  String _token = '';
  getUserRout() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    _token = token ?? "";
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const NeverScrollableScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(height: 20.h),
          // Product Rating Section
          Container(
            padding: EdgeInsets.all(16.w),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8.r),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.shade400,
                  blurRadius: 6.r,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                Text(
                  widget.rating,
                  style: Theme.of(context).textTheme.headlineLarge!.copyWith(
                        fontSize: 32.sp,
                        fontWeight: FontWeight.w700,
                      ),
                ),
                SizedBox(width: 4.h),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    Text(
                      AppLocalizations.of(context)!.productRating,
                      style:
                          Theme.of(context).textTheme.headlineSmall!.copyWith(
                                fontSize: 14.sp,
                                fontWeight: FontWeight.w500,
                              ),
                    ),
                    SizedBox(height: 4.h),
                    Row(
                      children: [
                        StarRating(rating: widget.rating),
                        SizedBox(width: 4.h),
                        Padding(
                          padding: EdgeInsets.only(top: 3.h),
                          child: Text(
                            "(${widget.reviewCount} ${AppLocalizations.of(context)!.contributes})",
                            style: Theme.of(context)
                                .textTheme
                                .headlineSmall!
                                .copyWith(
                                  fontSize: 12.sp,
                                  fontWeight: FontWeight.w400,
                                ),
                          ),
                        ),
                      ],
                    )
                  ],
                )
              ],
            ),
          ),
          SizedBox(height: 16.h),
          Text(AppLocalizations.of(context)!.review,
              style: Theme.of(context).textTheme.headlineSmall!.copyWith(
                    fontSize: 18.sp,
                    fontWeight: FontWeight.w600,
                  )),
          SizedBox(height: 12.h),

          ListView.builder(
            shrinkWrap: true,
            physics:
                const NeverScrollableScrollPhysics(), // Disables inner scrolling
            itemCount: showAllReviews
                ? widget.reviewList.length
                : (widget.reviewList.length > 2 ? 2 : widget.reviewList.length),
            itemBuilder: (context, index) {
              final review = widget.reviewList[index];
              return Card(
                color: Colors.white,
                margin: EdgeInsets.only(bottom: 8.h),
                child: Padding(
                  padding: EdgeInsets.all(12.w),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      CircleAvatar(
                        radius: 20.r,
                        backgroundColor: CustomColors.baseColor,
                        child: Text(
                            Utils.formatToUppercaseInitial(review.reviewedBy,
                                fallback: "A.T"),
                            style: Theme.of(context)
                                .textTheme
                                .titleLarge!
                                .copyWith(
                                  fontSize: 14.sp,
                                  fontWeight: FontWeight.w500,
                                )),
                      ),
                      SizedBox(width: 12.w),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              Utils.formatString(review.reviewedBy?.name),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context)
                                  .textTheme
                                  .bodyMedium!
                                  .copyWith(
                                    fontSize: 14.sp,
                                    color: Colors.black,
                                    fontWeight: FontWeight.w600,
                                  ),
                            ),
                            SizedBox(height: 4.h),
                            Row(
                              children: [
                                StarRating(
                                    rating: Utils.formatString(review.rating)),
                                SizedBox(width: 6.w),
                                Text(
                                  Utils.formatString(review.reviewedAt),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: Theme.of(context)
                                      .textTheme
                                      .headlineSmall!
                                      .copyWith(
                                        fontSize: 13.sp,
                                        color: Colors.black,
                                        fontWeight: FontWeight.w400,
                                      ),
                                )
                              ],
                            ),
                            SizedBox(height: 8.h),
                            Text(Utils.formatString(review.review),
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyMedium!
                                    .copyWith(
                                      fontSize: 14.sp,
                                      color: Colors.black,
                                      height: 1.0,
                                      fontWeight: FontWeight.w400,
                                    )),
                            SizedBox(height: 8.h),
                            Row(
                              children: [
                                review.liked == false
                                    ? InkWell(
                                        onTap: () {
                                          _saveBloc.add(ReviewReaction(
                                              reviewId: Utils.formatString(
                                                  review.reviewId),
                                              reactionType: "like",
                                              token: _token));
                                        },
                                        child: Image.asset(
                                          AssetsIcons.like,
                                          height: 14.h,
                                          width: 16.w,
                                          color: Colors.black,
                                        ),
                                      )
                                    : Image.asset(
                                        AssetsIcons.like,
                                        height: 14.h,
                                        width: 16.w,
                                        color: Colors.grey,
                                      ),
                                SizedBox(
                                  width: 4.w,
                                ),
                                Text(
                                  Utils.formatString(review.likeCount),
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyMedium
                                      ?.copyWith(
                                        fontSize: 12.sp,
                                        fontWeight: FontWeight.w400,
                                      ),
                                ),
                                Text(
                                  " | ",
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyMedium
                                      ?.copyWith(
                                        fontSize: 12.sp,
                                        fontWeight: FontWeight.w400,
                                      ),
                                ),
                                review.liked == false
                                    ? InkWell(
                                        onTap: () {
                                          _saveBloc.add(ReviewReaction(
                                              reviewId: Utils.formatString(
                                                  review.reviewId),
                                              reactionType: "dislike",
                                              token: _token));
                                        },
                                        child: Image.asset(
                                          AssetsIcons.dislike,
                                          height: 14.h,
                                          width: 16.w,
                                          color: Colors.black,
                                        ),
                                      )
                                    : Image.asset(
                                        AssetsIcons.dislike,
                                        height: 14.h,
                                        width: 16.w,
                                        color: Colors.grey,
                                      ),
                                SizedBox(
                                  width: 4.w,
                                ),
                                Text(
                                  Utils.formatString(review.dislikeCount),
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyMedium
                                      ?.copyWith(
                                        fontSize: 12.sp,
                                        fontWeight: FontWeight.w400,
                                      ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
          SizedBox(height: 12.h),
          widget.reviewList.length > 2
              ? GestureDetector(
                  onTap: () {
                    setState(() {
                      showAllReviews = !showAllReviews;
                    });
                  },
                  child: Center(
                    child: Text(
                      showAllReviews ? "Show Less" : "See More",
                      style: TextStyle(
                        fontSize: 14.sp,
                        fontWeight: FontWeight.bold,
                        color: Colors.blue,
                      ),
                    ),
                  ),
                )
              : const SizedBox(),
        ],
      ),
    );
  }
}
