import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/controller/bloc/product_suggestion_bloc/product_suggestion_event.dart';
import 'package:shimmer/shimmer.dart';
import '../../config/images.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/categories_bloc/categories_state.dart';

import '../../controller/bloc/product_suggestion_bloc/product_suggestion_bloc.dart';
import '../../controller/bloc/product_suggestion_bloc/product_suggestion_state.dart';
import '../../controller/provider/home_screen_provider.dart';
import '../../controller/provider/filter_controller.dart';
import '../../l10n/app_localizations.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/common_search_widget.dart';


class CategoriesScreen extends StatefulWidget {
  const CategoriesScreen({super.key});

  @override
  State<CategoriesScreen> createState() => _CategoriesScreenState();
}

class _CategoriesScreenState extends State<CategoriesScreen> {
  final TextEditingController searchCon = TextEditingController();

  late final ProductSuggestionBloc _productSuggestionBloc;
  String _language = '';
  getUserRout() async {
    var language = await UserSharedPreference.getValue(
      SharedPreferenceHelper.languageCode,
    );
    _language = language ?? "";
    _productSuggestionBloc.add(CategoriesList(
        limit: "200",
        language: _language,
        searchKey: "",
        sortField: "",
        sort: "",
        all: true));
  }

  @override
  void initState() {
    _productSuggestionBloc = context.read<ProductSuggestionBloc>();
    getUserRout();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    var filterCon = Provider.of<FilterController>(context);
    var homeCon = Provider.of<HomeScreenProvider>(context);
    return Scaffold(
      appBar: AppBar(
        // backgroundColor: Colors.white,
        title: Text(
          AppLocalizations.of(context)!.allCategories,
          style: Theme.of(context)
              .textTheme
              .titleLarge!
              .copyWith(fontSize: 16.sp, color: Colors.white),
        ),
        centerTitle: true,
      ),
      body: Padding(
        padding: EdgeInsets.symmetric(
          horizontal:kIsWeb ?20 : 12.w,
        ),
        child: Column(
          children: [
            SizedBox(
              height: kIsWeb ?10 :10.h,
            ),
            CommonSearchWidget(
                onSearch: (value) {
                    _productSuggestionBloc.add(CategoriesList(
                        limit: "200",
                        language: _language,
                        searchKey: value,
                        sortField: "",
                        sort: "",
                        all: true));
            },
              hint: AppLocalizations.of(context)!.searchCategoriesHere,
            ),
            SizedBox(
              height: kIsWeb ?10 :10.h,
            ),
            Expanded(
              child:
                  BlocConsumer<ProductSuggestionBloc, ProductSuggestionState>(
                builder: (_, state) {
                  if (state is ProductSuggestionLoading) {
                    return GridView.builder(
                      padding: EdgeInsets.zero,
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 3, // Two columns
                              crossAxisSpacing: 0, // Spacing between columns
                              mainAxisSpacing: 0.0, // Spacing between rows
                              childAspectRatio:
                                  0.6, // Adjust for item height/width ratio
                              mainAxisExtent: 150),
                      itemCount: 15, // Number of items
                      itemBuilder: (context, index) {
                        return const CategoryCardShimmer();
                      },
                    );
                  }

                  if (state is CategoriesListLoaded) {
                    return GridView.builder(
                      padding: EdgeInsets.zero,
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 3, // Two columns
                              crossAxisSpacing: 6, // Spacing between columns
                              mainAxisSpacing: 0.0, // Spacing between rows
                              childAspectRatio:
                                  0.6, // Adjust for item height/width ratio
                              mainAxisExtent: 185),
                      itemCount:
                          state.categoryModel.data!.length, // Number of items
                      itemBuilder: (context, index) {
                        var data = state.categoryModel.data![index];
                        return InkWell(
                          onTap: () {
                            filterCon.toggleCategory(
                                data.categoryName, data.id.toString());
                            homeCon.setCurrentIndexHomePage(1);
                             Navigator.pop(context);
                          },
                          child: SizedBox(
                            height:kIsWeb ?160 : 160.h,
                            child: Column(
                              children: [
                                Container(
                                  padding: EdgeInsets.symmetric(vertical:kIsWeb ?12 : 12.h),
                                  height: kIsWeb ?100 :100.h,
                                  width: kIsWeb ?100 :100.w,
                                  decoration: const BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: Color(0xFFFFF7EA),
                                  ),
                                  child: Center(
                                    child:data.categoryThumbUrl != null
                                        ? Image.network(
                                      data.categoryThumbUrl ?? "",
                                      width:kIsWeb ?60 : 60.w,
                                      height:kIsWeb ?60 : 60.h,
                                      fit: BoxFit.fill,
                                      errorBuilder:
                                          (context, error, stackTrace) {
                                        return Image.asset(
                                          Images.noImage,
                                          width: kIsWeb ?80 :80.w,
                                          height: kIsWeb ?80 :80.h,
                                          fit: BoxFit.fill,
                                        );
                                      },
                                      loadingBuilder: (context, child,
                                          loadingProgress) {
                                        if (loadingProgress == null) {
                                          return child;
                                        }
                                        return SizedBox(
                                          width: kIsWeb ?80 :80.w,
                                          height: 80.h,
                                          child: Center(
                                            child:
                                            CircularProgressIndicator(
                                              color: const Color(
                                                  0xFF1A73E8),
                                              value: loadingProgress
                                                  .expectedTotalBytes !=
                                                  null
                                                  ? loadingProgress
                                                  .cumulativeBytesLoaded /
                                                  (loadingProgress
                                                      .expectedTotalBytes ??
                                                      1)
                                                  : null,
                                            ),
                                          ),
                                        );
                                      },
                                    )
                                        : Image.asset(
                                      Images.noImage,
                                      width: kIsWeb ?80 :80.w,
                                      height: kIsWeb ?80 :80.h,
                                      fit: BoxFit.fill,
                                    ),
                                  ),
                                ),
                                Text(
                                  data.label,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyMedium!
                                      .copyWith(
                                        fontSize: kIsWeb ?12 :12.sp,
                                        color: const Color(0xFF0F172A),
                                        fontWeight: FontWeight.w400,
                                      ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    );
                  }
                  return Container();
                },
                listener: (context, state) {
                  if (state is CategoriesConnectionError) {
                    CommonFunctions.showUpSnack(
                      message: AppLocalizations.of(context)!.noInternet,
                      context: context,
                    );
                  }
                  if (state is ProductSuggestionFailure) {}
                },
              ),
            )
          ],
        ),
      ),
    );
  }
}

class CategoryCardShimmer extends StatelessWidget {
  const CategoryCardShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    final baseColor = Colors.grey.shade200;
    final highlightColor = Colors.grey.shade100;

    return SizedBox(
      width: kIsWeb ?130 :130.w,
      child: Card(
        color: Colors.white,
        shape: RoundedRectangleBorder(
          side: BorderSide(width: .1.w, color: baseColor),
          borderRadius: BorderRadius.circular(10.0),
        ),
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal:kIsWeb ?6 : 6.w, vertical:kIsWeb ?6 : 6.h),
          child: Shimmer.fromColors(
            baseColor: baseColor,
            highlightColor: highlightColor,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Image placeholder
                Expanded(
                  child: Container(
                    width: kIsWeb ?120 :120.w,
                    height: kIsWeb ?120 :120.h,
                    decoration: BoxDecoration(
                      color: baseColor,
                      borderRadius: BorderRadius.circular(kIsWeb ?8 :8.r),
                    ),
                  ),
                ),
                SizedBox(height:kIsWeb ?6 : 6.h),
                // Text placeholder
                Container(
                  height: kIsWeb ?14 :14.h,
                  width: kIsWeb ?100 :100.w,
                  color: baseColor,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
