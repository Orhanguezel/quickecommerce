"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
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
import { ENGIN_ESER_AUTHOR, getEnginEserAuthor } from "@/lib/authors";

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
  locale: string;
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

const articleBodyClassName = [
  "max-w-none text-[16px] leading-8 text-foreground/85 sm:text-[17px]",
  "[&_p]:my-5 [&_p]:leading-8",
  "[&_strong]:font-bold [&_strong]:text-foreground",
  "[&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4",
  "[&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:border-b [&_h2]:border-border [&_h2]:pb-3 [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:leading-tight [&_h2]:tracking-tight [&_h2]:text-foreground",
  "[&_h3]:mb-2 [&_h3]:mt-7 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:leading-snug [&_h3]:text-foreground",
  "[&_ul]:my-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:rounded-md [&_ul]:border [&_ul]:bg-muted/25 [&_ul]:p-5 [&_ul]:pl-8",
  "[&_ol]:my-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:rounded-md [&_ol]:border [&_ol]:bg-muted/25 [&_ol]:p-5 [&_ol]:pl-8",
  "[&_li]:leading-7",
  "[&_table]:my-7 [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-md [&_table]:border [&_table]:text-sm",
  "[&_th]:border [&_th]:bg-muted [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:font-bold [&_th]:text-foreground",
  "[&_td]:border [&_td]:px-4 [&_td]:py-3 [&_td]:align-top",
  "[&_blockquote]:rounded-md [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:bg-primary/5 [&_blockquote]:px-5 [&_blockquote]:py-3 [&_blockquote]:italic",
].join(" ");

function getCategoryColor(category: string): string {
  if (!categoryColors[category]) {
    categoryColors[category] = palette[colorIndex % palette.length];
    colorIndex++;
  }
  return categoryColors[category];
}

function getBlogImageAlt(post: BlogPost): string {
  const category = post.category ? `${post.category} kategorisinde` : "Sportoonline blogda";
  return `${category} ${post.title} rehber görseli`;
}

export function BlogDetailClient({
  blog,
  categories,
  popularPosts,
  relatedPosts,
  comments,
  totalComments,
  locale,
  translations: t,
}: BlogDetailClientProps) {
  const author = getEnginEserAuthor(locale);
  const tags =
    blog.tag_name
      ?.split(",")
      .map((tag) => tag.trim())
      .filter(Boolean) ?? [];
  const plainText = blog.description?.replace(/<[^>]+>/g, " ").trim() ?? "";
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 220));

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
    <div className="bg-muted/20">
      <div className="container py-5 sm:py-7">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground">
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

      <div className="grid gap-8 xl:grid-cols-[minmax(0,820px)_320px] xl:justify-center">
        {/* ── Main Content ── */}
        <article className="min-w-0">
          <div className="mb-5">
            {blog.category && (
              <span
                className={`mb-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ${getCategoryColor(blog.category)}`}
              >
                {blog.category}
              </span>
            )}

            <h1 className="max-w-3xl text-balance text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
              {blog.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {blog.created_at}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4" />
                {readingTime} dk okuma
              </span>
              {blog.views !== undefined && blog.views > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  {t.views}: {blog.views}
                </span>
              )}
            </div>
          </div>

          {/* Featured Image */}
          {blog.image_url && (
            <div className="relative mb-5 aspect-[16/9] overflow-hidden rounded-md border bg-muted">
              <Image
                src={blog.image_url}
                alt={getBlogImageAlt(blog)}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="mb-7 flex gap-3 rounded-md border bg-background p-4 text-sm text-muted-foreground shadow-sm">
            {author.image ? (
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                <Image
                  src={author.image}
                  alt={author.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0">
              <Link
                href={author.path}
                className="font-medium text-foreground underline-offset-2 hover:underline"
              >
                {t.home === "Ana Sayfa" ? "Yazar: " : "Author: "}
                {author.name}
              </Link>
              <p className="mt-1">{author.title}</p>
              <p className="mt-1">
                {t.home === "Ana Sayfa"
                  ? "Bu içerik bilgilendirme amaçlıdır. Egzersiz, beslenme veya takviye kararlarında kişisel sağlık durumunuz için uzman görüşü alın. Ürün karşılaştırmalarında Sportoonline üzerinde satılan ürünlere yer verilebilir."
                  : "This content is for informational purposes. For exercise, nutrition, or supplement decisions, consult a qualified professional for your personal health context. Product comparisons may include products sold on Sportoonline."}
              </p>
            </div>
          </div>

          {/* Body */}
          <div
            className={articleBodyClassName}
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
        <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          {/* Categories */}
          {categories.length > 0 && (
            <div className="rounded-md border bg-background p-5 shadow-sm">
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
            <div className="rounded-md border bg-background p-5 shadow-sm">
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
                          alt={getBlogImageAlt(post)}
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
            alt={getBlogImageAlt(post)}
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
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span>{post.created_at}</span>
          <span aria-hidden="true">/</span>
          <span>{ENGIN_ESER_AUTHOR.name}</span>
        </div>
      </div>
    </Link>
  );
}
