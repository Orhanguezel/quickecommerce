"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Search, Mic, X } from "lucide-react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/routing";
import { useBaseService } from "@/lib/base-service";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { ROUTES } from "@/config/routes";
import type { Product } from "@/modules/product/product.type";

// Sportoonline'a uygun statik popüler aramalar. Sonra `search/popular` endpoint
// ile dinamik yapilacak (admin paneldeki + auto-track).
const STATIC_POPULAR_TERMS = [
  "whey protein",
  "creatine",
  "bcaa",
  "futbol topu",
  "antrenman eldiveni",
  "running ayakkabı",
  "yoga matı",
  "sporcu havlu",
  "shaker",
  "pre workout",
];

const LS_RECENT_KEY = "sportoonline_recent_searches";
const MAX_RECENT = 5;

interface ProductListResponse {
  data: Product[];
}

// Browser Web Speech API tip (cross-vendor)
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function SearchBar() {
  const t = useTranslations();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [recents, setRecents] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // Trending ürünler (focus + boş input için)
  const { getAxiosInstance } = useBaseService<ProductListResponse>(
    API_ENDPOINTS.PRODUCTS
  );

  const trendingQuery = useQuery({
    queryKey: ["search-trending-products"],
    queryFn: async () => {
      const res = await getAxiosInstance().get(
        `${API_ENDPOINTS.PRODUCTS}?type=trending&per_page=8`
      );
      return res.data as ProductListResponse;
    },
    staleTime: 10 * 60 * 1000, // 10dk
    enabled: open, // sadece dropdown açıkken fetch
  });

  // Recent searches localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_RECENT_KEY);
      if (raw) setRecents(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  // Web Speech API support
  useEffect(() => {
    setSpeechSupported(getSpeechRecognition() !== null);
  }, []);

  // Dropdown'u dış tıklamada kapat
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const persistRecent = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecents((prev) => {
      const next = [trimmed, ...prev.filter((r) => r !== trimmed)].slice(
        0,
        MAX_RECENT
      );
      try {
        localStorage.setItem(LS_RECENT_KEY, JSON.stringify(next));
      } catch {
        // ignore quota
      }
      return next;
    });
  };

  const clearRecents = () => {
    setRecents([]);
    try {
      localStorage.removeItem(LS_RECENT_KEY);
    } catch {
      // ignore
    }
  };

  const submitSearch = (term?: string) => {
    const q = (term ?? query).trim();
    if (!q) return;
    persistRecent(q);
    setOpen(false);
    router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(q)}`);
  };

  const startVoiceSearch = () => {
    const SR = getSpeechRecognition();
    if (!SR) return;
    try {
      const rec = new SR();
      rec.lang = "tr-TR";
      rec.continuous = false;
      rec.interimResults = false;
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        // 800ms sonra otomatik submit
        setTimeout(() => submitSearch(transcript), 800);
      };
      rec.onerror = () => {
        setIsListening(false);
      };
      rec.onend = () => {
        setIsListening(false);
      };
      recognitionRef.current = rec;
      rec.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  const stopVoiceSearch = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const trending = trendingQuery.data?.data ?? [];

  return (
    <div ref={wrapperRef} className="relative hidden flex-1 md:flex">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitSearch();
        }}
        className="w-full"
      >
        <div
          className={`flex h-11 w-full items-center overflow-hidden rounded-[4px] border-2 border-primary bg-background transition-shadow lg:h-12 ${
            open ? "shadow-[0_0_0_3px_hsl(var(--primary)/0.14)]" : "focus-within:shadow-[0_0_0_3px_hsl(var(--primary)/0.14)]"
          }`}
        >
          <input
            ref={inputRef}
            type="search"
            placeholder={t("common.search_placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            className="h-full min-w-0 flex-1 border-none bg-transparent px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {speechSupported && (
            <button
              type="button"
              onClick={isListening ? stopVoiceSearch : startVoiceSearch}
              aria-label={t("common.voice_search")}
              className={`mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] transition-colors ${
                isListening
                  ? "animate-pulse bg-red-500 text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Mic className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            aria-label={t("common.search")}
            className="mr-1 flex h-9 w-11 shrink-0 items-center justify-center rounded-[3px] bg-primary text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </form>

      {open && (
        <div className="absolute left-0 right-0 top-full z-[90] mt-2 max-h-[70vh] overflow-y-auto rounded-lg border bg-background p-4 shadow-2xl">
          {/* Son aramalar */}
          {recents.length > 0 && (
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">
                  {t("common.recent_searches")}
                </h3>
                <button
                  type="button"
                  onClick={clearRecents}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {t("common.clear")}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recents.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => submitSearch(term)}
                    className="group flex items-center gap-1 rounded-full border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5"
                  >
                    {term}
                    <X
                      className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRecents((prev) => {
                          const next = prev.filter((r) => r !== term);
                          try {
                            localStorage.setItem(
                              LS_RECENT_KEY,
                              JSON.stringify(next)
                            );
                          } catch {
                            // ignore
                          }
                          return next;
                        });
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popüler aramalar */}
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-bold text-foreground">
              {t("common.popular_searches")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {STATIC_POPULAR_TERMS.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => submitSearch(term)}
                  className="rounded-full border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Trend ürünler */}
          {trending.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">
                  {t("common.trending_products")}
                </h3>
                <Link
                  href={ROUTES.PRODUCTS}
                  className="text-xs font-bold text-primary hover:underline"
                  onClick={() => setOpen(false)}
                >
                  {t("common.show_all")} →
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {trending.slice(0, 8).map((p) => {
                  const displayPrice =
                    (p.special_price && p.special_price > 0
                      ? p.special_price
                      : p.price) ?? 0;
                  return (
                    <Link
                      key={p.id}
                      href={`/urun/${p.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex w-[200px] shrink-0 items-center gap-3 rounded-lg border bg-card p-2 transition-shadow hover:shadow-md"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-muted">
                        {p.image_url && (
                          <Image
                            src={p.image_url}
                            alt={p.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-xs font-medium leading-tight text-foreground">
                          {p.name}
                        </p>
                        {displayPrice > 0 && (
                          <p className="mt-1 text-sm font-bold text-primary">
                            {Number(displayPrice).toLocaleString("tr-TR")} ₺
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
