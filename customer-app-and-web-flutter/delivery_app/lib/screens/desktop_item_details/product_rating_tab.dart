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

class WebProductRating extends StatefulWidget {
  const WebProductRating(
      {super.key,
      required this.rating,
      required this.reviewCount,
      required this.reviewList});
  final String rating;
  final String reviewCount;
  final List<Review> reviewList;
  @override
  WebProductRatingState createState() => WebProductRatingState();
}

class WebProductRatingState extends State<WebProductRating> {
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
          const SizedBox(height: 20),
          // Product Rating Section
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.shade400,
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                Text(
                  widget.rating,
                  style: Theme.of(context).textTheme.headlineLarge!.copyWith(
                        fontSize: 32,
                        fontWeight: FontWeight.w700,
                      ),
                ),
                const SizedBox(width: 4),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    Text(
                      AppLocalizations.of(context)!.productRating,
                      style:
                          Theme.of(context).textTheme.headlineSmall!.copyWith(
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                              ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        StarRating(rating: widget.rating),
                        const SizedBox(width: 4),
                        Padding(
                          padding: EdgeInsets.only(top: 3.h),
                          child: Text(
                            "(${widget.reviewCount} ${AppLocalizations.of(context)!.contributes})",
                            style: Theme.of(context)
                                .textTheme
                                .headlineSmall!
                                .copyWith(
                                  fontSize: 12,
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
          const SizedBox(height: 16),
          Text(AppLocalizations.of(context)!.review,
              style: Theme.of(context).textTheme.headlineSmall!.copyWith(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  )),
          const SizedBox(height: 12),

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
                margin: const EdgeInsets.only(bottom: 8),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: CustomColors.baseColor,
                        child: Text(
                            Utils.formatToUppercaseInitial(review.reviewedBy,
                                fallback: "A.T"),
                            style: Theme.of(context)
                                .textTheme
                                .titleLarge!
                                .copyWith(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                )),
                      ),
                      const SizedBox(width: 12),
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
                                    fontSize: 14,
                                    color: Colors.black,
                                    fontWeight: FontWeight.w600,
                                  ),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                StarRating(
                                    rating: Utils.formatString(review.rating)),
                                const SizedBox(width: 6),
                                Text(
                                  Utils.formatString(review.reviewedAt),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: Theme.of(context)
                                      .textTheme
                                      .headlineSmall!
                                      .copyWith(
                                        fontSize: 13,
                                        color: Colors.black,
                                        fontWeight: FontWeight.w400,
                                      ),
                                )
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(Utils.formatString(review.review),
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyMedium!
                                    .copyWith(
                                      fontSize: 14,
                                      color: Colors.black,
                                      height: 1.0,
                                      fontWeight: FontWeight.w400,
                                    )),
                            const SizedBox(height: 8),
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
                                          height: 14,
                                          width: 16,
                                          color: Colors.black,
                                        ),
                                      )
                                    : Image.asset(
                                        AssetsIcons.like,
                                        height: 14,
                                        width: 16,
                                        color: Colors.grey,
                                      ),
                                const SizedBox(
                                  width: 4,
                                ),
                                Text(
                                  Utils.formatString(review.likeCount),
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyMedium
                                      ?.copyWith(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w400,
                                      ),
                                ),
                                Text(
                                  " | ",
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyMedium
                                      ?.copyWith(
                                        fontSize: 12,
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
                                          height: 14,
                                          width: 16,
                                          color: Colors.black,
                                        ),
                                      )
                                    : Image.asset(
                                        AssetsIcons.dislike,
                                        height: 14,
                                        width: 16,
                                        color: Colors.grey,
                                      ),
                                const SizedBox(
                                  width: 4,
                                ),
                                Text(
                                  Utils.formatString(review.dislikeCount),
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyMedium
                                      ?.copyWith(
                                        fontSize: 12,
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
          const SizedBox(height: 12),
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
                      style: const TextStyle(
                        fontSize: 14,
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
