"use client";

import { Link } from "@/i18n/routing";
import Image from "next/image";
import { ChevronRight, Calendar, MessageCircle, Tag, User } from "lucide-react";
import type { BlogPost, BlogCategory, BlogComment } from "@/modules/blog/blog.type";

interface BlogDetailTranslations {
  blog: string;
  categories: string;
  popular_posts: string;
  related_posts: string;
  comments: string;
  tags: string;
  share: string;
  read_more: string;
  home: string;
}

interface BlogDetailClientProps {
  blog: BlogPost;
  categories: BlogCategory[];
  popularPosts: BlogPost[];
  relatedPosts: BlogPost[];
  comments: BlogComment[];
  totalComments: number;
  translations: BlogDetailTranslations;
}

export function BlogDetailClient({
  blog,
  categories,
  popularPosts,
  relatedPosts,
  comments,
  totalComments,
  translations: t,
}: BlogDetailClientProps) {
  const tags = blog.tag_name?.split(",").map((tag) => tag.trim()).filter(Boolean) ?? [];

  return (
    <div className="container py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {t.home}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/blog" className="hover:text-foreground">
          {t.blog}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="line-clamp-1 text-foreground">{blog.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* Main Content */}
        <article>
          {/* Header */}
          <header className="mb-6">
            <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {blog.category && (
                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {blog.category}
                </span>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{blog.created_at}</span>
              </div>
              {blog.views !== undefined && blog.views > 0 && (
                <span>{blog.views} views</span>
              )}
            </div>
            <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
              {blog.title}
            </h1>
          </header>

          {/* Featured Image */}
          {blog.image_url && (
            <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-lg">
              <Image
                src={blog.image_url}
                alt={blog.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Body */}
          <div
            className="prose prose-sm max-w-none dark:prose-invert sm:prose-base"
            dangerouslySetInnerHTML={{ __html: blog.description }}
          />

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-2 border-t pt-4">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-3 py-1 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Comments */}
          {comments.length > 0 && (
            <section className="mt-8 border-t pt-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <MessageCircle className="h-5 w-5" />
                {t.comments} ({totalComments})
              </h2>
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center gap-2">
                      {comment.user_image_url ? (
                        <Image
                          src={comment.user_image_url}
                          alt={comment.user_name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-medium">
                          {comment.user_name}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {comment.created_at}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {comment.comment}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-8 border-t pt-6">
              <h2 className="mb-4 text-lg font-semibold">{t.related_posts}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {relatedPosts.slice(0, 4).map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    {post.image_url && (
                      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded">
                        <Image
                          src={post.image_url}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-sm font-medium group-hover:text-primary">
                        {post.title}
                      </h3>
                      <span className="mt-1 text-xs text-muted-foreground">
                        {post.created_at}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Categories */}
          {categories.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 font-semibold">{t.categories}</h3>
              <ul className="space-y-1.5">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/blog?category_id=${cat.id}`}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Popular Posts */}
          {popularPosts.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 font-semibold">{t.popular_posts}</h3>
              <div className="space-y-3">
                {popularPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex gap-3"
                  >
                    {post.image_url && (
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded">
                        <Image
                          src={post.image_url}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="line-clamp-2 text-sm font-medium group-hover:text-primary">
                        {post.title}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {post.created_at}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
