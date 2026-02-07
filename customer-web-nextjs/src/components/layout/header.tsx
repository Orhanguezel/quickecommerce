'use client';

import { Link } from '@/i18n/routing';
import { ROUTES } from '@/config/routes';
import { useSiteInfoQuery, useMenuQuery } from '@/modules/site/site.action';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MobileNav } from './mobile-nav';
import { LanguageSwitcher } from './language-switcher';
import { Search, ShoppingCart, Heart, User, Menu } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const { siteInfo } = useSiteInfoQuery();
  const { menus } = useMenuQuery();
  const totalItems = useCartStore((s) => s.totalItems);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/${locale}${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Bar */}
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
          className="hidden flex-1 items-center gap-2 lg:flex lg:max-w-xl"
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('common.search') + '...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          <LanguageSwitcher />

          {/* Wishlist */}
          <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
            <Link href={ROUTES.WISHLIST}>
              <Heart className="h-5 w-5" />
            </Link>
          </Button>

          {/* Cart */}
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href={ROUTES.CART}>
              <ShoppingCart className="h-5 w-5" />
              {totalItems() > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-[10px]">
                  {totalItems()}
                </Badge>
              )}
            </Link>
          </Button>

          {/* User */}
          <Button variant="ghost" size="icon" asChild>
            <Link href={isAuthenticated ? ROUTES.PROFILE : ROUTES.LOGIN}>
              <User className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Navigation Bar - Desktop */}
      <nav className="hidden border-t lg:block">
        <div className="container flex h-10 items-center gap-6 text-sm">
          {menus.length > 0 ? (
            menus
              .filter((m: any) => m.is_visible && m.parent_id === null)
              .map((menu: any) => (
                <Link
                  key={menu.id}
                  href={menu.url || '/'}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {menu.name}
                </Link>
              ))
          ) : (
            <>
              <Link
                href={ROUTES.HOME}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {t('common.home')}
              </Link>
              <Link
                href={ROUTES.STORES}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {t('nav.stores')}
              </Link>
              <Link
                href={ROUTES.BLOG}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {t('nav.blog')}
              </Link>
              <Link
                href={ROUTES.COUPONS}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {t('nav.coupons')}
              </Link>
              <Link
                href={ROUTES.ABOUT}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {t('nav.about')}
              </Link>
              <Link
                href={ROUTES.CONTACT}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {t('nav.contact')}
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Search Bar - Mobile */}
      <div className="border-t px-4 py-2 lg:hidden">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('common.search') + '...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </form>
      </div>

      {/* Mobile Navigation Sheet */}
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
