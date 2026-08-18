"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Search, Mic, X, ArrowUpLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/routing";
import { useBaseService } from "@/lib/base-service";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { ROUTES } from "@/config/routes";
import type { Product } from "@/modules/product/product.type";

// Popüler aramalar artik /search/popular endpoint'ten geliyor (son 7 gun analytics).
// Eger backend bos donerse fallback statik liste:
const FALLBACK_POPULAR_TERMS = [
  "whey protein",
  "creatine",
  "bcaa",
  "futbol topu",
  "yoga matı",
  "shaker",
];

const LS_RECENT_KEY = "sportoonline_recent_searches";
const MAX_RECENT = 5;
const SUGGEST_DEBOUNCE_MS = 180;
const SUGGEST_MIN_CHARS = 2;
const MAX_TERM_ROWS = 6;
const MAX_PRODUCT_ROWS = 6;
// Bu uzunlugun uzerinde input icinde kayma basliyor, ghost tamamlama hizalanmaz
const GHOST_MAX_CHARS = 28;

interface ProductListResponse {
  data: Product[];
}

interface SuggestResponse {
  terms: string[];
  products: Array<{ id: number; name: string; slug: string; image_url: string | null }>;
  categories: Array<{ id: number; category_name: string; category_slug: string }>;
  brands: Array<{ id: number; name: string; slug: string }>;
}

interface PopularResponse {
  data: string[];
}

// Klavye ile gezilebilen tek duz liste (oneriler + kategori + marka + urun)
type NavItem =
  | { kind: "term"; label: string }
  | { kind: "category"; label: string; href: string }
  | { kind: "brand"; label: string }
  | { kind: "product"; label: string; href: string; id: number };

