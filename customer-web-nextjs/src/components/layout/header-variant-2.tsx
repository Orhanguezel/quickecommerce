'use client';

import { Link } from '@/i18n/routing';
import { ROUTES } from '@/config/routes';
import { useSiteInfoQuery, useMenuQuery, useCategoryQuery } from '@/modules/site/site.action';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MobileNav } from './mobile-nav';
import { LanguageSwitcher } from './language-switcher';
import { CurrencySwitcher } from './currency-switcher';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  Mail,
  Phone,
  Grid3X3,
  ChevronDown,
  ChevronRight,
  MapPin,
  Store,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import type { Category, MenuItem } from '@/modules/site/site.type';

/**
 * Header Variant 2 - Classic Theme (Dark)
 * 3-tier layout with dark main bar
 * - Top bar: Email + Free Shipping | Become a Seller + Language + Currency
 * - Main bar (dark): Logo + Location + Categories + Search + Icons + 24/7 Support
 * - Nav bar: All Categories dropdown + Menu + Store Type button
 */
export function HeaderVariant2() {
  const t = useTranslations();
  const locale = useLocale();
  const { siteInfo } = useSiteInfoQuery();
  const { menus } = useMenuQuery();
  const { categories } = useCategoryQuery();
  const totalItems = useCartStore((s) => s.totalItems);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [navCatOpen, setNavCatOpen] = useState(false);
  const [hoveredCatId, setHoveredCatId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const catDropdownRef = useRef<HTMLDivElement>(null);
  const navCatDropdownRef = useRef<HTMLDivElement>(null);

  // Prevent hydration mismatch for cart count (client-only)
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/${locale}${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  // Cart count - only show after client-side mount to prevent hydration mismatch
  const cartCount = mounted ? totalItems() : 0;

  const topCategories = (categories as Category[]).filter(
    (c) => !c.parent_id
  );

  const hoveredCategory = topCategories.find((c) => c.id === hoveredCatId);
  const hoveredChildren = hoveredCategory?.children ?? [];

  return (
    <header className="sticky top-0 z-50 w-full shadow-sm">
      {/* Top Bar - Light Gray */}
      <div className="hidden border-b bg-muted/30 text-foreground lg:block">
        <div className="container flex h-9 items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            {siteInfo?.com_site_email && (
              <a
                href={`mailto:${siteInfo.com_site_email}`}
                className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Email: {siteInfo.com_site_email}</span>
              </a>
            )}
            <span className="flex items-center gap-1.5 text-muted-foreground">
              Free Standard Shipping
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={ROUTES.SELLER_REGISTER}
              className="transition-opacity hover:opacity-70"
            >
              {t('common.become_seller')}
            </Link>
            <LanguageSwitcher />
            <CurrencySwitcher />
          </div>
        </div>
      </div>

      {/* Main Bar - Dark */}
      <div className="border-b bg-slate-800 text-white">
        <div className="container">
          <div className="flex h-16 items-center justify-between gap-3">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-slate-700 lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo */}
            <Link href={ROUTES.HOME} className="flex shrink-0 items-center gap-2">
              {siteInfo?.com_site_logo ? (
                <Image
                  src={siteInfo.com_site_logo}
                  alt={siteInfo?.com_site_title || 'Logo'}
                  width={140}
                  height={40}
                  className="h-10 w-auto object-contain brightness-0 invert"
                  priority
                />
              ) : (
                <span className="text-lg font-bold">{siteInfo?.com_site_title || 'Sporto Online'}</span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden flex-1 items-center gap-3 lg:flex">
              {/* Location Badge */}
              <button className="flex items-center gap-1.5 rounded-md bg-orange-500 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-orange-600">
                <MapPin className="h-3.5 w-3.5" />
                <span>Delivery to</span>
                <span className="font-semibold">Bangladesh, Dhaka</span>
              </button>

              {/* All Categories Dropdown (Main Bar) */}
              <div className="relative" ref={catDropdownRef}>
                <button
                  onClick={() => { setCatOpen(!catOpen); setHoveredCatId(null); }}
                  className="flex items-center gap-2 rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm transition-colors hover:bg-slate-600"
                >
                  <span>{t('nav.all_categories')}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
                </button>

                {catOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setCatOpen(false)} />
                    <div className="absolute left-0 top-full z-50 mt-2 flex rounded-lg border bg-background shadow-lg">
                      {/* Left Panel - Parent Categories */}
                      <div className="w-64 border-r py-2">
                        {topCategories.length > 0 ? (
                          topCategories.slice(0, 14).map((cat) => {
                            const hasChildren = cat.children && cat.children.length > 0;
                            const isHovered = hoveredCatId === cat.id;
                            return (
                              <Link
                                key={cat.id}
                                href={ROUTES.CATEGORY(cat.category_slug)}
                                onClick={() => setCatOpen(false)}
                                onMouseEnter={() => setHoveredCatId(cat.id)}
                                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                  isHovered ? 'bg-muted text-primary' : 'text-foreground hover:bg-muted'
                                }`}
                              >
                                {cat.category_thumb_url ? (
                                  <Image
                                    src={cat.category_thumb_url}
                                    alt={cat.category_name}
                                    width={24}
                                    height={24}
                                    className="h-6 w-6 shrink-0 rounded object-cover"
                                  />
                                ) : (
                                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                                    <Grid3X3 className="h-3.5 w-3.5" />
                                  </div>
                                )}
                                <span className="flex-1">{cat.category_name}</span>
                                {hasChildren && (
                                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                                )}
                              </Link>
                            );
                          })
                        ) : (
                          <div className="px-4 py-3 text-sm text-muted-foreground">
                            {t('common.no_data')}
                          </div>
                        )}
                      </div>

                      {/* Right Panel - Subcategories */}
                      {hoveredChildren.length > 0 && (
                        <div className="w-56 py-2">
                          {hoveredChildren.map((child) => (
                            <Link
                              key={child.id}
                              href={ROUTES.CATEGORY(child.category_slug)}
                              onClick={() => setCatOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted hover:text-primary"
                            >
                              {child.category_thumb_url ? (
                                <Image
                                  src={child.category_thumb_url}
                                  alt={child.category_name}
                                  width={20}
                                  height={20}
                                  className="h-5 w-5 shrink-0 rounded object-cover"
                                />
                              ) : (
                                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                              )}
                              <span>{child.category_name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Search Bar */}
              <form
                onSubmit={handleSearch}
                className="flex max-w-xl flex-1 items-center"
              >
                <Input
                  type="search"
                  placeholder={t('common.search_your_product') || t('common.search') + '...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 rounded-r-none border-slate-600 bg-slate-700 text-white placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                  type="submit"
                  className="h-10 shrink-0 rounded-l-none bg-primary px-4 hover:bg-primary/90"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <LanguageSwitcher />
              </div>

              <Link
                href={ROUTES.WISHLIST}
                className="relative hidden items-center justify-center rounded-full p-2 text-white transition-colors hover:bg-slate-700 sm:flex"
                suppressHydrationWarning
              >
                <Heart className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold">
                  3
                </span>
              </Link>

              <Link
                href={ROUTES.CART}
                className="relative flex items-center justify-center rounded-full p-2 text-white transition-colors hover:bg-slate-700"
                suppressHydrationWarning
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link
                href={isAuthenticated ? ROUTES.PROFILE : ROUTES.LOGIN}
                className="hidden items-center justify-center rounded-full lg:flex"
              >
                <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-600">
                  <User className="h-full w-full p-1.5 text-white" />
                </div>
              </Link>

              {/* 24/7 Support */}
              {siteInfo?.com_site_contact_number && (
                <div className="hidden flex-col items-end lg:flex">
                  <span className="text-[10px] text-slate-400">24/7 Support</span>
                  <a
                    href={`tel:${siteInfo.com_site_contact_number}`}
                    className="text-xs font-semibold text-white transition-opacity hover:opacity-80"
                  >
                    {siteInfo.com_site_contact_number}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar - White */}
      <nav className="hidden border-b bg-background lg:block">
        <div className="container flex h-12 items-center gap-6">
          {/* All Categories Dropdown (Nav Bar) */}
          <div className="relative" ref={navCatDropdownRef}>
            <button
              onClick={() => { setNavCatOpen(!navCatOpen); setHoveredCatId(null); }}
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
            >
              <Grid3X3 className="h-4 w-4" />
              <span>{t('nav.all_categories')}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${navCatOpen ? 'rotate-180' : ''}`} />
            </button>

            {navCatOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNavCatOpen(false)} />
                <div className="absolute left-0 top-full z-50 mt-2 flex rounded-lg border bg-background shadow-lg">
                  {/* Categories dropdown same as above */}
                  <div className="w-64 border-r py-2">
                    {topCategories.length > 0 ? (
                      topCategories.slice(0, 14).map((cat) => {
                        const hasChildren = cat.children && cat.children.length > 0;
                        const isHovered = hoveredCatId === cat.id;
                        return (
                          <Link
                            key={cat.id}
                            href={ROUTES.CATEGORY(cat.category_slug)}
                            onClick={() => setNavCatOpen(false)}
                            onMouseEnter={() => setHoveredCatId(cat.id)}
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                              isHovered ? 'bg-muted text-primary' : 'text-foreground hover:bg-muted'
                            }`}
                          >
                            {cat.category_thumb_url ? (
                              <Image
                                src={cat.category_thumb_url}
                                alt={cat.category_name}
                                width={24}
                                height={24}
                                className="h-6 w-6 shrink-0 rounded object-cover"
                              />
                            ) : (
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                                <Grid3X3 className="h-3.5 w-3.5" />
                              </div>
                            )}
                            <span className="flex-1">{cat.category_name}</span>
                            {hasChildren && (
                              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                          </Link>
                        );
                      })
                    ) : (
                      <div className="px-4 py-3 text-sm text-muted-foreground">
                        {t('common.no_data')}
                      </div>
                    )}
                  </div>

                  {hoveredChildren.length > 0 && (
                    <div className="w-56 py-2">
                      {hoveredChildren.map((child) => (
                        <Link
                          key={child.id}
                          href={ROUTES.CATEGORY(child.category_slug)}
                          onClick={() => setNavCatOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted hover:text-primary"
                        >
                          {child.category_thumb_url ? (
                            <Image
                              src={child.category_thumb_url}
                              alt={child.category_name}
                              width={20}
                              height={20}
                              className="h-5 w-5 shrink-0 rounded object-cover"
                            />
                          ) : (
                            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                          )}
                          <span>{child.category_name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Menu Links */}
          <div className="flex flex-1 items-center gap-5 text-sm font-medium">
            {menus.length > 0 ? (
              menus
                .filter((m: MenuItem) => m.is_visible && m.parent_id === null)
                .map((menu: MenuItem) => (
                  <Link
                    key={menu.id}
                    href={menu.url || '/'}
                    className="text-foreground transition-colors hover:text-primary"
                  >
                    {menu.name}
                  </Link>
                ))
            ) : (
              <>
                <Link href={ROUTES.HOME} className="text-foreground transition-colors hover:text-primary">
                  {t('common.home')}
                </Link>
                <Link href={ROUTES.STORES} className="text-foreground transition-colors hover:text-primary">
                  {t('nav.stores')}
                </Link>
                <Link href={ROUTES.BLOG} className="text-foreground transition-colors hover:text-primary">
                  {t('nav.blog')}
                </Link>
                <Link href={ROUTES.CONTACT} className="text-foreground transition-colors hover:text-primary">
                  {t('nav.contact')}
                </Link>
              </>
            )}
          </div>

          {/* Store Type Button */}
          <Link
            href={ROUTES.STORES}
            className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
          >
            <Store className="h-4 w-4" />
            <span>{t('nav.store_type')}</span>
          </Link>
        </div>
      </nav>

      {/* Search Bar - Mobile */}
      <div className="border-b bg-background px-4 py-2 lg:hidden">
        <form onSubmit={handleSearch} className="relative flex">
          <Input
            type="search"
            placeholder={t('common.search') + '...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            type="submit"
            size="icon"
            className="shrink-0 rounded-l-none bg-primary px-4 text-primary-foreground hover:bg-primary/90"
          >
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
