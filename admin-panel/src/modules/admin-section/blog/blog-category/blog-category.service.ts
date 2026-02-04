import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { BlogCategory } from "./blog-category.type";

export const useBlogCategoryService = () => {
  return useBaseService<BlogCategory>(API_ENDPOINTS.BLOG_CATEGORY);
};
export const useBlogCategoryEditService = () => {
  return useBaseService<BlogCategory>(API_ENDPOINTS.BLOG_CATEGORY_EDIT);
};
export const useBlogCategoryAddService = () => {
  return useBaseService<BlogCategory>(API_ENDPOINTS.BLOG_CATEGORY_ADD);
};
export const useBlogCategoryUpdateService = () => {
  return useBaseService<BlogCategory>(API_ENDPOINTS.BLOG_CATEGORY_UPDATE);
};
export const useBlogCategoryStatusUpdateService = () => {
  return useBaseService<BlogCategory>(API_ENDPOINTS.BLOG_CATEGORY_STATUS_UPDATE);
};
export const useBlogCategoryDeleteService = () => {
  return useBaseService<BlogCategory>(API_ENDPOINTS.BLOG_CATEGORY_REMOVE);
};
export const useBlogCategoryFetchService = () => {
  return useBaseService<BlogCategory>(API_ENDPOINTS.BLOG_CATEGORY_FETCH);
};