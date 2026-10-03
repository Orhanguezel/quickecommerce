export interface BlogAuthor {
  name: string;
  slug: string;
  title: string | null;
  bio: string | null;
  image_url: string | null;
  email?: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  website_url: string | null;
}

export interface BlogPost {
  author: BlogAuthor | null;
  id: number;
  category: string | null;
  title: string;
  slug: string;
  description: string;
  image_url: string | null;
  is_featured?: number | boolean;
  featured?: number | boolean;
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
