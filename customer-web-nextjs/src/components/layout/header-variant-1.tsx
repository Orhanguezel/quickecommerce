'use client';

import { Link, useRouter } from '@/i18n/routing';
import { ROUTES } from '@/config/routes';
import { useSiteInfoQuery, useMenuQuery, useCategoryQuery } from '@/modules/site/site.action';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { useLocationStore } from '@/stores/location-store';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { MobileNav } from './mobile-nav';
import { LanguageSwitcher } from './language-switcher';
import { CurrencySwitcher } from '@/components/common/currency-switcher';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  Mail,
  Phone,
  Moon,
  Sun,
  Grid3X3,
  ChevronDown,
  ChevronRight,
  Store,
  MapPin,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import type { Category, MenuItem } from '@/modules/site/site.type';

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
  const { selectedArea, openSelector } = useLocationStore();

  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [hoveredCatId, setHoveredCatId] = useState<number | null>(null);
  const [hoveredFlyoutTop, setHoveredFlyoutTop] = useState(0);
  const [hoveredFlyoutMaxHeight, setHoveredFlyoutMaxHeight] = useState(0);
  const [logoError, setLogoError] = useState(false);
  const catDropdownRef = useRef<HTMLDivElement>(null);
  const catListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const cartCount = cartCountLive;

  // Build category tree: hide entries with no products and no valid child.
  // If parent has no direct product but has valid child, keep parent visible.
  const allCats = categories as Category[];
  const getChildren = (parentId: number) =>
    allCats.filter((c) => Number(c.parent_id) === Number(parentId));
  const hasDirectProducts = (cat: Category) => Number(cat.product_count || 0) > 0;

  const topCategories = allCats
    .filter((c) => c.parent_id === null)
    .filter((parent) => {
      if (hasDirectProducts(parent)) return true;
      return getChildren(parent.id).some((child) => hasDirectProducts(child));
    });

  const getRenderableChildren = (parentId: number) =>
    getChildren(parentId).filter((child) => hasDirectProducts(child));

  const hoveredChildren = hoveredCatId ? getRenderableChildren(hoveredCatId) : [];

  const updateFlyoutTop = (catId: number) => {
    const listEl = catListRef.current;
    if (!listEl) return;
    const rowEl = listEl.querySelector(`[data-cat-id="${catId}"]`) as HTMLElement | null;
    if (!rowEl) return;

    const rowRect = rowEl.getBoundingClientRect();
    const container = listEl.parentElement!;
    const containerRect = container.getBoundingClientRect();
    const viewportBottomPadding = 12;
    const minFlyoutHeight = 180;
    // Ideal: align flyout top exactly with the hovered row
    let flyoutTop = rowRect.top - containerRect.top;
    // How much space is available below the row's top in the viewport
    const spaceBelow = window.innerHeight - rowRect.top - viewportBottomPadding;
    // Only shift up if there's not enough space for at least minFlyoutHeight
    if (spaceBelow < minFlyoutHeight) {
      flyoutTop = Math.max(0, flyoutTop - (minFlyoutHeight - spaceBelow));
    }
    const clampedTop = flyoutTop;
    // Max height = space from the flyout's actual top to viewport bottom
    const flyoutMaxHeight = Math.max(minFlyoutHeight, window.innerHeight - (containerRect.top + clampedTop) - viewportBottomPadding);

    setHoveredFlyoutMaxHeight(flyoutMaxHeight);
    setHoveredFlyoutTop(clampedTop);
  };

  return (
    <>
      {/* ══════════ Sticky: ROW 1 + ROW 2 ══════════ */}
      <div
        className="sticky z-50 w-full shadow-sm"
        style={{ top: "var(--theme-popup-top-offset, 0px)" }}
      >
      {/* ══════════ ROW 1 — Top Bar (Dynamic from theme) ══════════ */}
      <div className="hidden lg:block" style={{ backgroundColor: 'hsl(var(--header-topbar-bg))', color: 'hsl(var(--header-topbar-text))' }}>
        <div className="container flex h-11 items-center justify-between text-sm font-medium">
          {/* Left — Email | Hotline */}
          <div className="flex items-center gap-3">
            {siteInfo?.com_site_email && (
              <a
                href={`mailto:${siteInfo.com_site_email}`}
                className="flex items-center gap-2 transition-opacity hover:opacity-80"
              >
                <Mail className="h-4 w-4" />
                <span>{t("email_label")} : {siteInfo.com_site_email}</span>
              </a>
            )}
            {siteInfo?.com_site_email && siteInfo?.com_site_contact_number && (
              <span className="mx-1.5 opacity-60">|</span>
            )}
            {siteInfo?.com_site_contact_number && (
              <a
                href={`tel:${siteInfo.com_site_contact_number}`}
                className="flex items-center gap-2 transition-opacity hover:opacity-80"
              >
                <Phone className="h-4 w-4" />
                <span>{t("hotline_label")} : {siteInfo.com_site_contact_number}</span>
              </a>
            )}
          </div>

          {/* Right — Theme Toggle + Language + Currency */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent transition-all hover:border-white/40"
              aria-label={t("toggle_theme")}
            >
              {mounted ? (
                theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
            <LanguageSwitcher />
            <CurrencySwitcher />
          </div>
        </div>
      </div>

      {/* ══════════ ROW 2 — Main Bar (Dynamic from theme) ══════════ */}
      <div className="border-b shadow-sm" style={{ backgroundColor: 'hsl(var(--header-main-bg))' }}>
        <div className="container flex h-[100px] items-center gap-6">
          {/* Mobile hamburger */}
          <button
            className="flex items-center justify-center rounded-lg p-2 text-foreground lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex shrink-0 items-center">
            {siteInfo?.com_site_logo && !logoError ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={siteInfo.com_site_logo}
                alt={siteInfo?.com_site_title || 'Logo'}
                className="h-16 w-auto object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-[28px] font-bold text-primary">
                {siteInfo?.com_site_title || 'Sportoonline'}
              </span>
            )}
          </Link>

          {/* Location Selector Pill */}
          <button
            onClick={openSelector}
            className="hidden items-center gap-2.5 rounded-full border border-border bg-background/50 px-6 py-3 text-[15px] transition-colors hover:border-primary/40 lg:flex"
          >
            <MapPin className="h-5 w-5 text-primary" />
            <span className={selectedArea ? "font-medium text-foreground" : "text-foreground"}>
              {selectedArea ? selectedArea.label : t('common.select_location')}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Search Bar — wide */}
          <form onSubmit={handleSearch} className="hidden flex-1 lg:flex">
            <div className="flex w-full overflow-hidden rounded-lg border border-border bg-background/50 transition-colors focus-within:border-primary">
              <input
                type="search"
                placeholder={t('common.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 flex-1 border-none bg-transparent px-5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="flex shrink-0 items-center gap-2 bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {t('common.search')}
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {/* Language switcher (mobile only) */}
            <div className="lg:hidden">
              <LanguageSwitcher />
            </div>

            {/* Wishlist */}
            <Link
              href={ROUTES.WISHLIST}
              className="hidden h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground sm:flex"
            >
              <Heart className="h-5 w-5" strokeWidth={1.5} />
            </Link>

            {/* Cart — always show badge */}
            <button
              onClick={openCartDrawer}
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
            >
              <ShoppingCart className="h-5 w-5" strokeWidth={1.5} />
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            </button>

            {/* User / Profile */}
            <Link
              href={isAuthenticated ? ROUTES.PROFILE : ROUTES.LOGIN}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
            >
              <User className="h-5 w-5" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </div>
      {/* ══════════ ROW 3 — Navigation Bar (Dynamic from theme) ══════════ */}
      <nav className="hidden border-b lg:block" style={{ backgroundColor: 'hsl(var(--header-nav-bg))' }}>
        <div className="container flex h-[72px] items-center gap-8">
          {/* All Categories — button */}
          <div className="relative" ref={catDropdownRef}>
            <button
              onClick={() => { setCatOpen(!catOpen); setHoveredCatId(null); }}
              className="flex items-center gap-3 rounded-lg px-7 py-4 text-base font-semibold transition-colors"
              style={{ backgroundColor: 'hsl(var(--header-nav-button-bg))', color: 'hsl(var(--header-nav-button-text))' }}
            >
              <Grid3X3 className="h-[18px] w-[18px]" />
              <span>{t('nav.all_categories')}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
            </button>

            {catOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setCatOpen(false)} />
                <div
                  className="absolute left-0 top-full z-50 mt-2 rounded-xl border bg-background shadow-xl"
                  onMouseLeave={() => setHoveredCatId(null)}
                >
                  <div className="relative w-[340px] py-2">
                    <div
                      ref={catListRef}
                      className="filter-sidebar-scroll max-h-[70vh] overflow-y-auto"
                      onScroll={() => {
                        if (hoveredCatId) updateFlyoutTop(hoveredCatId);
                      }}
                    >
                      {topCategories.length > 0 ? (
                        topCategories.map((cat) => {
                          const renderableChildren = getRenderableChildren(cat.id);
                          const hasChildren = renderableChildren.length > 0;
                          const isHovered = hoveredCatId === cat.id;
                          const targetSlug =
                            hasDirectProducts(cat)
                              ? cat.category_slug
                              : hasChildren
                                ? renderableChildren[0].category_slug
                                : cat.category_slug;
                          return (
                            <div
                              key={cat.id}
                              data-cat-id={cat.id}
                              className="relative"
                              onMouseEnter={() => {
                                setHoveredCatId(cat.id);
                                updateFlyoutTop(cat.id);
                              }}
                            >
                              <Link
                                href={ROUTES.CATEGORY(targetSlug)}
                                onClick={() => setCatOpen(false)}
                                className={`flex items-center gap-4 px-6 py-4 text-base transition-colors ${
                                  isHovered ? 'bg-primary/5 text-primary' : 'text-foreground hover:bg-muted'
                                }`}
                              >
                                {cat.category_thumb_url ? (
                                  <Image
                                    src={cat.category_thumb_url}
                                    alt={cat.category_name}
                                    width={32}
                                    height={32}
                                    className="h-8 w-8 shrink-0 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                    <Grid3X3 className="h-4 w-4" />
                                  </div>
                                )}
                                <span className="min-w-0 flex-1 truncate font-medium">{cat.category_name}</span>
                                {hasChildren && (
                                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                                )}
                              </Link>
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-5 py-4 text-sm text-muted-foreground">
                          {t('common.no_data')}
                        </div>
                      )}
                    </div>

                    {hoveredCatId && hoveredChildren.length > 0 && (
                      <div
                        className="filter-sidebar-scroll absolute left-full z-[70] min-w-[280px] overflow-y-auto rounded-r-xl border border-l-0 bg-background py-2 shadow-xl"
                        style={{ top: hoveredFlyoutTop, maxHeight: hoveredFlyoutMaxHeight || undefined }}
                      >
                        {hoveredChildren.map((child) => (
                          <Link
                            key={child.id}
                            href={ROUTES.CATEGORY(child.category_slug)}
                            onClick={() => setCatOpen(false)}
                            className="flex items-center gap-4 px-6 py-4 text-base text-foreground transition-colors hover:bg-primary/5 hover:text-primary"
                          >
                            {child.category_thumb_url ? (
                              <Image
                                src={child.category_thumb_url}
                                alt={child.category_name}
                                width={28}
                                height={28}
                                className="h-7 w-7 shrink-0 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <Grid3X3 className="h-3.5 w-3.5" />
                              </div>
                            )}
                            <span className="min-w-0 truncate">{child.category_name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Menu Links — centered, wider spacing */}
          <div className="flex flex-1 items-center justify-center gap-12 text-[17px] font-semibold">
            {menus.length > 0 ? (
              menus
                .filter((m: MenuItem) => m.is_visible && m.parent_id === null)
                .sort((a: MenuItem, b: MenuItem) => a.position - b.position)
                .map((menu: MenuItem) => {
                  const hasChildren = menu.childrenRecursive && menu.childrenRecursive.length > 0;

                  if (hasChildren) {
                    return (
                      <div key={menu.id} className="group relative">
                        <button className="flex items-center gap-1.5 transition-colors hover:opacity-80" style={{ color: 'hsl(var(--header-nav-text))' }}>
                          <span>{menu.name}</span>
                          <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                        </button>
                        <div className="absolute left-0 top-full z-50 mt-1 hidden w-56 rounded-lg border bg-background py-2 shadow-lg group-hover:block">
                          {menu.childrenRecursive
                            .filter((child: MenuItem) => child.is_visible)
                            .sort((a: MenuItem, b: MenuItem) => a.position - b.position)
                            .map((child: MenuItem) => (
                              <Link
                                key={child.id}
                                href={child.url ? `/${child.url}` : '/'}
                                className="block px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted hover:text-primary"
                              >
                                {child.name}
                              </Link>
                            ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={menu.id}
                      href={menu.url ? `/${menu.url}` : '/'}
                      className="transition-colors hover:opacity-80"
                      style={{ color: 'hsl(var(--header-nav-text))' }}
                    >
                      {menu.name}
                    </Link>
                  );
                })
            ) : (
              <>
                <Link href={ROUTES.HOME} className="transition-colors hover:opacity-80" style={{ color: 'hsl(var(--header-nav-text))' }}>
                  {t('common.home')}
                </Link>
                <Link href={ROUTES.STORES} className="transition-colors hover:opacity-80" style={{ color: 'hsl(var(--header-nav-text))' }}>
                  {t('nav.stores')}
                </Link>
                <Link href={ROUTES.BLOG} className="transition-colors hover:opacity-80" style={{ color: 'hsl(var(--header-nav-text))' }}>
                  {t('nav.blog')}
                </Link>
                <Link href={ROUTES.COUPONS} className="transition-colors hover:opacity-80" style={{ color: 'hsl(var(--header-nav-text))' }}>
                  {t('nav.coupons')}
                </Link>
                <Link href={ROUTES.ABOUT} className="transition-colors hover:opacity-80" style={{ color: 'hsl(var(--header-nav-text))' }}>
                  {t('nav.about')}
                </Link>
                <Link href={ROUTES.CONTACT} className="transition-colors hover:opacity-80" style={{ color: 'hsl(var(--header-nav-text))' }}>
                  {t('nav.contact')}
                </Link>
              </>
            )}
          </div>

          {/* Explore Store Types — button */}
          <Link
            href={ROUTES.STORES}
            className="flex items-center gap-3 rounded-lg px-7 py-3.5 text-[15px] font-semibold transition-colors hover:opacity-90"
            style={{ backgroundColor: 'hsl(var(--header-nav-button-bg))', color: 'hsl(var(--header-nav-button-text))' }}
          >
            <Store className="h-4 w-4" />
            <span>{t('nav.explore_store_types')}</span>
          </Link>
        </div>
      </nav>
      </div>{/* end sticky wrapper */}

      {/* ══════════ Mobile Search Bar ══════════ */}
      <div className="border-b bg-background px-4 py-2 lg:hidden">
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
            className="flex shrink-0 items-center justify-center bg-primary px-4 text-primary-foreground"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
