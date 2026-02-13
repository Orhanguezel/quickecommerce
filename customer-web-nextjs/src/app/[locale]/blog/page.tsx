import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { BlogPost } from "@/modules/blog/blog.type";
import { BlogListClient } from "./blog-list-client";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    category_id?: string;
    search?: string;
    sort?: string;
  }>;
}

async function getBlogs(
  locale: string,
  page: number,
  categoryId?: string,
  search?: string,
  sort?: string
) {
  try {
    const res = await fetchAPI<any>(
      API_ENDPOINTS.BLOGS,
      {
        per_page: 12,
        page,
        sort: sort || "desc",
        ...(categoryId ? { category_id: categoryId } : {}),
        ...(search ? { search } : {}),
      },
      locale
    );
    return {
      posts: (res?.data ?? []) as BlogPost[],
      totalPages: res?.meta?.last_page ?? res?.last_page ?? 1,
      totalPosts: res?.meta?.total ?? res?.total ?? 0,
    };
  } catch {
    return { posts: [] as BlogPost[], totalPages: 0, totalPosts: 0 };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  const title = t("blog_title");
  const description = t("blog_description");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "tr" ? "tr_TR" : "en_US",
      siteName: "Sporto Online",
    },
    alternates: {
      canonical: `/${locale}/blog`,
      languages: {
        tr: `/tr/blog`,
        en: `/en/blog`,
      },
    },
  };
}

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const page = Number(sp.page) || 1;

  const data = await getBlogs(locale, page, sp.category_id, sp.search, sp.sort);
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
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <BlogListClient
        posts={data.posts}
        totalPages={data.totalPages}
        currentPage={page}
        currentCategoryId={sp.category_id}
        currentSearch={sp.search}
        currentSort={sp.sort}
        translations={{
          blog: blogT("blog"),
          blog_subtitle: blogT("blog_subtitle"),
          read_more: blogT("read_more"),
          no_posts: blogT("no_posts"),
          search_placeholder: blogT("search_placeholder"),
          sort_newest: blogT("sort_newest"),
          sort_oldest: blogT("sort_oldest"),
          sort_popular: blogT("sort_popular"),
          previous: t("previous"),
          next: t("next"),
          home: t("home"),
        }}
      />
    </>
  );
}
