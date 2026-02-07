class BlogListModel {
  final List<BlogItem> data;
  final BlogMeta? meta;

  BlogListModel({required this.data, this.meta});

  factory BlogListModel.fromJson(Map<String, dynamic> json) {
    return BlogListModel(
      data: (json['data'] as List?)
              ?.map((e) => BlogItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      meta: json['meta'] != null
          ? BlogMeta.fromJson(json['meta'] as Map<String, dynamic>)
          : null,
    );
  }
}

class BlogItem {
  final int? id;
  final String? category;
  final String? title;
  final String? slug;
  final String? description;
  final String? imageUrl;
  final int? views;
  final String? tagName;
  final String? metaTitle;
  final String? metaDescription;
  final String? metaKeywords;
  final String? metaImage;
  final String? createdAt;

  BlogItem({
    this.id,
    this.category,
    this.title,
    this.slug,
    this.description,
    this.imageUrl,
    this.views,
    this.tagName,
    this.metaTitle,
    this.metaDescription,
    this.metaKeywords,
    this.metaImage,
    this.createdAt,
  });

  factory BlogItem.fromJson(Map<String, dynamic> json) {
    return BlogItem(
      id: json['id'] as int?,
      category: json['category'] as String?,
      title: json['title'] as String?,
      slug: json['slug'] as String?,
      description: json['description'] as String?,
      imageUrl: json['image_url'] as String?,
      views: json['views'] as int?,
      tagName: json['tag_name'] as String?,
      metaTitle: json['meta_title'] as String?,
      metaDescription: json['meta_description'] as String?,
      metaKeywords: json['meta_keywords'] as String?,
      metaImage: json['meta_image'] as String?,
      createdAt: json['created_at'] as String?,
    );
  }
}

class BlogMeta {
  final int? currentPage;
  final int? lastPage;
  final int? perPage;
  final int? total;

  BlogMeta({this.currentPage, this.lastPage, this.perPage, this.total});

  factory BlogMeta.fromJson(Map<String, dynamic> json) {
    return BlogMeta(
      currentPage: json['current_page'] as int?,
      lastPage: json['last_page'] as int?,
      perPage: json['per_page'] as int?,
      total: json['total'] as int?,
    );
  }
}

class BlogDetailModel {
  final BlogItem? blogDetails;
  final List<BlogItem> popularPosts;
  final List<BlogItem> relatedPosts;
  final int? totalComments;

  BlogDetailModel({
    this.blogDetails,
    this.popularPosts = const [],
    this.relatedPosts = const [],
    this.totalComments,
  });

  factory BlogDetailModel.fromJson(Map<String, dynamic> json) {
    return BlogDetailModel(
      blogDetails: json['blog_details'] != null
          ? BlogItem.fromJson(json['blog_details'] as Map<String, dynamic>)
          : null,
      popularPosts: (json['popular_posts'] as List?)
              ?.map((e) => BlogItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      relatedPosts: (json['related_posts'] as List?)
              ?.map((e) => BlogItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      totalComments: json['total_comments'] as int?,
    );
  }
}
