"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import {
  ChevronRight,
  Eye,
  FileText,
  User,
} from "lucide-react";
import type {
  BlogPost,
  BlogCategory,
  BlogComment,
} from "@/modules/blog/blog.type";
import { useAuthStore } from "@/stores/auth-store";
import { useBaseService } from "@/lib/base-service";

interface BlogDetailTranslations {
  blog: string;
  details: string;
  categories: string;
  popular_posts: string;
  related_posts: string;
  comments: string;
  tags: string;
  share: string;
  read_more: string;
  views: string;
  total: string;
  leave_comment: string;
  comment_placeholder: string;
  submit: string;
  login_to_comment: string;
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

export function BlogDetailClient({
  blog,
  categories,
  popularPosts,
  relatedPosts,
  comments,
  totalComments,
  translations: t,
}: BlogDetailClientProps) {
  const tags =
    blog.tag_name
      ?.split(",")
      .map((tag) => tag.trim())
      .filter(Boolean) ?? [];

  const { isAuthenticated } = useAuthStore();
  const { create } = useBaseService("/customer/blog/comment");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState(comments);
  const [localTotal, setLocalTotal] = useState(totalComments);

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;

    setSubmitting(true);
    try {
      await create({ blog_id: blog.id, comment: commentText.trim() });
      setLocalComments((prev) => [
        ...prev,
        {
          id: Date.now(),
          user_name: "You",
          user_image_url: null,
          comment: commentText.trim(),
          like_count: 0,
          dislike_count: 0,
          liked: false,
          disliked: false,
          created_at: new Date().toLocaleDateString(),
        },
      ]);
      setLocalTotal((prev) => prev + 1);
      setCommentText("");
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container py-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {t.home}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/blog" className="hover:text-foreground">
          {t.blog}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-primary">{t.details}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* ── Main Content ── */}
        <article>
          {/* Featured Image */}
          {blog.image_url && (
            <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-lg">
              <Image
                src={blog.image_url}
                alt={blog.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Date + Views */}
          <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>{blog.created_at}</span>
            {blog.views !== undefined && blog.views > 0 && (
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                {t.views}: {blog.views}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="mb-6 text-2xl font-bold leading-tight sm:text-3xl">
            {blog.title}
          </h1>

          {/* Body */}
          <div
            className="prose prose-sm max-w-none dark:prose-invert sm:prose-base"
            dangerouslySetInnerHTML={{ __html: blog.description }}
          />

          {/* Tags */}
          <div className="mt-8 border-t pt-4">
            <span className="font-semibold">{t.tags}:</span>
            {tags.length > 0 && (
              <span className="ml-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="mr-1.5 inline-block rounded-full bg-muted px-3 py-1 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </span>
            )}
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 text-lg font-bold">{t.related_posts}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.slice(0, 3).map((post) => (
                  <RelatedPostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}

          {/* ── Comments Section ── */}
          <section className="mt-10 border-t pt-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold">{t.comments}</h2>
              <span className="text-sm text-muted-foreground">
                {t.total}: {localTotal}
              </span>
            </div>

            {/* Existing Comments */}
            {localComments.length > 0 && (
              <div className="mb-8 space-y-4">
                {localComments.map((comment) => (
                  <div key={comment.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center gap-2.5">
                      {comment.user_image_url ? (
                        <Image
                          src={comment.user_image_url}
                          alt={comment.user_name}
                          width={36}
                          height={36}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
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
            )}

            {/* Leave A Comment */}
            <h3 className="mb-3 text-base font-bold">{t.leave_comment}</h3>
            {isAuthenticated ? (
              <form onSubmit={handleSubmitComment}>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={t.comment_placeholder}
                  rows={5}
                  maxLength={1000}
                  className="w-full resize-y rounded-md border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={submitting || !commentText.trim()}
                  className="mt-3 rounded-md bg-foreground px-6 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {t.submit}
                </button>
              </form>
            ) : (
              <div className="rounded-md border p-4 text-center">
                <p className="mb-3 text-sm text-muted-foreground">
                  {t.login_to_comment}
                </p>
                <Link
                  href="/giris"
                  className="inline-block rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {t.home === "Ana Sayfa" ? "Giriş Yap" : "Login"}
                </Link>
              </div>
            )}
          </section>
        </article>

        {/* ── Sidebar ── */}
        <aside className="space-y-6">
          {/* Categories */}
          {categories.length > 0 && (
            <div className="rounded-lg border p-5">
              <h3 className="mb-4 border-b pb-3 text-base font-bold">
                {t.categories}
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/blog?category_id=${cat.id}`}
                    className="rounded-full border px-3 py-1 text-sm transition-colors hover:border-primary hover:text-primary"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Popular Posts */}
          {popularPosts.length > 0 && (
            <div className="rounded-lg border p-5">
              <h3 className="mb-4 border-b pb-3 text-base font-bold">
                {t.popular_posts}
              </h3>
              <div className="divide-y">
                {popularPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    {post.image_url ? (
                      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded">
                        <Image
                          src={post.image_url}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded bg-muted">
                        <FileText className="h-5 w-5 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">
                        {post.title}
                      </h4>
                      <span className="mt-1 block text-xs text-muted-foreground">
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

/* ── Related Post Card ── */
function RelatedPostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
    >
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
      <div className="p-4">
        {post.category && (
          <span
            className={`mb-2.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getCategoryColor(post.category)}`}
          >
            {post.category}
          </span>
        )}
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">
          {post.title}
        </h3>
        <p className="text-xs text-muted-foreground">{post.created_at}</p>
      </div>
    </Link>
  );
}
