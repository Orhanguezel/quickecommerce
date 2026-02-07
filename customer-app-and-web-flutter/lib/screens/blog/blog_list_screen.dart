import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:provider/provider.dart';
import '../../config/images.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/blog_bloc/blog_bloc.dart';
import '../../controller/bloc/blog_bloc/blog_event.dart';
import '../../controller/bloc/blog_bloc/blog_state.dart';
import '../../controller/provider/home_screen_provider.dart';
import '../../data/data_model/blog_model.dart';
import '../common_widgets/common_loading.dart';
import '../common_widgets/no_data_widget.dart';

class BlogListScreen extends StatefulWidget {
  const BlogListScreen({super.key});

  @override
  State<BlogListScreen> createState() => _BlogListScreenState();
}

class _BlogListScreenState extends State<BlogListScreen> {
  late final BlogBloc _blogBloc;
  String _language = '';

  @override
  void initState() {
    super.initState();
    _blogBloc = context.read<BlogBloc>();
    _loadBlogs();
  }

  Future<void> _loadBlogs() async {
    final language = await UserSharedPreference.getValue(
          SharedPreferenceHelper.languageCode,
        ) ??
        'tr';
    _language = language;
    _blogBloc.add(FetchBlogList(language: _language));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocBuilder<BlogBloc, BlogState>(
        builder: (context, state) {
          if (state is BlogLoading) {
            return const CommonLoading();
          } else if (state is BlogListLoaded) {
            final blogs = state.blogListModel.data;
            if (blogs.isEmpty) {
              return const Center(child: NoDataWidget());
            }
            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: blogs.length,
              itemBuilder: (context, index) {
                return _BlogCard(
                  blog: blogs[index],
                  onTap: () {
                    final homeCon =
                        Provider.of<HomeScreenProvider>(context, listen: false);
                    homeCon.setTabType("BlogDetail");
                    homeCon.setMenuName(blogs[index].slug ?? '');
                  },
                );
              },
            );
          } else if (state is BlogFailure) {
            return const Center(child: NoDataWidget());
          }
          return const SizedBox();
        },
      ),
    );
  }
}

class _BlogCard extends StatelessWidget {
  final BlogItem blog;
  final VoidCallback onTap;

  const _BlogCard({required this.blog, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      clipBehavior: Clip.antiAlias,
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onTap,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              width: kIsWeb ? 200 : 120,
              height: kIsWeb ? 150 : 120,
              child: Image.network(
                blog.imageUrl ?? '',
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Image.asset(
                  Images.noImage,
                  fit: BoxFit.cover,
                ),
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (blog.category != null)
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: Theme.of(context)
                              .colorScheme
                              .primary
                              .withOpacity(0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          blog.category!,
                          style: TextStyle(
                            fontSize: 11,
                            color: Theme.of(context).colorScheme.primary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    const SizedBox(height: 8),
                    Text(
                      blog.title ?? '',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                    const SizedBox(height: 6),
                    if (blog.createdAt != null)
                      Text(
                        blog.createdAt!,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Colors.grey,
                            ),
                      ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
