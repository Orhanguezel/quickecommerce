import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { getEnginEserAuthor } from "@/lib/authors";
import { DEFAULT_ORGANIZATION, localizedAlternates, SITE_URL } from "@/lib/seo";
import { User } from "lucide-react";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const author = getEnginEserAuthor(locale);

  return {
    title:
      locale === "tr"
        ? `${author.name} | Sportoonline Yazar Profili`
        : `${author.name} | Sportoonline Author Profile`,
    description: author.bio,
    alternates: {
      canonical: `/${locale}${author.path}`,
      languages: localizedAlternates(author.path),
    },
    openGraph: {
      title: author.name,
      description: author.bio,
      type: "profile",
      url: author.localizedUrl,
      siteName: DEFAULT_ORGANIZATION.name,
      ...(author.image ? { images: [{ url: author.image }] } : {}),
    },
  };
}

export default async function EnginEserAuthorPage({ params }: Props) {
  const { locale } = await params;
  const author = getEnginEserAuthor(locale);
  const isTr = locale === "tr";

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url: author.localizedUrl,
    ...(author.image ? { image: author.image } : {}),
    jobTitle: author.title,
    description: author.bio,
    sameAs: author.sameAs,
    worksFor: {
      "@type": "Organization",
      name: DEFAULT_ORGANIZATION.name,
      url: SITE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <main className="container py-10">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            {isTr ? "Bloga don" : "Back to blog"}
          </Link>

          <section className="mt-6 rounded-lg border bg-card p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {author.image ? (
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-muted">
                  <Image
                    src={author.image}
                    alt={author.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                    priority
                  />
                </div>
              ) : (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-muted">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-primary">
                  {isTr ? "Yazar profili" : "Author profile"}
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight">
                  {author.name}
                </h1>
                <p className="mt-2 text-base text-muted-foreground">
                  {author.title}
                </p>
              </div>
            </div>
            <p className="mt-6 leading-7 text-muted-foreground">
              {author.bio}
            </p>
          </section>

          <section className="mt-6 rounded-lg border p-6">
            <h2 className="text-lg font-semibold">
              {isTr ? "Uzmanlik alanlari" : "Coverage areas"}
            </h2>
            <ul className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <li>Spor ekipmanlari</li>
              <li>Sporcu beslenmesi</li>
              <li>Fitness ve kosu rehberleri</li>
              <li>Online alisveris ve urun secimi</li>
            </ul>
          </section>

          <section className="mt-6 rounded-lg border p-6">
            <h2 className="text-lg font-semibold">
              {isTr ? "Editoryal not" : "Editorial note"}
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              {isTr
                ? "Sportoonline blog icerikleri bilgilendirme amaclidir. Egzersiz, beslenme veya takviye kararlarinda kisisel saglik durumunuz icin uzman gorusu almaniz onerilir. Urun karsilastirmalarinda Sportoonline uzerinde satilan urunlere yer verilebilir."
                : "Sportoonline blog content is for informational purposes. For exercise, nutrition, or supplement decisions, consult a qualified professional for your personal health context. Product comparisons may include products sold on Sportoonline."}
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