// Browser Web Speech API tip (cross-vendor)
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives?: number;
  start: () => void;
  stop: () => void;
  abort?: () => void;
  onstart: (() => void) | null;
  onresult: ((event: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
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

// Turkce karakterleri katla — "kosu" yazan "koşu" onerisini de eslesmis saysin
function foldTr(value: string): string {
  return value
    .replace(/[çÇ]/g, "c")
    .replace(/[ğĞ]/g, "g")
    .replace(/[ıIİi]/g, "i")
    .replace(/[öÖ]/g, "o")
    .replace(/[şŞ]/g, "s")
    .replace(/[üÜ]/g, "u")
    .toLocaleLowerCase("tr-TR");
}

export function SearchBar({ mobile = false }: { mobile?: boolean }) {
  const t = useTranslations();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [recents, setRecents] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const gotSpeechRef = useRef(false);

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

  // Popüler aramalar (son 7 gun analytics, 1 saat cache backend'de)
  const popularQuery = useQuery({
    queryKey: ["search-popular"],
    queryFn: async () => {
      const res = await getAxiosInstance().get("/search/popular?limit=10");
      return res.data as PopularResponse;
    },
    staleTime: 60 * 60 * 1000, // 1 saat
    enabled: open,
  });
  const popularTerms = popularQuery.data?.data?.length
    ? popularQuery.data.data
    : FALLBACK_POPULAR_TERMS;

  // Type-ahead autocomplete (debounce, min 2 char)
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < SUGGEST_MIN_CHARS) {
      setDebouncedQuery("");
      return;
    }
    const timer = setTimeout(() => setDebouncedQuery(trimmed), SUGGEST_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const suggestQuery = useQuery({
    queryKey: ["search-suggest", debouncedQuery],
    queryFn: async () => {
      const res = await getAxiosInstance().get(
        `/search/suggest?q=${encodeURIComponent(debouncedQuery)}&limit=12`
      );
      return res.data as SuggestResponse;
    },
    staleTime: 5 * 60 * 1000,
    enabled: open && debouncedQuery.length >= SUGGEST_MIN_CHARS,
  });

  const suggest = suggestQuery.data;
  const terms = useMemo(
    () => (suggest?.terms ?? []).slice(0, MAX_TERM_ROWS),
    [suggest]
  );
  const products = useMemo(
    () => (suggest?.products ?? []).slice(0, MAX_PRODUCT_ROWS),
    [suggest]
  );
  const categories = useMemo(() => suggest?.categories ?? [], [suggest]);
  const brands = useMemo(() => suggest?.brands ?? [], [suggest]);

  const hasSuggestions =
    debouncedQuery.length >= SUGGEST_MIN_CHARS &&
    terms.length + products.length + categories.length + brands.length > 0;

  // Klavye navigasyonu icin duz liste — ekrandaki sira ile birebir ayni
  const navItems = useMemo<NavItem[]>(() => {
    if (!hasSuggestions) return [];
    return [
      ...terms.map((label): NavItem => ({ kind: "term", label })),
      ...categories.map(
        (c): NavItem => ({
          kind: "category",
          label: c.category_name,
          href: `/kategori/${c.category_slug}`,
        })
      ),
      ...brands.map((b): NavItem => ({ kind: "brand", label: b.name })),
      ...products.map(
        (p): NavItem => ({
          kind: "product",
          label: p.name,
          href: `/urun/${p.slug}`,
          id: p.id,
        })
      ),
    ];
  }, [hasSuggestions, terms, categories, brands, products]);

  // Input icinde gri "hayalet" tamamlama: yazilan metnin devami
  const ghostCompletion = useMemo(() => {
    const typed = query;
    if (!typed || typed.length > GHOST_MAX_CHARS) return "";
    if (typed !== typed.trimStart()) return "";
    const folded = foldTr(typed);
    const match = terms.find((term) => foldTr(term).startsWith(folded) && foldTr(term) !== folded);
    if (!match) return "";
    // Yazilan kismi degil, sadece devamini goster (kullanicinin buyuk/kucuk harfi korunur)
    return match.slice(typed.length);
  }, [query, terms]);

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
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  // Component unmount olurken dinlemeyi birak (mikrofon acik kalmasin)
  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort?.();
      } catch {
        // ignore
      }
    };
  }, []);

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

  // Suggest urunden tiklama -> track icin (analytics: hangi arama hangi urune donustu)
  const trackProductClick = (term: string, productId: number) => {
    // Buradaki sayi yalnizca oneri listesinin uzunlugu — arama sayfasinin
    // toplam sonucu degil. Bos oldugunda hic gonderme, yoksa kayitli gercek
    // sonuc sayisini "0 sonuc" diye ezer.
    const suggestionCount = products.length;

    getAxiosInstance()
      .post("/search/track", {
        term,
        ...(suggestionCount > 0 ? { results_count: suggestionCount } : {}),
        clicked_product_id: productId,
      })
      .catch(() => {
        // sessiz fail
      });
  };

  // Highlight matched chars: "whey" query'sinde "Whey Protein" -> <b>Whey</b> Protein
  const highlightMatch = (text: string, term: string): React.ReactNode => {
    if (!term || term.length < SUGGEST_MIN_CHARS) return text;
    const idx = foldTr(text).indexOf(foldTr(term));
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="font-bold text-primary">{text.slice(idx, idx + term.length)}</span>
        {text.slice(idx + term.length)}
      </>
    );
  };

  // Oneri satirinda tersi: eslesen kisim normal, tamamlanan kisim kalin (Google davranisi)
  const highlightCompletion = (text: string, term: string): React.ReactNode => {
    const folded = foldTr(text);
    const foldedTerm = foldTr(term);
    if (!foldedTerm || !folded.startsWith(foldedTerm)) {
      return highlightMatch(text, term);
    }
    return (
      <>
        {text.slice(0, term.length)}
        <span className="font-semibold">{text.slice(term.length)}</span>
      </>
    );
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
    setActiveIndex(-1);
    inputRef.current?.blur();
    // Search analytics is recorded on the results page, where the real total
    // result count is known. Autocomplete length is not a result count.
    router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(q)}`);
  };

  const runNavItem = (item: NavItem) => {
    if (item.kind === "product") {
      trackProductClick(debouncedQuery, item.id);
      setOpen(false);
      router.push(item.href);
      return;
    }
    if (item.kind === "category") {
      setOpen(false);
      router.push(item.href);
      return;
    }
    submitSearch(item.label);
  };

  const acceptGhost = () => {
    if (!ghostCompletion) return false;
    setQuery(query + ghostCompletion);
    return true;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!open) setOpen(true);
      if (navItems.length === 0) return;
      e.preventDefault();
      setActiveIndex((prev) => {
        const delta = e.key === "ArrowDown" ? 1 : -1;
        const next = prev + delta;
        if (next < 0) return navItems.length - 1;
        if (next >= navItems.length) return 0;
        return next;
      });
      return;
    }
    // Tab / → ile gri tamamlamayi kabul et (Google davranisi)
    if (e.key === "Tab" && ghostCompletion) {
      if (acceptGhost()) e.preventDefault();
      return;
    }
    if (
      e.key === "ArrowRight" &&
      ghostCompletion &&
      inputRef.current &&
      inputRef.current.selectionStart === query.length &&
      inputRef.current.selectionEnd === query.length
    ) {
      if (acceptGhost()) e.preventDefault();
      return;
    }
    if (e.key === "Enter" && activeIndex >= 0 && navItems[activeIndex]) {
      e.preventDefault();
      runNavItem(navItems[activeIndex]);
    }
  };

  const voiceErrorMessage = (code?: string): string => {
    switch (code) {
      case "not-allowed":
      case "service-not-allowed":
        return "Mikrofon izni verilmedi. Tarayıcı adres çubuğundaki kilit simgesinden mikrofona izin verin.";
      case "no-speech":
        return "Ses algılanamadı, tekrar deneyin.";
      case "audio-capture":
        return "Mikrofon bulunamadı.";
      case "network":
        return "Ses tanıma servisine ulaşılamadı, bağlantınızı kontrol edin.";
      case "aborted":
        return "";
      default:
        return "Sesli arama başlatılamadı, tekrar deneyin.";
    }
  };

  const startVoiceSearch = () => {
    const SR = getSpeechRecognition();
    if (!SR) {
      setVoiceError("Tarayıcınız sesli aramayı desteklemiyor.");
      return;
    }
    setVoiceError(null);
    gotSpeechRef.current = false;
    try {
      const rec = new SR();
      rec.lang = "tr-TR";
      rec.continuous = false;
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onstart = () => {
        setIsListening(true);
        setOpen(true);
      };
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        gotSpeechRef.current = true;
        setQuery(transcript);
        setIsListening(false);
        // 600ms sonra otomatik submit
        setTimeout(() => submitSearch(transcript), 600);
      };
      rec.onerror = (event) => {
        setIsListening(false);
        setVoiceError(voiceErrorMessage(event?.error));
      };
      rec.onend = () => {
        setIsListening(false);
        if (!gotSpeechRef.current) {
          setVoiceError((prev) => prev ?? "Ses algılanamadı, tekrar deneyin.");
        }
      };
      recognitionRef.current = rec;
      rec.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
      setVoiceError("Sesli arama başlatılamadı, tekrar deneyin.");
    }
  };

  const stopVoiceSearch = () => {
    gotSpeechRef.current = true; // manuel durdurmada "ses algılanamadı" uyarısı çıkmasın
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    setIsListening(false);
  };

  const trending = trendingQuery.data?.data ?? [];
  const showBrowseSections = !hasSuggestions;

  // navItems icindeki mutlak index — liste sirasi: terms > categories > brands > products
  const CATEGORY_OFFSET = terms.length;
  const BRAND_OFFSET = CATEGORY_OFFSET + categories.length;
  const PRODUCT_OFFSET = BRAND_OFFSET + brands.length;
  const rowClass = (index: number) =>
    `flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm transition-colors ${
      index === activeIndex ? "bg-muted" : "hover:bg-muted"
    }`;

  return (
    <div
      ref={wrapperRef}
      className={mobile ? "relative w-full" : "relative hidden flex-1 md:flex"}
    >
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
          <div className="relative h-full min-w-0 flex-1">
            {/* Gri hayalet tamamlama — input ile birebir ayni tipografi */}
            {ghostCompletion && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-pre px-4 text-sm text-muted-foreground"
              >
                <span className="invisible">{query}</span>
                <span>{ghostCompletion}</span>
              </div>
            )}
            <input
              ref={inputRef}
              type="text"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              role="combobox"
              aria-expanded={open}
              aria-autocomplete="list"
              aria-controls="search-suggestions"
              placeholder={t("common.search_placeholder")}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(-1); // yazi degisince klavye secimi sifirlanir
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              className="relative h-full w-full border-none bg-transparent px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label={t("common.clear")}
              className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {speechSupported && (
            <button
              type="button"
              onClick={isListening ? stopVoiceSearch : startVoiceSearch}
              aria-label={t("common.voice_search")}
              title={t("common.voice_search")}
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
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-full z-[90] mt-2 max-h-[70vh] overflow-y-auto rounded-lg border bg-background p-4 shadow-2xl"
        >
          {/* Sesli arama durumu */}
          {isListening && (
            <div className="mb-3 flex items-center gap-2 rounded-md bg-red-500/10 px-3 py-2 text-sm font-medium text-red-600">
              <Mic className="h-4 w-4 animate-pulse" />
              Dinleniyor… şimdi konuşun
            </div>
          )}
          {!isListening && voiceError && (
            <div className="mb-3 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
              {voiceError}
            </div>
          )}

          {/* Type-ahead: kelime tamamlama + kategori/marka/urun */}
          {hasSuggestions && (
            <div className="mb-2">
              {terms.map((term, i) => {
                const index = i;
                return (
                  <button
                    key={`term-${term}`}
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => submitSearch(term)}
                    className={rowClass(index)}
                  >
                    <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-foreground">
                      {highlightCompletion(term, debouncedQuery)}
                    </span>
                    <ArrowUpLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 sm:opacity-60" />
                  </button>
                );
              })}

              {categories.map((c, i) => {
                const index = CATEGORY_OFFSET + i;
                return (
                  <Link
                    key={`cat-${c.id}`}
                    href={`/kategori/${c.category_slug}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => setOpen(false)}
                    className={rowClass(index)}
                  >
                    <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-foreground">
                      {highlightMatch(c.category_name, debouncedQuery)}
                    </span>
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Kategori
                    </span>
                  </Link>
                );
              })}

              {brands.map((b, i) => {
                const index = BRAND_OFFSET + i;
                return (
                  <button
                    key={`brand-${b.id}`}
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => submitSearch(b.name)}
                    className={rowClass(index)}
                  >
                    <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-foreground">
                      {highlightMatch(b.name, debouncedQuery)}
                    </span>
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Marka
                    </span>
                  </button>
                );
              })}

              {products.length > 0 && (
                <div className="mt-2 border-t pt-2">
                  <h3 className="mb-1 px-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    Ürünler
                  </h3>
                  {products.map((p, i) => {
                    const index = PRODUCT_OFFSET + i;
                    return (
                      <Link
                        key={`prod-${p.id}`}
                        href={`/urun/${p.slug}`}
                        role="option"
                        aria-selected={index === activeIndex}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => {
                          trackProductClick(debouncedQuery, p.id);
                          setOpen(false);
                        }}
                        className={rowClass(index)}
                      >
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded bg-muted">
                          {p.image_url && (
                            <Image
                              src={p.image_url}
                              alt={p.name}
                              fill
                              sizes="36px"
                              className="object-cover"
                              unoptimized
                            />
                          )}
                        </div>
                        <span className="line-clamp-2 min-w-0 flex-1 text-xs text-foreground">
                          {highlightMatch(p.name, debouncedQuery)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={() => submitSearch()}
                className="mt-2 flex w-full items-center justify-center gap-1 rounded border-t px-2 py-2 text-xs font-bold text-primary hover:bg-primary/5"
              >
                “{query.trim()}” için tüm sonuçlar
              </button>
            </div>
          )}

          {/* Yaziliyor ama sonuc henuz gelmedi */}
          {!hasSuggestions &&
            debouncedQuery.length >= SUGGEST_MIN_CHARS &&
            suggestQuery.isFetching && (
              <div className="flex items-center gap-2 px-2 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Aranıyor…
              </div>
            )}

          {/* Sonuc yok */}
          {!hasSuggestions &&
            debouncedQuery.length >= SUGGEST_MIN_CHARS &&
            !suggestQuery.isFetching && (
              <div className="mb-3 px-2 py-2 text-sm text-muted-foreground">
                “{debouncedQuery}” için öneri bulunamadı — yine de{" "}
                <button
                  type="button"
                  onClick={() => submitSearch()}
                  className="font-bold text-primary hover:underline"
                >
                  aramayı deneyin
                </button>
                .
              </div>
            )}

          {/* Son aramalar (sadece oneri yokken) */}
          {showBrowseSections && recents.length > 0 && (
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

          {/* Popüler aramalar (dinamik /search/popular, fallback statik) */}
          {showBrowseSections && (
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-bold text-foreground">
                {t("common.popular_searches")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularTerms.map((term) => (
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
          )}

          {/* Trend ürünler */}
          {showBrowseSections && trending.length > 0 && (
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
