import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/controller/bloc/product_suggestion_bloc/product_suggestion_event.dart';
import 'package:shimmer/shimmer.dart';
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
import '../home/item_card.dart';

class DesktopCategories extends StatefulWidget {
  const DesktopCategories({super.key});

  @override
  State<DesktopCategories> createState() => _DesktopCategoriesState();
}

class _DesktopCategoriesState extends State<DesktopCategories> {
  final TextEditingController searchCon = TextEditingController();

  late final ProductSuggestionBloc _productSuggestionBloc;
  String _language = '';
  getUserRout() async {
    var language = await UserSharedPreference.getValue(
      SharedPreferenceHelper.languageCode,
    );
    _language = language ?? "";
    _productSuggestionBloc.add(CategoriesList(
        limit: "50",
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
      body: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: 12,
        ),
        child: Column(
          children: [
            const SizedBox(
              height: 10,
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
            const SizedBox(
              height: 10,
            ),
            Expanded(
              child:
                  BlocConsumer<ProductSuggestionBloc, ProductSuggestionState>(
                builder: (_, state) {
                  if (state is ProductSuggestionLoading) {
                    return LayoutBuilder(builder: (context, constraints) {
                      const double itemWidth = 150.0;
                      int crossAxisCount =
                          ((constraints.maxWidth) / (itemWidth)).floor();
                      if (crossAxisCount < 2) crossAxisCount = 2;
                      return GridView.builder(
                        padding: EdgeInsets.zero,
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: crossAxisCount,
                            crossAxisSpacing: 6,
                            mainAxisSpacing: 0.0,
                            childAspectRatio: 0.6,
                            mainAxisExtent: 185),
                        itemCount: 100,
                        itemBuilder: (context, index) {
                          return const CategoryCardShimmer();
                        },
                      );
                    });
                  }

                  if (state is CategoriesListLoaded) {
                    return LayoutBuilder(builder: (context, constraints) {
                      const double itemWidth = 150.0;
                      int crossAxisCount =
                          ((constraints.maxWidth) / (itemWidth)).floor();
                      if (crossAxisCount < 2) crossAxisCount = 2;
                      return GridView.builder(
                        padding: EdgeInsets.zero,
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: crossAxisCount,
                            crossAxisSpacing: 6,
                            mainAxisSpacing: 0.0,
                            childAspectRatio: 0.6,
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
                              height: 160,
                              child: Column(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 12),
                                    height: 130,
                                    width: 130,
                                    decoration: const BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: Color(0xFFFFF7EA),
                                    ),
                                    child: Center(
                                        child: CommonImage(
                                      imageUrl: data.categoryThumbUrl ?? "",
                                      width: 100,
                                      height: 100,
                                      radius: BorderRadius.circular(50),
                                    )),
                                  ),
                                  Text(
                                    data.label,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyMedium!
                                        .copyWith(
                                          fontSize: 12,
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
                    });
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
      width: 130,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
        child: Shimmer.fromColors(
          baseColor: baseColor,
          highlightColor: highlightColor,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(vertical: 12),
                height: 130,
                width: 130,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Color(0xFFFFF7EA),
                ),
              ),
              const SizedBox(
                height: 14,
                width: 100,
              ),
              Container(
                height: 14,
                width: 100,
                color: baseColor,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
