import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/data_model/blog_model.dart';
import '../../../data/sirvice/common_repository.dart';
import '../../../data/sirvice/connectivity_rypository.dart';
import 'blog_event.dart';
import 'blog_state.dart';

class BlogBloc extends Bloc<BlogEvent, BlogState> {
  final ConnectivityRepository connectivityRepository;
  final CommonRepository commonRepository;

  BlogBloc({required this.connectivityRepository, required this.commonRepository})
      : super(BlogInitial()) {
    connectivityRepository.isConnectedStream.listen((isConnected) {
      if (!isConnected) {
        add(BlogConnectionErrorEvent());
      }
    });

    on<FetchBlogList>((event, emit) async {
      emit(BlogLoading());
      try {
        final response = await commonRepository.blogList(
          event.language,
          page: event.page,
        );
        if (response.statusCode == 200) {
          final model = BlogListModel.fromJson(response.data);
          emit(BlogListLoaded(blogListModel: model));
        } else {
          emit(BlogFailure());
        }
      } on DioException catch (_) {
        emit(BlogFailure());
      }
    });

    on<FetchBlogDetail>((event, emit) async {
      emit(BlogLoading());
      try {
        final response = await commonRepository.blogDetail(
          event.slug,
          event.language,
        );
        if (response.statusCode == 200) {
          final model = BlogDetailModel.fromJson(response.data);
          emit(BlogDetailLoaded(blogDetailModel: model));
        } else {
          emit(BlogFailure());
        }
      } on DioException catch (_) {
        emit(BlogFailure());
      }
    });

    on<BlogConnectionErrorEvent>((event, emit) {
      if (state is BlogListLoaded) {
        final currentState = state as BlogListLoaded;
        emit(BlogListLoaded(
          blogListModel: currentState.blogListModel,
          hasConnectionError: true,
        ));
      } else {
        emit(BlogConnectionError());
      }
    });
  }
}
