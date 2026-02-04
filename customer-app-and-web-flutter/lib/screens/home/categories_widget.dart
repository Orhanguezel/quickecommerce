import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/categories_bloc/categories_bloc.dart';
import '../../controller/bloc/categories_bloc/categories_event.dart';
import '../../controller/bloc/categories_bloc/categories_state.dart';
import '../../controller/provider/all_product_controller.dart';
import '../../controller/provider/home_screen_provider.dart';
import '../../controller/provider/filter_controller.dart';
import '../../l10n/app_localizations.dart';
import '../categories/categories_screen.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/item_title.dart';
import 'item_card.dart';

class CategoriesWidget extends StatefulWidget {
  const CategoriesWidget({super.key, required this.title});
  final String title;
  @override
  State<CategoriesWidget> createState() => _CategoriesWidgetState();
}

class _CategoriesWidgetState extends State<CategoriesWidget> {
  late final CategoriesBloc _categoriesBloc;

  Timer? _debounce;
  @override
  void initState() {
    _categoriesBloc = context.read<CategoriesBloc>();
    getUserRout();
    super.initState();
  }

  String _language = '';

  getUserRout() async {
    var language = await UserSharedPreference.getValue(
      SharedPreferenceHelper.languageCode,
    );
    _language = language ?? "";
    // Debounce API calls
    if (_debounce?.isActive ?? false) _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      if (_categoriesBloc.state is! CategoriesLoading &&
          _categoriesBloc.state is! CategoriesLoaded) {
        _categoriesBloc.add(Categories(
            limit: "200",
            language: _language,
            searchKey: "",
            sortField: "",
            sort: "",
            all: false));
      }
    });
  }

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    var filterCon = Provider.of<FilterController>(context);
    var homeCon = Provider.of<HomeScreenProvider>(context);
    var allProduct = Provider.of<AllProductController>(context);
    return BlocConsumer<CategoriesBloc, CategoriesState>(
      builder: (_, state) {
        if (state is CategoriesLoading) {
          return SizedBox(
            height: 120.h,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: 3,
              itemBuilder: (context, index) {
                return const CategoryCardShimmer();
              },
            ),
          );
        }
        else if (state is CategoriesLoaded) {
          return state.categoryModel.data!.isEmpty
              ? const SizedBox()
              : Column(
                  children: [
                    ItemTitle(
                        title: widget.title.isEmpty
                            ? AppLocalizations.of(context)!.category
                            : widget.title,
                        subTitle: "",
                        onTap: () {
                          Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (_) => const CategoriesScreen()));
                        }),
                    SizedBox(height: 12.h),
                    SizedBox(
                      height: 130.h,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: state.categoryModel.data!.length,
                        itemBuilder: (context, index) {
                          var data = state.categoryModel.data![index];
                          Color bgColor;
                          if (data.categoryBanner != null &&
                              data.categoryBanner.toString().isNotEmpty) {
                            bgColor = Color(int.parse(
                                data.categoryBanner.replaceFirst("#", "0xFF")));
                          } else {
                            bgColor = const Color(0xFF0F172A);
                          }

                          return InkWell(
                            onTap: () {
                              allProduct.allProductClear();
                              filterCon.toggleCategory(
                                  data.categoryName, data.id.toString());
                              homeCon.setCurrentIndexHomePage(1);
                            },
                            child: Column(
                              children: [
                                Container(
                                    width: 85.w,
                                    height: 85.h,
                                    margin:
                                        EdgeInsets.symmetric(horizontal: 0.w),
                                    decoration: BoxDecoration(
                                        shape: BoxShape.circle, color: bgColor),
                                    child: Center(
                                      child: CommonImage(
                                        imageUrl: data.categoryThumbUrl ?? "",
                                        width: 65.w,
                                        height: 65.h,
                                        radius: BorderRadius.circular(50.r),
                                      ),
                                    )),
                                SizedBox(
                                  height: 6.h,
                                ),
                                SizedBox(
                                  width: 100.w,
                                  child: Center(
                                    child: Text(
                                      data.label,
                                      maxLines: 2,
                                      textAlign: TextAlign.center,
                                      overflow: TextOverflow.ellipsis,
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyMedium!
                                          .copyWith(
                                            fontSize: 12.sp,
                                            fontWeight: FontWeight.w500,
                                          ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                  ],
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
        else if (state is CategoriesFailure) {
          CommonFunctions.showUpSnack(
            message: state.categoryModel.message.isNotEmpty == true
                ? state.categoryModel.message
                : "An error occurred",
            context: context,
          );
        }
      },
    );
  }
}

//SizedBox(
//                               width: 130.w,
//                               child: Card(
//                                 color: Colors.white,
//                                 shape: RoundedRectangleBorder(
//                                   side: BorderSide(width: .1.w),
//                                   borderRadius: BorderRadius.circular(10.0),
//                                 ),
//                                 child: Padding(
//                                   padding: EdgeInsets.symmetric(
//                                     horizontal: 6.w,
//                                     vertical: 6.h,
//                                   ),
//                                   child: Column(
//                                     crossAxisAlignment:
//                                         CrossAxisAlignment.start,
//                                     children: [
//                                       Expanded(
//                                         child:  CommonImage(
//                                           imageUrl: data.categoryThumbUrl ?? "",
//                                           width: 120.w,
//                                           height: 150.h,
//                                         ),
//                                       ),
//                                       SizedBox(
//                                         height: 6.h,
//                                       ),
//                                       Text(
//                                         data.label,
//                                         maxLines: 1,
//                                         overflow: TextOverflow.ellipsis,
//                                         style: Theme.of(context)
//                                             .textTheme
//                                             .bodyMedium!
//                                             .copyWith(
//                                               fontSize: 14.sp,
//                                               color: const Color(0xFF0F172A),
//                                               fontWeight: FontWeight.w500,
//                                             ),
//                                       ),
//                                     ],
//                                   ),
//                                 ),
//                               ),
//                             )
