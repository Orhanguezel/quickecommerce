import 'package:equatable/equatable.dart';

abstract class BlogEvent extends Equatable {
  const BlogEvent();
}

class FetchBlogList extends BlogEvent {
  final String language;
  final int page;
  const FetchBlogList({required this.language, this.page = 1});
  @override
  List<Object?> get props => [language, page];
}

class FetchBlogDetail extends BlogEvent {
  final String slug;
  final String language;
  const FetchBlogDetail({required this.slug, required this.language});
  @override
  List<Object?> get props => [slug, language];
}

class BlogConnectionErrorEvent extends BlogEvent {
  @override
  List<Object?> get props => [];
}
