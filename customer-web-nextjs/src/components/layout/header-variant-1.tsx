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
  Bell,
  Grid3X3,
  ChevronDown,
  ChevronRight,
  Store,
} from 'lucide-react';
import { useState, useRef } from 'react';
import Image from 'next/image';
import type { Category, MenuItem } from '@/modules/site/site.type';

export function HeaderVariant1() {
  const t = useTranslations();
  const locale = useLocale();
  const { siteInfo } = useSiteInfoQuery();
  const { menus } = useMenuQuery();
  const { categories } = useCategoryQuery();
  const totalItems = useCartStore((s) => s.totalItems);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Theme colors already applied via ThemeProvider (CSS variables)
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [hoveredCatId, setHoveredCatId] = useState<number | null>(null);
  const catDropdownRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/${locale}${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  // Use cart count directly without mounting state
  const cartCount = totalItems();

  const topCategories = (categories as Category[]).filter(
    (c) => !c.parent_id
  );

  const hoveredCategory = topCategories.find((c) => c.id === hoveredCatId);
  const hoveredChildren = hoveredCategory?.children ?? [];

  return (
    <header className="sticky top-0 z-50 w-full shadow-sm">
      {/* Top Bar - Contact & Actions */}
      <div className="hidden bg-primary text-primary-foreground lg:block">
        <div className="container flex h-9 items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            {siteInfo?.com_site_email && (
              <a
                href={`mailto:${siteInfo.com_site_email}`}
                className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Email : {siteInfo.com_site_email}</span>
              </a>
            )}
            {siteInfo?.com_site_contact_number && (
              <a
                href={`tel:${siteInfo.com_site_contact_number}`}
                className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Hotline : {siteInfo.com_site_contact_number}</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={ROUTES.SELLER_REGISTER}
              className="transition-opacity hover:opacity-80"
            >
              {t('common.become_seller')}
            </Link>
            <LanguageSwitcher />
            <CurrencySwitcher />
          </div>
        </div>
      </div>

      {/* Main Bar - Logo, Search, Actions */}
      <div className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
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
                className="h-10 w-auto object-contain"
                priority
              />
            ) : (
              <span className="text-xl font-bold">{siteInfo?.com_site_title || 'Sporto Online'}</span>
            )}
          </Link>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden flex-1 items-center lg:flex lg:max-w-2xl"
          >
            <div className="relative flex w-full">
              <Input
                type="search"
                placeholder={t('common.search') + '...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                type="submit"
                className="shrink-0 gap-2 rounded-l-none bg-primary px-5 text-primary-foreground hover:bg-primary/90"
              >
                <Search className="h-4 w-4" />
                <span className="text-sm font-medium">{t('common.search')}</span>
              </Button>
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <div className="lg:hidden">
              <LanguageSwitcher />
            </div>

            <button className="hidden items-center justify-center rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground lg:flex">
              <Bell className="h-5 w-5" />
            </button>

            <Link
              href={ROUTES.WISHLIST}
              className="hidden items-center justify-center rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              <Heart className="h-5 w-5" />
            </Link>

            <Link
              href={ROUTES.CART}
              className="relative flex items-center justify-center rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              href={isAuthenticated ? ROUTES.PROFILE : ROUTES.LOGIN}
              className="flex items-center justify-center rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <User className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Bar - Desktop (White bg + All Categories dropdown + menu links) */}
      <nav className="hidden border-b bg-background lg:block">
        <div className="container flex h-12 items-center gap-6">
          {/* All Categories Mega Dropdown */}
          <div className="relative" ref={catDropdownRef}>
            <button
              onClick={() => { setCatOpen(!catOpen); setHoveredCatId(null); }}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Grid3X3 className="h-4 w-4" />
              <span>{t('nav.all_categories')}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
            </button>

            {catOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setCatOpen(false)} />
                <div className="absolute left-0 top-full z-50 mt-1 flex rounded-lg border bg-background shadow-lg">
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

                  {/* Right Panel - Subcategories (on hover) */}
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

          {/* Menu Links */}
          <div className="flex flex-1 items-center gap-5 text-sm font-medium">
            {menus.length > 0 ? (
              menus
                .filter((m: MenuItem) => m.is_visible && m.parent_id === null)
                .sort((a: MenuItem, b: MenuItem) => a.position - b.position)
                .map((menu: MenuItem) => {
                  const hasChildren = menu.childrenRecursive && menu.childrenRecursive.length > 0;

                  if (hasChildren) {
                    return (
                      <div key={menu.id} className="relative group">
                        <button className="flex items-center gap-1.5 text-foreground transition-colors hover:text-primary">
                          <span>{menu.name}</span>
                          <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                        </button>

                        {/* Dropdown */}
                        <div className="absolute left-0 top-full z-50 mt-1 hidden w-56 rounded-lg border bg-background py-2 shadow-lg group-hover:block">
                          {menu.childrenRecursive
                            .filter((child: MenuItem) => child.is_visible)
                            .sort((a: MenuItem, b: MenuItem) => a.position - b.position)
                            .map((child: MenuItem) => (
                              <Link
                                key={child.id}
                                href={`/${locale}/${child.url}`}
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
                      href={menu.url ? `/${locale}/${menu.url}` : '/'}
                      className="text-foreground transition-colors hover:text-primary"
                    >
                      {menu.name}
                    </Link>
                  );
                })
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
                <Link href={ROUTES.COUPONS} className="text-foreground transition-colors hover:text-primary">
                  {t('nav.coupons')}
                </Link>
                <Link href={ROUTES.ABOUT} className="text-foreground transition-colors hover:text-primary">
                  {t('nav.about')}
                </Link>
                <Link href={ROUTES.CONTACT} className="text-foreground transition-colors hover:text-primary">
                  {t('nav.contact')}
                </Link>
              </>
            )}
          </div>

          {/* Explore Store Types Button */}
          <Link
            href={ROUTES.STORES}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Store className="h-4 w-4" />
            <span>{t('nav.explore_store_types')}</span>
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