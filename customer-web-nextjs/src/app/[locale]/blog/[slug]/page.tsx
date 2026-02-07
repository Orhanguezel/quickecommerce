import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { BlogDetailResponse } from "@/modules/blog/blog.type";
import { BlogDetailClient } from "./blog-detail-client";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

async function getBlogDetail(slug: string, locale: string) {
  try {
    const res = await fetchAPI<BlogDetailResponse>(
      `${API_ENDPOINTS.BLOG_DETAIL}/${slug}`,
      {},
      locale
    );
    return res;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const data = await getBlogDetail(slug, locale);

  if (!data?.blog_details) {
    return { title: "Blog Not Found" };
  }

  const blog = data.blog_details;
  const title = blog.meta_title || blog.title;
  const description =
    blog.meta_description || stripHtml(blog.description).slice(0, 160);

  return {
    title,
    description,
    keywords: blog.meta_keywords ?? undefined,
    openGraph: {
      title,
      description,
      type: "article",
      locale: locale === "tr" ? "tr_TR" : "en_US",
      siteName: "Sporto Online",
      publishedTime: blog.created_at,
      ...(blog.image_url ? { images: [{ url: blog.image_url }] } : {}),
    },
    alternates: {
      canonical: `/${locale}/blog/${slug}`,
      languages: {
        tr: `/tr/blog/${slug}`,
        en: `/en/blog/${slug}`,
      },
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const data = await getBlogDetail(slug, locale);

  if (!data?.blog_details) {
    notFound();
  }

  const blog = data.blog_details;
  const t = await getTranslations({ locale, namespace: "common" });
  const blogT = await getTranslations({ locale, namespace: "blog" });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t("home"),
        item: `https://sportoonline.com/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: blogT("blog"),
        item: `https://sportoonline.com/${locale}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: blog.title,
      },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    ...(blog.image_url ? { image: blog.image_url } : {}),
    datePublished: blog.created_at,
    ...(blog.meta_description
      ? { description: blog.meta_description }
      : {}),
    publisher: {
      "@type": "Organization",
      name: "Sporto Online",
      url: "https://sportoonline.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://sportoonline.com/${locale}/blog/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <BlogDetailClient
        blog={blog}
        categories={data.all_blog_categories}
        popularPosts={data.popular_posts}
        relatedPosts={data.related_posts}
        comments={data.blog_comments}
        totalComments={data.total_comments}
        translations={{
          blog: blogT("blog"),
          categories: blogT("categories"),
          popular_posts: blogT("popular_posts"),
          related_posts: blogT("related_posts"),
          comments: blogT("comments"),
          tags: blogT("tags"),
          share: blogT("share"),
          read_more: blogT("read_more"),
          home: t("home"),
        }}
      />
    </>
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}
