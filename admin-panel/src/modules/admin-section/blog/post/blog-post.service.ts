import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { BlogPost } from "./blog-post.type";

export const useBlogPostService = () => {
  return useBaseService<BlogPost>(API_ENDPOINTS.BLOG_POST);
};
export const useBlogPostEditService = () => {
  return useBaseService<BlogPost>(API_ENDPOINTS.BLOG_POST_EDIT);
};
export const useBlogPostAddService = () => {
  return useBaseService<BlogPost>(API_ENDPOINTS.BLOG_POST_ADD);
};
export const useBlogPostUpdateService = () => {
  return useBaseService<BlogPost>(API_ENDPOINTS.BLOG_POST_UPDATE);
};

export const useBlogPostStatusUpdateService = () => {
  return useBaseService<BlogPost>(API_ENDPOINTS.BLOG_POST_STATUS_UPDATE);
};
export const useBlogPostDeleteService = () => {
  return useBaseService<BlogPost>(API_ENDPOINTS.BLOG_POST_DELETE);
};
