import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/config/colors.dart';
import 'package:quick_ecommerce/controller/bloc/brand_bloc/brand_event.dart';
import 'package:quick_ecommerce/controller/bloc/favorites_bloc/favorites_event.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_funcktion.dart';
import '../../controller/bloc/brand_bloc/brand_bloc.dart';
import '../../controller/bloc/brand_bloc/brand_state.dart';
import '../../controller/bloc/categories_bloc/categories_bloc.dart';
import '../../controller/bloc/categories_bloc/categories_event.dart';
import '../../controller/bloc/categories_bloc/categories_state.dart';
import '../../controller/bloc/favorites_bloc/favorites_bloc.dart';
import '../../controller/bloc/favorites_bloc/favorites_state.dart';
import '../../controller/provider/filter_controller.dart';
import '../../data/data_model/brand_model.dart';
import '../../data/data_model/categories_model.dart';
import '../../data/data_model/store_model.dart';
import '../../l10n/app_localizations.dart';
import '../common_widgets/common_child_button.dart';
import '../common_widgets/common_dropdown.dart';
import '../common_widgets/field_title.dart';
import '../common_widgets/filter_screen.dart';
import '../home/item_card.dart';

class DesktopFilterDrawer extends StatefulWidget {
  const DesktopFilterDrawer({super.key, required this.onTap,
    required this.cancel});
  final VoidCallback onTap;
  final VoidCallback cancel;
  @override
  State<DesktopFilterDrawer> createState() => _DesktopFilterDrawerState();
}

class _DesktopFilterDrawerState extends State<DesktopFilterDrawer> {
  Widget _buildCategoriesList(List<CategoryData> items, BuildContext context) {
    final filterCon = Provider.of<FilterController>(context, listen: true);
    int selectedIndex = -1; // Track which category is expanded
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final category = items[index];
        final hasSubcategories =
            category.childrenRecursive?.isNotEmpty ?? false;
        final isSelected = filterCon.selectedIndex == index;
        return Column(
          key: ValueKey(category.id),
          children: [
            Row(
              children: [
                Checkbox(
                  value: filterCon.selectedCategories.contains(category.label),
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  checkColor: Colors.white,
                  side: BorderSide(
                    color: filterCon.selectedCategories.contains(category.label)
                        ? Colors.blue // Border color when checked
                        : Colors.grey, // Border color when unchecked
                    width: 1.0,
                  ),
                  onChanged: (value) {
                    final subcategoriesLabels = category.childrenRecursive
                        ?.map((e) => e.label ?? "")
                        .toList();
                    filterCon.toggleCategory(
                      category.label,
                      category.id.toString(),
                      subcategories: subcategoriesLabels,
                    );
                  },
                ),
                Expanded(
                  child: Text(
                    category.label ?? "",
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w400, fontSize: 12),
                  ),
                ),
                if (hasSubcategories)
                  InkWell(
                    onTap: () {
                      filterCon.toggleSelectedIndex(index);
                    },
                    child: Card(
                      elevation: 5,
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: Theme.of(context).cardColor,
                          border: Border.all(
                            width: .1,
                            color: Colors.grey.shade100,
                          ),
                          borderRadius: BorderRadius.circular(10.r),
                        ),
                        child: Icon(
                          selectedIndex == index
                              ? Icons.remove
                              : Icons.add,
                          size: 16,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            if (isSelected && hasSubcategories)
              Padding(
                padding: const EdgeInsets.only(left: 30),
                child: _buildSubcategoriesList(category.childrenRecursive ?? [],
                    context, filterCon, category.label ?? ""),
              ),
          ],
        );
      },
    );
  }


  Widget _buildSubcategoriesList(
    List<Child> subcategories,
    BuildContext context,
    FilterController filterCon,
    String parentCategoryLabel,
  ) {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: subcategories.length,
      itemBuilder: (context, index) {
        final subcategory = subcategories[index];
        return Row(
          children: [
            Checkbox(
              value: filterCon.selectedCategories.contains(subcategory.label),
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              checkColor: Colors.white,
              side: BorderSide(
                color: filterCon.selectedCategories.contains(subcategory.label)
                    ? Colors.blue // Border color when checked
                    : Colors.grey, // Border color when unchecked
                width: 1.0,
              ),
              onChanged: (value) {
                filterCon.toggleCategory(
                  subcategory.label ?? "",
                  subcategory.id.toString(),
                  parentCategory: parentCategoryLabel,
                );
              },
            ),
            Expanded(
              child: Text(
                subcategory.label ?? "",
                style: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.copyWith(fontWeight: FontWeight.w400, fontSize: 12),
              ),
            ),
          ],
        );
      },
    );
  }

