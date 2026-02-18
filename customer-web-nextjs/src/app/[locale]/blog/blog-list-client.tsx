"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import Image from "next/image";
import { ChevronRight, FileText, Search, SlidersHorizontal } from "lucide-react";
import type { BlogPost } from "@/modules/blog/blog.type";
import { useThemeConfig } from "@/modules/theme/use-theme-config";

interface BlogListTranslations {
  blog: string;
  blog_subtitle: string;
  read_more: string;
  no_posts: string;
  search_placeholder: string;
  sort_newest: string;
  sort_oldest: string;
  sort_popular: string;
  previous: string;
  next: string;
  home: string;
}

interface BlogListClientProps {
  posts: BlogPost[];
  totalPages: number;
  currentPage: number;
  currentCategoryId?: string;
  currentSearch?: string;
  currentSort?: string;
  translations: BlogListTranslations;
}

export function BlogListClient({
  posts,
  totalPages,
  currentPage,
  currentCategoryId,
  currentSearch,
  currentSort,
  translations: t,
}: BlogListClientProps) {
  const router = useRouter();
  const { blogConfig } = useThemeConfig();
  const [searchValue, setSearchValue] = useState(currentSearch || "");
  const spanClassMap: Record<4 | 6 | 12, string> = {
    4: "md:col-span-4",
    6: "md:col-span-6",
    12: "md:col-span-12",
  };
  const postSpan = blogConfig.postsGridSpan || 4;

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const page = overrides.page ?? (currentPage > 1 ? String(currentPage) : undefined);
    const category = overrides.category_id ?? currentCategoryId;
    const search = overrides.search !== undefined ? overrides.search : currentSearch;
    const sort = overrides.sort !== undefined ? overrides.sort : currentSort;

    if (page && page !== "1") params.set("page", page);
    if (category) params.set("category_id", category);
    if (search) params.set("search", search);
    if (sort && sort !== "desc") params.set("sort", sort);

    const query = params.toString();
    return `/blog${query ? `?${query}` : ""}`;
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildUrl({ search: searchValue || undefined, page: "1" }));
  }

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    router.push(buildUrl({ sort: e.target.value, page: "1" }));
  }

  return (
    <div className="container py-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {t.home}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{t.blog}</span>
      </nav>

      {/* Header Bar — icon + title | search + sort */}
      {blogConfig.isListToolbarEnabled ? (
        <div className="mb-6 flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-xl font-bold tracking-tight">{t.blog}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={t.search_placeholder}
                className="h-9 w-48 rounded-md border bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
            </form>

            {/* Sort */}
            <select
              value={currentSort || "desc"}
              onChange={handleSortChange}
              className="h-9 rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
            >
              <option value="desc">{t.sort_newest}</option>
              <option value="asc">{t.sort_oldest}</option>
              <option value="popular">{t.sort_popular}</option>
            </select>
          </div>
        </div>
      ) : null}

      {/* Posts Grid */}
      {!blogConfig.isPostsGridEnabled ? null : posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {posts.map((post) => (
            <div key={post.id} className={spanClassMap[postSpan]}>
              <BlogCard post={post} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">{t.no_posts}</p>
        </div>
      )}

      {/* Pagination */}
      {blogConfig.isPostsGridEnabled && totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <Link
              href={buildUrl({ page: String(currentPage - 1) })}
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
                href={buildUrl({ page: String(page) })}
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
              href={buildUrl({ page: String(currentPage + 1) })}
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

/* ── Category color mapping ── */
const categoryColors: Record<string, string> = {};
const palette = [
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-teal-100 text-teal-700",
  "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700",
];
let colorIndex = 0;

function getCategoryColor(category: string): string {
  if (!categoryColors[category]) {
    categoryColors[category] = palette[colorIndex % palette.length];
    colorIndex++;
  }
  return categoryColors[category];
}

/* ── Blog Card ── */
function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {post.image_url ? (
          <Image
            src={post.image_url}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FileText className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category badge */}
        {post.category && (
          <span
            className={`mb-2.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getCategoryColor(post.category)}`}
          >
            {post.category}
          </span>
        )}

        {/* Title */}
        <h2 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">
          {post.title}
        </h2>

        {/* Date */}
        <p className="text-xs text-muted-foreground">{post.created_at}</p>
      </div>
    </Link>
  );
}
