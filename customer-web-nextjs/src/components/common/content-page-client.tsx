"use client";

import { Link, usePathname } from "@/i18n/routing";
import { ChevronRight } from "lucide-react";

interface Breadcrumb {
  label: string;
  href?: string;
}

// Yasal/politika sayfalari ana icerikte yalniz ana sayfaya link veriyordu
// (Tanitio 2026-09-25: ic link 71.8/100). Kullanicinin siradaki sorusu
// genellikle bu sayfalardan biridir; ayni zamanda taranabilir ic link saglar.
const RELATED_PAGES: Array<{ href: string; label: string }> = [
  { href: "/iade-degisim", label: "İade ve Değişim" },
  { href: "/kargo-politikasi", label: "Kargo ve Teslimat" },
  { href: "/mesafeli-satis-sozlesmesi", label: "Mesafeli Satış Sözleşmesi" },
  { href: "/uye-sozlesmesi", label: "Üye Sözleşmesi" },
  { href: "/gizlilik-politikasi", label: "Gizlilik Politikası" },
  { href: "/kullanim-kosullari", label: "Kullanım Koşulları" },
  { href: "/aydinlatma-metni", label: "KVKK Aydınlatma Metni" },
  { href: "/iletisim", label: "İletişim" },
  { href: "/kategoriler", label: "Tüm Kategoriler" },
];

interface ContentPageClientProps {
  title: string;
  content: string | any[] | null;
  breadcrumbs: Breadcrumb[];
}

export function ContentPageClient({
  title,
  content,
  breadcrumbs,
}: ContentPageClientProps) {
  const htmlContent = typeof content === "string" ? content : null;
  const pathname = usePathname();
  const related = RELATED_PAGES.filter((page) => page.href !== pathname);

  return (
    <div className="container py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-foreground">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-foreground">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <h1 className="mb-6 text-2xl font-bold tracking-tight">{title}</h1>

      {htmlContent ? (
        <div
          className="prose prose-sm max-w-none dark:prose-invert sm:prose-base"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      ) : (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          <p>Bu sayfa henüz hazırlanıyor.</p>
        </div>
      )}

      <nav aria-label="İlgili sayfalar" className="mt-10 border-t pt-6">
        <h2 className="mb-3 text-base font-semibold">İlgili sayfalar</h2>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {related.map((page) => (
            <li key={page.href}>
              <Link href={page.href} className="text-primary hover:underline">
                {page.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
