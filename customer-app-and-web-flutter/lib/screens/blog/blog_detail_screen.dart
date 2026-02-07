import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_html/flutter_html.dart';
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

class BlogDetailScreen extends StatefulWidget {
  final String slug;
  const BlogDetailScreen({super.key, required this.slug});

  @override
  State<BlogDetailScreen> createState() => _BlogDetailScreenState();
}

class _BlogDetailScreenState extends State<BlogDetailScreen> {
  late final BlogBloc _blogBloc;

  @override
  void initState() {
    super.initState();
    _blogBloc = context.read<BlogBloc>();
    _loadDetail();
  }

  Future<void> _loadDetail() async {
    final language = await UserSharedPreference.getValue(
          SharedPreferenceHelper.languageCode,
        ) ??
        'tr';
    _blogBloc.add(FetchBlogDetail(slug: widget.slug, language: language));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocBuilder<BlogBloc, BlogState>(
        builder: (context, state) {
          if (state is BlogLoading) {
            return const CommonLoading();
          } else if (state is BlogDetailLoaded) {
            final blog = state.blogDetailModel.blogDetails;
            if (blog == null) {
              return const Center(child: NoDataWidget());
            }
            return _buildDetail(context, blog, state.blogDetailModel);
          } else if (state is BlogFailure) {
            return const Center(child: NoDataWidget());
          }
          return const SizedBox();
        },
      ),
    );
  }

  Widget _buildDetail(
      BuildContext context, BlogItem blog, BlogDetailModel model) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Back button
          TextButton.icon(
            onPressed: () {
              final homeCon =
                  Provider.of<HomeScreenProvider>(context, listen: false);
              homeCon.setTabType("Blog");
              homeCon.setMenuName('');
            },
            icon: const Icon(Icons.arrow_back, size: 18),
            label: const Text("Blog"),
          ),
          const SizedBox(height: 8),
          // Image
          if (blog.imageUrl != null && blog.imageUrl!.isNotEmpty)
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(
                blog.imageUrl!,
                width: double.infinity,
                height: kIsWeb ? 350 : 200,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Image.asset(
                  Images.noImage,
                  width: double.infinity,
                  height: kIsWeb ? 350 : 200,
                  fit: BoxFit.cover,
                ),
              ),
            ),
          const SizedBox(height: 16),
          // Category & Date
          Row(
            children: [
              if (blog.category != null)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color:
                        Theme.of(context).colorScheme.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    blog.category!,
                    style: TextStyle(
                      fontSize: 12,
                      color: Theme.of(context).colorScheme.primary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              const Spacer(),
              if (blog.createdAt != null)
                Text(
                  blog.createdAt!,
                  style: Theme.of(context)
                      .textTheme
                      .bodySmall
                      ?.copyWith(color: Colors.grey),
                ),
            ],
          ),
          const SizedBox(height: 12),
          // Title
          Text(
            blog.title ?? '',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 8),
          // Views
          if (blog.views != null)
            Row(
              children: [
                const Icon(Icons.visibility, size: 16, color: Colors.grey),
                const SizedBox(width: 4),
                Text(
                  '${blog.views}',
                  style: Theme.of(context)
                      .textTheme
                      .bodySmall
                      ?.copyWith(color: Colors.grey),
                ),
              ],
            ),
          const SizedBox(height: 16),
          // Description (HTML)
          Html(
            data: blog.description ?? '',
            style: {
              "body": Style(
                fontSize: FontSize(kIsWeb ? 14 : 14),
                fontWeight: FontWeight.w400,
                lineHeight: const LineHeight(1.6),
                textAlign: TextAlign.justify,
              ),
              "p": Style(margin: Margins.zero),
              "img": Style(width: Width(double.infinity)),
            },
          ),
          // Related posts
          if (model.relatedPosts.isNotEmpty) ...[
            const SizedBox(height: 32),
            const Divider(),
            const SizedBox(height: 16),
            Text(
              "İlgili Yazılar",
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 200,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: model.relatedPosts.length,
                itemBuilder: (context, index) {
                  final related = model.relatedPosts[index];
                  return _RelatedBlogCard(
                    blog: related,
                    onTap: () {
                      final homeCon = Provider.of<HomeScreenProvider>(context,
                          listen: false);
                      homeCon.setMenuName(related.slug ?? '');
                      _blogBloc.add(FetchBlogDetail(
                        slug: related.slug ?? '',
                        language: 'tr',
                      ));
                    },
                  );
                },
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _RelatedBlogCard extends StatelessWidget {
  final BlogItem blog;
  final VoidCallback onTap;

  const _RelatedBlogCard({required this.blog, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(right: 12),
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: InkWell(
        onTap: onTap,
        child: SizedBox(
          width: 180,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Image.network(
                blog.imageUrl ?? '',
                width: 180,
                height: 110,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Image.asset(
                  Images.noImage,
                  width: 180,
                  height: 110,
                  fit: BoxFit.cover,
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(8),
                child: Text(
                  blog.title ?? '',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
