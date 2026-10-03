import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { fetchAPI } from "@/lib/api-server";
import type { BlogAuthor, BlogPost } from "@/modules/blog/blog.type";
import { DEFAULT_ORGANIZATION, SITE_URL, buildMetaDescription, localizedAlternates, pageOgImages, stripHtml } from "@/lib/seo";
import { User } from "lucide-react";

type Props = { params: Promise<{ locale: string; slug: string }>; searchParams: Promise<{ page?: string }> };
type AuthorResponse = { author: BlogAuthor; posts: BlogPost[]; meta?: { last_page?: number } };

async function getAuthor(slug: string, locale: string, page = 1): Promise<AuthorResponse | null> {
  try {
    return await fetchAPI<AuthorResponse>(`/author/${slug}`, { page }, locale);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const data = await getAuthor(slug, locale);
  if (!data) return { title: "Yazar bulunamadı" };
  const author = data.author;
  const path = `/yazar/${author.slug}`;
  return {
    title: author.name,
    description: buildMetaDescription([stripHtml(author.bio ?? "")]),
    alternates: { canonical: `/${locale}${path}`, languages: localizedAlternates(path) },
    openGraph: {
      title: author.name, description: stripHtml(author.bio ?? ""), type: "profile",
      url: `${SITE_URL}/${locale}${path}`, siteName: DEFAULT_ORGANIZATION.name,
      images: author.image_url ? [{ url: author.image_url }] : pageOgImages(author.name, "Yazar profili"),
    },
  };
}

export default async function AuthorPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const { page: requestedPage } = await searchParams;
  const page = Math.max(1, Number(requestedPage) || 1);
  const data = await getAuthor(slug, locale, page);
  if (!data) notFound();
  const { author, posts } = data;
  const links = [
    ["LinkedIn", author.linkedin_url], ["X / Twitter", author.twitter_url],
    ["Facebook", author.facebook_url], ["Instagram", author.instagram_url],
    ["Web sitesi", author.website_url],
  ] as const;
  const sameAs = links.map(([, url]) => url).filter((url): url is string => Boolean(url));
  const personJsonLd = {
    "@context": "https://schema.org", "@type": "Person", name: author.name,
    url: `${SITE_URL}/${locale}/yazar/${author.slug}`,
    ...(author.image_url ? { image: author.image_url } : {}),
    ...(author.title ? { jobTitle: author.title } : {}),
    ...(author.bio ? { description: stripHtml(author.bio) } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    worksFor: { "@type": "Organization", name: DEFAULT_ORGANIZATION.name, url: SITE_URL },
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }} />
    <main className="container max-w-3xl py-10">
      <Link href="/blog" className="text-sm font-medium text-primary hover:underline">{locale === "tr" ? "Bloga dön" : "Back to blog"}</Link>
      <section className="mt-6 rounded-lg border bg-card p-6">
        <div className="flex items-center gap-5">
          {author.image_url ? <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-muted"><Image src={author.image_url} alt={author.name} fill className="object-cover" sizes="96px" /></div> : <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-muted"><User className="h-10 w-10 text-muted-foreground" /></div>}
          <div><p className="text-sm font-medium text-primary">{locale === "tr" ? "Yazar profili" : "Author profile"}</p><h1 className="mt-1 text-3xl font-bold">{author.name}</h1>{author.title && <p className="mt-2 text-muted-foreground">{author.title}</p>}</div>
        </div>
        {author.bio && <p className="mt-6 leading-7 text-muted-foreground">{stripHtml(author.bio)}</p>}
        <div className="mt-5 flex flex-wrap gap-4 text-sm">
          {links.filter(([, url]) => Boolean(url)).map(([label, url]) => <a key={label} href={url!} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{label}</a>)}
          {author.email && <a href={`mailto:${author.email}`} className="text-primary hover:underline">E-posta</a>}
        </div>
      </section>
      <section className="mt-6 rounded-lg border p-6"><h2 className="text-lg font-semibold">{locale === "tr" ? "Yazıları" : "Articles"}</h2>
        <ul className="mt-4 space-y-3">{posts.map((post) => <li key={post.id}><Link href={`/blog/${post.slug}`} className="font-medium text-primary hover:underline">{post.title}</Link></li>)}</ul>
        <nav className="mt-6 flex gap-5 text-sm">
          {page > 1 && <Link href={`/yazar/${author.slug}?page=${page - 1}`} className="text-primary hover:underline">{locale === "tr" ? "Önceki" : "Previous"}</Link>}
          {page < (data.meta?.last_page ?? 1) && <Link href={`/yazar/${author.slug}?page=${page + 1}`} className="text-primary hover:underline">{locale === "tr" ? "Sonraki" : "Next"}</Link>}
        </nav>
      </section>
      <section className="mt-6 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">{locale === "tr" ? "Editoryal not" : "Editorial note"}</h2>
        <p className="mt-3 leading-7 text-muted-foreground">
          {locale === "tr"
            ? "Sportoonline blog içerikleri bilgilendirme amaçlıdır. Egzersiz, beslenme veya takviye kararlarında kişisel sağlık durumunuz için uzman görüşü alınması önerilir. Ürün karşılaştırmalarında Sportoonline üzerinde satılan ürünlere yer verilebilir."
            : "Sportoonline blog content is for informational purposes. For exercise, nutrition, or supplement decisions, consult a qualified professional for your personal health context. Product comparisons may include products sold on Sportoonline."}
        </p>
      </section>
    </main>
  </>;
}
