import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:shimmer/shimmer.dart';
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
import '../home/item_card.dart';

class DesktopCategoriesWidget extends StatefulWidget {
  const DesktopCategoriesWidget({super.key, required this.title});
  final String title;
  @override
  State<DesktopCategoriesWidget> createState() => _DesktopCategoriesWidgetState();
}

class _DesktopCategoriesWidgetState extends State<DesktopCategoriesWidget> {
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
            limit: "20",
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
    return SizedBox(
      height: 205,
      child: BlocConsumer<CategoriesBloc, CategoriesState>(
        builder: (_, state) {
          if (state is CategoriesLoading) {
            return ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: 8,
              itemBuilder: (context, index) {
                return const CategoryShimmer();
              },
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
                      const SizedBox(height: 12),
                      SizedBox(
                        height: 150,
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

                            return Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 6),
                              child: InkWell(
                                onTap: () {
                                  allProduct.allProductClear();
                                  filterCon.toggleCategory(
                                      data.categoryName, data.id.toString());
                                  homeCon.setCurrentIndexHomePage(1);
                                },
                                child: Column(
                                  children: [
                                    Container(
                                        width:120,
                                        height: 120,
                                        margin:
                                            EdgeInsets.symmetric(horizontal: 0.w),
                                        decoration: BoxDecoration(
                                            shape: BoxShape.circle, color: bgColor),
                                        child: Center(
                                          child:CommonImage(
                                            imageUrl: data.categoryThumbUrl ?? "",
                                            width: 100,
                                            height: 100,
                                            radius: BorderRadius.circular(50.r),
                                          ),
                                        )),
                                    const SizedBox(
                                      height: 6,
                                    ),
                                    Text(
                                      data.label,
                                      maxLines: 2,
                                      textAlign: TextAlign.center,
                                      overflow: TextOverflow.ellipsis,
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyMedium!
                                          .copyWith(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    )
                                  ],
                                ),
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
      ),
    );
  }
}


class CategoryShimmer extends StatelessWidget {
  const CategoryShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    final baseColor = Colors.grey.shade200;
    final highlightColor = Colors.grey.shade100;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
      child: Shimmer.fromColors(
        baseColor: baseColor,
        highlightColor: highlightColor,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              width:120,
              height: 120,
              decoration: const BoxDecoration(
                  shape: BoxShape.circle, color: Colors.grey),
            ),
            const SizedBox(
              height: 6,
            ),
            Container(
              height: 14,
              width: 100,
              color: baseColor,
            ),

          ],
        ),
      ),
    );
  }
}
