import 'package:equatable/equatable.dart';
import '../../../data/data_model/blog_model.dart';

abstract class BlogState extends Equatable {
  const BlogState();
}

class BlogInitial extends BlogState {
  @override
  List<Object> get props => [];
}

class BlogLoading extends BlogState {
  @override
  List<Object> get props => [];
}

class BlogListLoaded extends BlogState {
  final BlogListModel blogListModel;
  final bool hasConnectionError;
  const BlogListLoaded({required this.blogListModel, this.hasConnectionError = false});
  @override
  List<Object?> get props => [blogListModel];
}

class BlogDetailLoaded extends BlogState {
  final BlogDetailModel blogDetailModel;
  const BlogDetailLoaded({required this.blogDetailModel});
  @override
  List<Object?> get props => [blogDetailModel];
}

class BlogConnectionError extends BlogState {
  @override
  List<Object?> get props => [];
}

class BlogFailure extends BlogState {
  @override
  List<Object?> get props => [];
}
