export interface BlogPost {
  id: number;
  category: string | null;
  title: string;
  slug: string;
  description: string;
  image_url: string | null;
  views?: number;
  tag_name: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  meta_image: string | null;
  created_at: string;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
}

export interface BlogComment {
  id: number;
  user_name: string;
  user_image_url: string | null;
  comment: string;
  like_count: number;
  dislike_count: number;
  liked: boolean;
  disliked: boolean;
  created_at: string;
}

export interface BlogDetailResponse {
  blog_details: BlogPost;
  all_blog_categories: BlogCategory[];
  popular_posts: BlogPost[];
  related_posts: BlogPost[];
  blog_comments: BlogComment[];
  total_comments: number;
}