  final List<String> filterOptions = [
    "Price High to Low",
    "Price Low to High",
    "Newest",
    "Flash Sale",
    "Popular Products",
    "Is Featured",
    "Best Selling",
  ];

  List<String> sizes = [
    'XXS',
    'XS',
    'S',
    'M',
    'L',
    'XL',
    'XXL',
    '35',
    '36',
    '37',
    '38',
    '39',
    '40',
    '41',
    '42',
    '43',
    '44',
    '45'
  ];
  List<Color> colors = [
    Colors.black,
    Colors.white,
    Colors.red,
    Colors.pink,
    Colors.purple,
    Colors.deepPurple,
    Colors.indigo,
    Colors.blue,
    Colors.lightBlue,
    Colors.teal,
    Colors.green,
    Colors.lime,
    Colors.yellow,
    Colors.amber,
    Colors.orange,
    Colors.deepOrange,
    Colors.brown,
    Colors.blueGrey,
  ];
  late final CategoriesBloc _categoriesBloc;
  late final BrandBloc _brandBloc;
  late final FavoritesBloc _favoritesBloc;
  final TextEditingController minPriceCon=TextEditingController();
  final TextEditingController maxPriceCon=TextEditingController();
  List<BrandModel> brandList = [];
  List<StoreTypeModel> storeTypeList = [];
  List<CategoryData> categoriesList = [];

  @override
  void initState() {
    _categoriesBloc = context.read<CategoriesBloc>();
    _brandBloc = context.read<BrandBloc>();
    _favoritesBloc = context.read<FavoritesBloc>();
    var filterCon = Provider.of<FilterController>(context,listen: false);
    minPriceCon.text=filterCon.priceRange.start.toStringAsFixed(0);
    maxPriceCon.text=filterCon.priceRange.end.toStringAsFixed(0);
    getUserRout();
    super.initState();
  }

  getUserRout() async {
    if (_categoriesBloc.state is! CategoriesLoaded) {
      _categoriesBloc.add(const Categories(
          limit: "",
          language: "",
          searchKey: "",
          sortField: "",
          sort: "",
          all: false));
    }
    if (_favoritesBloc.state is! StoreTypeLoaded) {
      _favoritesBloc.add(StoreType());
    }
    _brandBloc.add(Brand());
  }

  final TextEditingController categoryCon = TextEditingController();
  @override
  Widget build(BuildContext context) {
    var filterCon = Provider.of<FilterController>(context);
    return Scaffold(
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 10.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 20),
                        Row(
                          children: [
                            Text(
                              AppLocalizations.of(context)!.filterBy,
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    fontWeight: FontWeight.w500,
                                    fontSize: 18,
                                  ),
                            ),
                            const Spacer(),
                          ],
                        ),
                        const SizedBox(height: 8),
                        FieldTitle(title:AppLocalizations.of(context)!.short),

