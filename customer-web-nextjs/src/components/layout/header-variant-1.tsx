'use client';

import { Link, useRouter, usePathname } from '@/i18n/routing';
import { ROUTES } from '@/config/routes';
import { useSiteInfoQuery, useMenuQuery, useCategoryQuery } from '@/modules/site/site.action';
import {
  isDisplayableProductCategory,
  isBuyPayCampaignCategory,
  sortCategoriesForNavigation,
} from '@/modules/site/category-utils';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { MobileNav } from './mobile-nav';
import { SearchBar } from './search-bar';
import { LanguageSwitcher } from './language-switcher';
import { CurrencySwitcher } from '@/components/common/currency-switcher';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  Moon,
  Sun,
  ChevronRight,
  PackageSearch,
  Tags,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import type { Category, MenuItem } from '@/modules/site/site.type';

function chunkArray<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items];

  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

export function HeaderVariant1() {
  const t = useTranslations();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { siteInfo } = useSiteInfoQuery();
  const { menus } = useMenuQuery();
  const { categories } = useCategoryQuery();
  const cartCountLive = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const openCartDrawer = useCartStore((s) => s.openDrawer);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [activeCatId, setActiveCatId] = useState<number | null>(null);
  const [logoError, setLogoError] = useState(false);

  const allCats = useMemo(() => categories as Category[], [categories]);

  const getChildren = (parentId: number) =>
    allCats.filter((c) => Number(c.parent_id) === Number(parentId));

  const getDisplayableDescendants = (parentId: number): Category[] =>
    getChildren(parentId)
      .filter((child) => !isBuyPayCampaignCategory(child))
      .sort(sortCategoriesForNavigation)
      .flatMap((child) =>
        isDisplayableProductCategory(child)
          ? [child]
          : getDisplayableDescendants(child.id)
      );

  const topCategories = useMemo(
    () => {
      const hasDisplayableCategory = (category: Category) =>
        isDisplayableProductCategory(category) ||
        getDisplayableDescendants(category.id).length > 0;

      // Header'da/mega-menude SADECE onemli kategoriler:
      // - display_order set edilmis (admin oncelikli)
      // - VEYA en az 30 urunu olan (anlamli icerik)
      // Anahtarlik (4 urun) gibi niche kategoriler menude gozukmesin.
      const MIN_PRODUCTS_FOR_HEADER = 30;
      const isImportantForHeader = (category: Category) =>
        (Number(category.display_order) > 0) ||
        (Number(category.product_count || 0) >= MIN_PRODUCTS_FOR_HEADER);

      return allCats
        .filter((c) => c.parent_id === null)
        .filter((parent) => !isBuyPayCampaignCategory(parent))
        .filter(hasDisplayableCategory)
        .filter(isImportantForHeader)
        .sort(sortCategoriesForNavigation);
    },
    [allCats]
  );

  const getRenderableChildren = (parentId: number) =>
    getChildren(parentId)
      .filter((child) => !isBuyPayCampaignCategory(child))
      .sort(sortCategoriesForNavigation)
      .flatMap((child) =>
        isDisplayableProductCategory(child)
          ? [child]
          : getDisplayableDescendants(child.id)
      );

  const activeCategory =
    topCategories.find((cat) => cat.id === activeCatId) ?? topCategories[0] ?? null;
  const activeChildren = activeCategory ? getRenderableChildren(activeCategory.id) : [];
  // Header inline nav: SADECE display_order set edilmis kategoriler gozuksun.
  // Gerisi 'Tum Kategoriler' mega-menu'de zaten erisilebilir — header bar'da
  // 'Anahtarlik' gibi rastgele/alfabetik kategoriler cikmasin.
  const visibleNavCategories = topCategories
    .filter((c) => Number(c.display_order) > 0)
    .slice(0, 9);

  // Aktif kategori URL'den belirlenir: /tr/kategori/{slug}
  const pathname = usePathname();
  const activePathSlug = (() => {
    if (!pathname) return null;
    const m = pathname.match(/^\/kategori\/([^/?]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  })();

  // Topbar scroll davranisi: scroll Y > 50 ise collapse, < 30 ise goster (hysteresis)
  const [topbarVisible, setTopbarVisible] = useState(true);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setTopbarVisible((current) => {
          if (current && y > 50) return false;
          if (!current && y < 30) return true;
          return current;
        });
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const centerCategories =
    activeChildren.length > 0
      ? activeChildren
      : topCategories.filter((cat) => cat.id !== activeCategory?.id).slice(0, 18);
  const primaryCenterCategories = centerCategories.slice(0, 8);
  const secondaryCenterCategories = centerCategories.slice(8);
  const centerColumnSize = Math.ceil(Math.max(secondaryCenterCategories.length, 1) / 2);
  const centerColumns = chunkArray(secondaryCenterCategories, centerColumnSize).slice(0, 2);
  const promoSeen = new Set<number>();
  const promoCategories = [activeCategory, ...activeChildren, ...topCategories]
    .filter((cat): cat is Category => Boolean(cat?.category_thumb_url))
    .filter((cat) => {
      if (promoSeen.has(cat.id)) return false;
      promoSeen.add(cat.id);
      return true;
    })
    .slice(0, 4);
  const megaMenuGridClass =
    promoCategories.length > 0
      ? 'xl:grid-cols-[180px_minmax(0,1fr)_380px] 2xl:grid-cols-[180px_minmax(0,1fr)_420px]'
      : 'xl:grid-cols-[180px_minmax(0,1fr)]';
  const brandTagline = topCategories.length
    ? topCategories.slice(0, 3).map((cat) => cat.category_name).join(' • ')
    : 'spor • beslenme • ekipman';

  const featuredNavLinks = [
    { href: ROUTES.PRODUCTS, label: t('home.all_products_title'), icon: PackageSearch },
    { href: ROUTES.CAMPAIGNS, label: t('home.top_deals_title'), icon: Zap },
    { href: ROUTES.COUPONS, label: t('nav.coupons'), icon: Tags },
  ];

  const fallbackMenuLinks = menus
    .filter((m: MenuItem) => m.is_visible && m.parent_id === null)
    .sort((a: MenuItem, b: MenuItem) => a.position - b.position)
    .slice(0, 5);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const openMegaMenu = () => {
    const nextOpen = !catOpen;
    setCatOpen(nextOpen);
    if (nextOpen) {
      setActiveCatId((current) => current ?? topCategories[0]?.id ?? null);
    }
  };

  useEffect(() => {
    if (!catOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCatOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [catOpen]);

  return (
    <>
      <div
        className="sticky z-[80] w-full shadow-sm"
        style={{ top: 'var(--theme-popup-top-offset, 0px)' }}
      >
        <div
          className={`hidden overflow-hidden transition-all duration-200 lg:block ${
            topbarVisible ? 'max-h-8 opacity-100' : 'max-h-0 opacity-0'
          }`}
          style={{
            backgroundColor: 'hsl(var(--header-topbar-bg))',
            color: 'hsl(var(--header-topbar-text))',
          }}
        >
          <div className="container flex h-8 items-center justify-between text-[11px] font-medium">
            <div className="flex items-center gap-5">
              {/* "Tüm Ürünler" topbar'dan kaldırıldı — alt nav'da zaten var */}
              <Link href={ROUTES.SELLER_REGISTER} className="transition-opacity hover:opacity-80">
                {t('common.become_seller')}
              </Link>
              <span className="h-3 w-px bg-current opacity-20" />
              <Link href={ROUTES.SUPPORT} className="transition-opacity hover:opacity-80">
                {t('support.support')}
              </Link>
            </div>
            <div className="flex items-center gap-5">
              {/* "Kuponlar" topbar'dan kaldırıldı — alt nav'da zaten var */}
              <Link href={ROUTES.BLOG} className="transition-opacity hover:opacity-80">
                {t('nav.blog')}
              </Link>
              <Link href={ROUTES.ABOUT} className="transition-opacity hover:opacity-80">
                {t('nav.about')}
              </Link>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <CurrencySwitcher />
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-current/20 transition-opacity hover:opacity-80"
                aria-label={t('toggle_theme')}
              >
                {mounted && theme === 'dark' ? (
                  <Sun className="h-3.5 w-3.5" />
                ) : (
                  <Moon className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
        </div>

        <div
          className="border-b"
          style={{ backgroundColor: 'hsl(var(--header-main-bg))' }}
        >
          <div className="container flex h-[64px] items-center gap-2 md:h-[72px] md:gap-4 lg:h-[86px] lg:gap-10">
            <button
              className="flex shrink-0 items-center justify-center rounded-lg p-1.5 text-foreground lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label={t('nav.categories')}
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link
              href={ROUTES.HOME}
              title={siteInfo?.com_site_title || 'Sportoonline'}
              aria-label={siteInfo?.com_site_title || 'Sportoonline'}
              className="flex flex-1 items-center justify-center md:flex-none md:justify-start"
            >
              {siteInfo?.com_site_logo && !logoError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={siteInfo.com_site_logo}
                  alt={siteInfo?.com_site_title || 'Logo'}
                  className="h-12 w-auto max-w-[168px] object-contain lg:h-14 lg:max-w-[220px]"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="flex items-end gap-2">
                  <span className="truncate text-2xl font-extrabold leading-none text-primary lg:text-[32px]">
                    {siteInfo?.com_site_title || 'Sportoonline'}
                  </span>
                  <span className="hidden max-w-[150px] truncate pb-1 text-[10px] font-semibold lowercase text-muted-foreground xl:inline">
                    {brandTagline}
                  </span>
                </span>
              )}
            </Link>

            <SearchBar />

            <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:gap-1">
              <Link
                href={isAuthenticated ? ROUTES.PROFILE : ROUTES.LOGIN}
                className="flex min-w-[74px] flex-col items-center justify-center rounded-[4px] px-2 py-2 text-[11px] font-bold text-foreground transition-colors hover:bg-primary/5"
                aria-label={isAuthenticated ? t('common.account') : t('common.login')}
              >
                <User className="mb-1 h-5 w-5" strokeWidth={1.8} />
                <span className="hidden whitespace-nowrap lg:inline">
                  {isAuthenticated ? t('common.account') : t('common.login')}
                </span>
              </Link>

              <Link
                href={ROUTES.WISHLIST}
                className="hidden min-w-[74px] flex-col items-center justify-center rounded-[4px] px-2 py-2 text-[11px] font-bold text-foreground transition-colors hover:bg-primary/5 sm:flex"
                aria-label={t('common.wishlist')}
              >
                <Heart className="mb-1 h-5 w-5" strokeWidth={1.8} />
                <span className="hidden whitespace-nowrap lg:inline">{t('common.wishlist')}</span>
              </Link>

              <button
                id="header-cart-icon"
                onClick={openCartDrawer}
                aria-label={t('common.cart')}
                className="relative flex min-w-[74px] flex-col items-center justify-center rounded-[4px] px-2 py-2 text-[11px] font-bold text-foreground transition-colors hover:bg-primary/5"
              >
                <ShoppingCart className="mb-1 h-5 w-5" strokeWidth={1.8} />
                <span className="hidden whitespace-nowrap lg:inline">{t('common.cart')}</span>
                <span className="absolute right-3 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
                  {cartCountLive}
                </span>
              </button>

              <div className="lg:hidden">
                <LanguageSwitcher iconOnly />
              </div>
            </div>
          </div>
        </div>

        <nav
          className="relative hidden border-b lg:block"
          style={{ backgroundColor: 'hsl(var(--header-main-bg))' }}
        >
          <div className="container flex h-11 items-center gap-4 overflow-hidden">
            <button
              onClick={openMegaMenu}
              className="flex h-full shrink-0 items-center gap-2 bg-primary/10 px-4 text-sm font-extrabold text-primary transition-colors hover:bg-primary/15"
              aria-expanded={catOpen}
              aria-haspopup="menu"
            >
              <Menu className="h-5 w-5" />
              <span>{t('nav.all_categories')}</span>
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-primary-foreground">
                {t('home.new_arrivals_title').split(' ')[0].toUpperCase()}
              </span>
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-0 overflow-hidden text-[13px] font-bold">
              {visibleNavCategories.length > 0
                ? visibleNavCategories.map((cat) => {
                    const isActive = activePathSlug === cat.category_slug;
                    return (
                      <Link
                        key={cat.id}
                        href={ROUTES.CATEGORY(cat.category_slug)}
                        prefetch
                        className={`relative flex h-11 shrink-0 items-center border-b-[3px] px-3 transition-colors hover:text-primary ${
                          isActive
                            ? 'border-primary text-primary'
                            : 'border-transparent'
                        }`}
                        style={
                          isActive
                            ? undefined
                            : { color: 'hsl(var(--header-nav-text))' }
                        }
                      >
                        {cat.category_name}
                      </Link>
                    );
                  })
                : fallbackMenuLinks.map((menu: MenuItem) => (
                    <Link
                      key={menu.id}
                      href={menu.url ? `/${menu.url}` : '/'}
                      className="flex h-11 shrink-0 items-center border-b-2 border-transparent transition-colors hover:text-primary"
                      style={{ color: 'hsl(var(--header-nav-text))' }}
                    >
                      {menu.name}
                    </Link>
                  ))}
            </div>

            <div className="hidden items-center gap-2 xl:flex">
              {featuredNavLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex h-8 items-center gap-1.5 rounded-[4px] px-2 text-xs font-bold text-foreground transition-colors hover:bg-primary/5 hover:text-primary"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {catOpen && (
            <div
              className="fixed inset-x-0 bottom-0 z-[90] bg-foreground/25"
              style={{ top: 'calc(var(--theme-popup-top-offset, 0px) + 162px)' }}
              onMouseDown={() => setCatOpen(false)}
            >
              <div className="mx-auto w-[calc(100vw-20px)] max-w-[1720px]">
                <div
                  className={`grid min-h-[430px] overflow-hidden rounded-b-md border-x border-b bg-background shadow-2xl ${megaMenuGridClass}`}
                  style={{
                    height: 'min(560px, calc(100vh - var(--theme-popup-top-offset, 0px) - 174px))',
                  }}
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  <aside className="overflow-y-auto border-r bg-muted/30 p-2">
                    <div className="space-y-1">
                      {topCategories.map((cat) => {
                        const isActive = activeCategory?.id === cat.id;
                        return (
                          <Link
                            key={cat.id}
                            href={ROUTES.CATEGORY(cat.category_slug)}
                            prefetch
                            onMouseEnter={() => setActiveCatId(cat.id)}
                            onFocus={() => setActiveCatId(cat.id)}
                            onClick={() => setCatOpen(false)}
                            className={`flex w-full items-center justify-between rounded-md px-3 py-3 text-left text-sm font-bold transition-colors ${
                              isActive
                                ? 'bg-background text-primary shadow-sm'
                                : 'text-foreground hover:bg-muted'
                            }`}
                          >
                            <span className="min-w-0 line-clamp-2 leading-tight">
                              {cat.category_name}
                            </span>
                            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                          </Link>
                        );
                      })}
                    </div>
                  </aside>

                  <div className="overflow-y-auto px-5 py-4 lg:px-6">
                    {activeCategory ? (
                      <div className="grid gap-x-10 gap-y-6 md:grid-cols-2 xl:grid-cols-3">
                        <div>
                          <Link
                            href={ROUTES.CATEGORY(activeCategory.category_slug)}
                            prefetch
                            onClick={() => setCatOpen(false)}
                            className="mb-4 flex items-center gap-1 text-sm font-extrabold text-primary"
                          >
                            {t('nav.all_categories')} {activeCategory.category_name}
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                          <div className="space-y-2">
                            {primaryCenterCategories.map((child) => (
                              <Link
                                key={child.id}
                                href={ROUTES.CATEGORY(child.category_slug)}
                                prefetch
                                onClick={() => setCatOpen(false)}
                                className="block text-sm font-medium leading-tight text-foreground transition-colors hover:text-primary"
                              >
                                {child.category_name}
                              </Link>
                            ))}
                          </div>
                        </div>

                        {centerColumns.map((column, columnIndex) => (
                          <div key={columnIndex} className="space-y-5">
                            {column.map((child) => {
                              const grandchildren = getRenderableChildren(child.id).slice(0, 5);
                              return (
                                <div key={child.id}>
                                  <Link
                                    href={ROUTES.CATEGORY(child.category_slug)}
                                    prefetch
                                    onClick={() => setCatOpen(false)}
                                    className="flex items-center gap-1 text-sm font-extrabold text-primary"
                                  >
                                    {child.category_name}
                                    <ChevronRight className="h-4 w-4" />
                                  </Link>
                                  {grandchildren.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                      {grandchildren.map((grandchild) => (
                                        <Link
                                          key={grandchild.id}
                                          href={ROUTES.CATEGORY(grandchild.category_slug)}
                                          prefetch
                                          onClick={() => setCatOpen(false)}
                                          className="block text-sm leading-tight text-foreground transition-colors hover:text-primary"
                                        >
                                          {grandchild.category_name}
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid gap-4 lg:grid-cols-3">
                        {featuredNavLinks.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setCatOpen(false)}
                              className="flex items-center gap-3 rounded-lg border bg-card p-4 text-sm font-bold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                            >
                              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Icon className="h-5 w-5" />
                              </span>
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {promoCategories.length > 0 && (
                  <div className="hidden overflow-y-auto border-l bg-muted/20 p-5 xl:block">
                    <div className="grid grid-cols-2 gap-3">
                      {promoCategories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={ROUTES.CATEGORY(cat.category_slug)}
                          prefetch
                          onClick={() => setCatOpen(false)}
                          className="group overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className="relative aspect-[1.35] overflow-hidden bg-muted">
                            <Image
                              src={cat.category_thumb_url}
                              alt={cat.category_name}
                              fill
                              sizes="210px"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                          <div className="min-h-[58px] bg-background/95 p-2.5">
                            <span className="line-clamp-2 text-sm font-extrabold uppercase leading-tight text-foreground">
                              {cat.category_name}
                            </span>
                            <span className="mt-0.5 flex items-center gap-1 text-xs font-bold text-primary">
                              {t('common.view_all')}
                              <ChevronRight className="h-3 w-3" />
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>

        <div className="border-b bg-background md:hidden">
          <div className="container py-2">
            <form onSubmit={handleSearch} className="flex overflow-hidden rounded-lg border border-border">
              <input
                type="search"
                placeholder={t('common.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 flex-1 border-none bg-transparent px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                aria-label={t('common.search')}
                className="flex shrink-0 items-center justify-center bg-primary px-4 text-primary-foreground"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
