"use client";

import { Link } from "@/i18n/routing";
import Image from "next/image";
import { ChevronRight, Calendar, FileText } from "lucide-react";
import type { BlogPost } from "@/modules/blog/blog.type";

interface BlogListTranslations {
  blog: string;
  blog_subtitle: string;
  read_more: string;
  no_posts: string;
  previous: string;
  next: string;
  home: string;
}

interface BlogListClientProps {
  posts: BlogPost[];
  totalPages: number;
  totalPosts: number;
  currentPage: number;
  currentCategoryId?: string;
  translations: BlogListTranslations;
}

export function BlogListClient({
  posts,
  totalPages,
  totalPosts,
  currentPage,
  currentCategoryId,
  translations: t,
}: BlogListClientProps) {
  function buildPageUrl(page: number) {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (currentCategoryId) params.set("category_id", currentCategoryId);
    const query = params.toString();
    return `/blog${query ? `?${query}` : ""}`;
  }

  return (
    <div className="container py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {t.home}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{t.blog}</span>
      </nav>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{t.blog}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.blog_subtitle}</p>
      </div>

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} readMore={t.read_more} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">{t.no_posts}</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <Link
              href={buildPageUrl(currentPage - 1)}
              className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              {t.previous}
            </Link>
          )}

          {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
            let page: number;
            if (totalPages <= 7) {
              page = i + 1;
            } else if (currentPage <= 4) {
              page = i + 1;
            } else if (currentPage >= totalPages - 3) {
              page = totalPages - 6 + i;
            } else {
              page = currentPage - 3 + i;
            }

            return (
              <Link
                key={page}
                href={buildPageUrl(page)}
                className={`rounded-md border px-3 py-2 text-sm ${
                  page === currentPage
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {page}
              </Link>
            );
          })}

          {currentPage < totalPages && (
            <Link
              href={buildPageUrl(currentPage + 1)}
              className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              {t.next}
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}

function BlogCard({ post, readMore }: { post: BlogPost; readMore: string }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] bg-muted">
        {post.image_url ? (
          <Image
            src={post.image_url}
            alt={post.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FileText className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}
        {post.category && (
          <span className="absolute left-3 top-3 rounded bg-primary/90 px-2 py-0.5 text-xs font-medium text-primary-foreground">
            {post.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{post.created_at}</span>
        </div>

        <h2 className="mb-2 line-clamp-2 font-semibold leading-tight group-hover:text-primary">
          {post.title}
        </h2>

        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
          {stripHtml(post.description)}
        </p>

        <span className="text-sm font-medium text-primary">
          {readMore} →
        </span>
      </div>
    </Link>
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").slice(0, 200);
}