                        CommonDropdown(
                            dropdownValue: filterCon.selectedValue,
                            dList: filterOptions,
                            onChanged: (String? value) {
                              filterCon.updateSelectedValue(value!);
                              filterCon.setProductType(value);
                            }),
                        const SizedBox(height: 8),
                        FilterTitleWidget(
                          filterTitle: AppLocalizations.of(context)!.category,
                          isShow: filterCon.isProductTypeFilterShow,
                          onTap: () {
                            if (filterCon.isProductTypeFilterShow == true) {
                              filterCon.setProductTypeShow(false);
                            } else {
                              filterCon.setProductTypeShow(true);
                            }
                          },
                        ),
                        filterCon.isProductTypeFilterShow
                            ? Column(
                                children: [
                                  const SizedBox(
                                    height: 8,
                                  ),
                                  BlocConsumer<CategoriesBloc, CategoriesState>(
                                    listener: (context, state) {
                                      if (state is CategoriesConnectionError) {
                                        CommonFunctions.showUpSnack(
                                          message: AppLocalizations.of(context)!.noInternet,
                                          context: context,
                                        );
                                      }
                                    },
                                    builder: (context, state) {
                                      if (state is CategoriesLoaded) {
                                        if (state.hasConnectionError) {
                                          CommonFunctions.showCustomSnackBar(
                                              context, AppLocalizations.of(context)!.noInternet
                                          );
                                        }
                                        categoriesList = state.categoryModel.data!;
                                        return _buildCategoriesList(
                                            categoriesList, context);
                                      }
                                      if (state is CategoriesLoading) {
                                        return const ShimmerLoadingWidget();
                                      }
                                      return const SizedBox();
                                    },
                                  ),
                                ],
                              )
                            : const SizedBox(),
                        FilterTitleWidget(
                          filterTitle: "Price",
                          isShow: filterCon.isPriceFilterShow,
                          onTap: () {
                            if (filterCon.isPriceFilterShow == true) {
                              filterCon.setPriceFilterShow(false);
                            } else {
                              filterCon.setPriceFilterShow(true);
                            }
                          },
                        ),
                        filterCon.isPriceFilterShow
                            ? Column(
                                children: [
                                  RangeSlider(
                                    values: filterCon.priceRange,
                                    min: 1,
                                    max: 50000,
                                    divisions: 10,
                                    labels: RangeLabels(
                                        "\$${filterCon.priceRange.start.round()}",
                                        "\$${filterCon.priceRange.end.round()}"),
                                    activeColor: CustomColors.baseColor,
                                    onChanged: (RangeValues values) {
                                      minPriceCon.text=filterCon.priceRange.start.round().toString();
                                      maxPriceCon.text=filterCon.priceRange.end.round().toString();

                                      filterCon.updatePriceRange(values);
                                    },
                                  ),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: TextField(
                                          controller: minPriceCon,
                                          decoration:  InputDecoration(
                                            labelText: "From",
                                            border: const OutlineInputBorder(),
                                            labelStyle: Theme.of(context).textTheme.displaySmall!.copyWith(fontSize: 14,
                                                color: const Color(0xFF5A637E)
                                            ),
                                            contentPadding: const EdgeInsets.symmetric(
                                              horizontal: 12,
                                              vertical: 8,
                                            ),
                                          ),
                                          style: Theme.of(context).textTheme.displaySmall!.copyWith(fontSize: 14,
                                              color: const Color(0xFF5A637E)
                                          ),
                                          keyboardType: TextInputType.number,
                                          onChanged: (value) {
                                            double? fromValue =
                                                double.tryParse(value);
                                            if (fromValue != null &&
                                                fromValue <=
                                                    filterCon.priceRange.end) {
                                              filterCon.updatePriceRange(
                                                RangeValues(fromValue,
                                                    filterCon.priceRange.end),
                                              );
                                            }
                                          },
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: TextField(
                                          controller: maxPriceCon,
                                          decoration:  InputDecoration(
                                            labelText: "To",
                                            border: const OutlineInputBorder(),
                                            // isDense: true,
                                            labelStyle: Theme.of(context).textTheme.displaySmall!.copyWith(fontSize: 14,
                                                color: const Color(0xFF5A637E)
                                            ),
                                            contentPadding: const EdgeInsets.symmetric(
                                              horizontal: 12,
                                              vertical: 8,
                                            ),
                                          ),
                                          style:Theme.of(context).textTheme.displaySmall!.copyWith(fontSize: 14,
                                              color: const Color(0xFF5A637E)
                                          ) ,
                                          keyboardType: TextInputType.number,
                                          onChanged: (value) {
                                            double? toValue = double.tryParse(value);
                                            if (toValue != null &&
                                                toValue >=
                                                    filterCon.priceRange.start) {
                                              filterCon.updatePriceRange(
                                                RangeValues(
                                                    filterCon.priceRange.start,
                                                    toValue),
                                              );
                                            }
                                          },
                                        ),
                                      ),
                                    ],
                                  ),
                                  SizedBox(
                                    height: 8.h,
                                  ),
                                ],
                              )
                            : const SizedBox(),
                        FilterTitleWidget(
                          filterTitle: AppLocalizations.of(context)!.brand,
                          isShow: filterCon.isBrandFilterShow,
                          onTap: () {
                            if (filterCon.isBrandFilterShow == true) {
                              filterCon.setBrandFilterShow(false);
                            } else {
                              filterCon.setBrandFilterShow(true);
                            }
                          },
                        ),
                        filterCon.isBrandFilterShow
                            ? Column(
                                children: [
                                  const SizedBox(
                                    height: 8,
                                  ),
                                  BlocConsumer<BrandBloc, BrandState>(
                                    listener: (context, state) {
                                      if (state is BrandConnectionError) {
                                        CommonFunctions.showUpSnack(
                                          message: AppLocalizations.of(context)!.noInternet,
                                          context: context,
                                        );
                                      }
                                    },
                                    builder: (context, state) {
                                      if (state is BrandLoaded) {
                                        brandList = state.brandModel;
                                        return _buildBrandList(brandList, context);
                                      }
                                      if (state is BrandLoading) {
                                        return const ShimmerLoadingWidget();
                                      }
                                      return const SizedBox();
                                    },
                                  ),
                                ],
                              )
                            : const SizedBox(),
                        FilterTitleWidget(
                          filterTitle: AppLocalizations.of(context)!.type,
                          isShow: filterCon.isVendorFilterShow,
                          onTap: () {
                            if (filterCon.isVendorFilterShow == true) {
                              filterCon.setVendorFilterShow(false);
                            } else {
                              filterCon.setVendorFilterShow(true);
                            }
                          },
                        ),
                        filterCon.isVendorFilterShow
                            ? BlocConsumer<FavoritesBloc, FavoritesState>(
                                listener: (context, state) {
                                  if (state is FavoritesConnectionError) {
                                    CommonFunctions.showUpSnack(
                                      message: AppLocalizations.of(context)!.noInternet,
                                      context: context,
                                    );
                                  }
                                },
                                builder: (context, state) {
                                  if (state is FavoritesLoading) {
                                    return const ShimmerLoadingWidget();
                                  }
                                  if (state is StoreTypeLoaded) {
                                    storeTypeList = state.storeTypeModel;
                                    return _buildStoreList(storeTypeList, context);
                                  }

                                  return const SizedBox();
                                },
                              )
                            : const SizedBox(),
                        FilterTitleWidget(
                          filterTitle: AppLocalizations.of(context)!.rating,
                          isShow: filterCon.isRatingFilterShow,
                          onTap: () {
                            if (filterCon.isRatingFilterShow == true) {
                              filterCon.setRatingFilterShow(false);
                            } else {
                              filterCon.setRatingFilterShow(true);
                            }
                          },
                        ),
                        filterCon.isRatingFilterShow
                            ? Column(
                                children: [
                                  const SizedBox(
                                    height: 8,
                                  ),
                                  _buildRatingButtons(),
                                  const SizedBox(
                                    height: 8,
                                  ),
                                ],
                              )
                            : const SizedBox(),


                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 4),
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ChildButton(
                  widget: Text(AppLocalizations.of(context)!.clear,
                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        fontWeight: FontWeight.w400,
                        fontSize: 13,
                        color: Colors.white
                    ),
                  ),
                  onPressed:widget.cancel
              ),
              const SizedBox(width: 10,),
              ChildButton(
                  widget: Text(AppLocalizations.of(context)!.apply,
                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        fontWeight: FontWeight.w400,fontSize: 13,
                        color: Colors.white
                    ),
                  ),
                  onPressed:widget.onTap
              ),
            ],
          ),
           SizedBox(height: 15.h),
        ],
      ),
    );
  }

  Widget _buildBrandList(List<BrandModel> items, BuildContext context) {
    var filterCon = Provider.of<FilterController>(context, listen: true);
    return Column(
      children: items.map((item) {
        return Row(
          children: [
            Checkbox(
              value: filterCon.selectedBrands.contains(item.label),
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              checkColor: Colors.white,
              side: BorderSide(
                color: filterCon.selectedCategories.contains(item.label)
                    ? Colors.blue // Border color when checked
                    : Colors.grey, // Border color when unchecked
                width: 1.0,
              ),
              onChanged: (value) {
                filterCon.toggleBrand(item.label, item.value.toString());
              },
            ),
            Text(
              item.label,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(fontWeight: FontWeight.w400, fontSize: 12),
            ),
          ],
        );
      }).toList(),
    );
  }

  Widget _buildStoreList(List<StoreTypeModel> items, BuildContext context) {
    var filterCon = Provider.of<FilterController>(context);

    return Column(
      children: items.map((item) {
        bool isChecked = filterCon.selectedStoreTypes.contains(item.label);

        return Row(
          children: [
            Checkbox(
              value: isChecked,
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              checkColor: Colors.white,
              side: BorderSide(
                color: isChecked ? Colors.blue : Colors.grey,
                width: 1.0,
              ),
              onChanged: (value) {
                filterCon.toggleStoreType(item.label, item.id.toString());
              },
            ),
            Text(
              item.label,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(fontWeight: FontWeight.w400, fontSize: 12),
            ),
          ],
        );
      }).toList(),
    );
  }


  // Rating Buttons
  Widget _buildRatingButtons() {
    final filterCon = Provider.of<FilterController>(context, listen: false);
    return Wrap(
      spacing: 5.0,
      runSpacing: 6.0,
      //mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [1, 2, 3, 4, 5].map((rating) {
        return GestureDetector(
          onTap: () {
            filterCon.updateRating(rating);
          },
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 3),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: filterCon.selectedRating == rating
                  ? CustomColors.baseColor
                  : Colors.white,
              borderRadius: BorderRadius.circular(5),
              border: Border.all(color: Colors.grey, width: .5),
            ),
            child: Text(
              "⭐ $rating",
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: filterCon.selectedRating == rating
                      ? Colors.white
                      : Colors.black,
                  fontSize: 12,
                  fontWeight: FontWeight.w600),
            ),
          ),
        );
      }).toList(),
    );
  }
}
