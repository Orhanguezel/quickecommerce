'use client';

import { Link, useRouter } from '@/i18n/routing';
import { ROUTES } from '@/config/routes';
import { useSiteInfoQuery, useMenuQuery } from '@/modules/site/site.action';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { useLocationStore } from '@/stores/location-store';
import { useTranslations } from 'next-intl';
import { MobileNav } from './mobile-nav';
import { LanguageSwitcher } from './language-switcher';
import { CurrencySwitcher } from '@/components/common/currency-switcher';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  Bell,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import type { MenuItem } from '@/modules/site/site.type';

/**
 * Header Variant 2 - Flutter-matching layout
 * 2-row layout matching Flutter's desktop_tabs_home.dart exactly:
 * - Row 1 (AppBar): White bg, 60px — Logo + Location + Currency + Actions
 * - Row 2 (CommonCard): Tab links (Home/Products/Categories/Menu) + Search widget
 */
export function HeaderVariant2() {
  const t = useTranslations();
  const router = useRouter();
  const { siteInfo } = useSiteInfoQuery();
  const { menus } = useMenuQuery();
  const cartCountLive = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const openCartDrawer = useCartStore((s) => s.openDrawer);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { selectedArea, openSelector } = useLocationStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [logoError, setLogoError] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const cartCount = cartCountLive;

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* ══════════ ROW 1 — AppBar (White, h=60px — matches Flutter AppBar) ══════════ */}
      <div className="border-b bg-card">
        <div className="container flex h-[60px] items-center">
          {/* Mobile hamburger */}
          <button
            className="flex items-center justify-center rounded-lg p-2 text-foreground lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo — Flutter: 90×54, object-fill, padding v6 h10 */}
          <Link href={ROUTES.HOME} className="flex shrink-0 items-center px-2.5 py-1.5">
            {siteInfo?.com_site_logo && !logoError ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={siteInfo.com_site_logo}
                alt={siteInfo?.com_site_title || 'Logo'}
                className="h-[54px] w-[90px] object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-xl font-bold text-primary">
                {siteInfo?.com_site_title || 'Sportoonline'}
              </span>
            )}
          </Link>

          {/* Location selector — Flutter: Expanded > 300px, MapPin + "Location :" bold + muted address */}
          <div className="hidden flex-1 lg:flex">
            <button
              onClick={openSelector}
              className="flex w-[300px] items-center justify-end gap-1 px-2.5 transition-opacity hover:opacity-80"
            >
              <MapPin className="h-4 w-4 shrink-0 text-foreground" />
              <span className="whitespace-nowrap text-base font-bold text-foreground">
                {t('common.location')} :
              </span>
              <span className="ml-1.5 truncate text-base font-normal text-muted-foreground">
                {selectedArea ? selectedArea.label : t('common.get_location')}
              </span>
              <ChevronDown className="h-5 w-5 shrink-0 text-foreground" />
            </button>
          </div>

          {/* Currency dropdown — Flutter: SizedBox(width: 150) */}
          <div className="hidden lg:block" style={{ width: 150 }}>
            <CurrencySwitcher />
          </div>

          {/* Language switcher (not in Flutter but needed for i18n) */}
          <div className="hidden lg:block">
            <LanguageSwitcher />
          </div>

          {/* Action icons — Flutter: actions array in AppBar */}
          <div className="flex items-center">
            {/* Language switcher (mobile only) */}
            <div className="lg:hidden">
              <LanguageSwitcher />
            </div>

            {/* Wishlist — Flutter: ImageIcon 24px, black, padding h2 */}
            <Link href={ROUTES.WISHLIST} className="hidden px-0.5 sm:block">
              <Heart className="h-6 w-6 text-foreground" />
            </Link>
            <div className="w-0.5" />

            {/* Notification — Flutter: ImageIcon 30px, black, padding all 6, red badge 14px */}
            <button className="relative p-1.5">
              <Bell className="h-[30px] w-[30px] text-foreground" />
              <span
                className="absolute right-1.5 top-2 flex items-center justify-center rounded-full bg-red-500 p-0.5"
                style={{ minWidth: 14, minHeight: 14 }}
              >
                <span className="text-[8px] font-bold leading-none text-white">0</span>
              </span>
            </button>
            <div className="w-0.5" />

            {/* Cart — Flutter: 30×30, grey (or blue if on cart page), red badge 16px */}
            <button onClick={openCartDrawer} className="relative">
              <ShoppingCart className="h-[30px] w-[30px] text-muted-foreground" />
              <span
                className="absolute -right-px top-px flex items-center justify-center rounded-full bg-red-500 p-1"
                style={{ minWidth: 16, minHeight: 16 }}
              >
                <span className="text-[10px] font-bold leading-none text-white">{cartCount}</span>
              </span>
            </button>
            <div className="w-2.5" />

            {/* User avatar — Flutter: AvatarWidget radius 20 = 40px diameter circle */}
            <Link
              href={isAuthenticated ? ROUTES.PROFILE : ROUTES.LOGIN}
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-muted"
            >
              <User className="h-5 w-5 text-muted-foreground" />
            </Link>
            <div className="w-5" />
          </div>
        </div>
      </div>

      {/* ══════════ ROW 2 — Menu Tab Bar + Search (Flutter: CommonCard) ══════════ */}
      {/* Flutter: SizedBox(h:6) gap, then CommonCard with pLeft:14 pRight:20 pTop:4 pBottom:4, mH:0 mV:0 */}
      {/* CommonCard: white bg, 8px radius, 1px border dividerColor */}
      <div className="hidden bg-card lg:block">
        <div className="px-0 pt-1.5">
          <div
            className="flex items-center rounded-lg border bg-card py-1"
            style={{ paddingLeft: 14, paddingRight: 20 }}
          >
            <div className="w-3" />

            {/* Tab: Home — Flutter: MenuTab 16px, w600, active=red, inactive=black */}
            <Link
              href={ROUTES.HOME}
              onClick={() => setActiveTab('Home')}
              className={`text-base font-semibold transition-colors duration-300 ${
                activeTab === 'Home' ? 'text-red-500' : 'text-foreground hover:text-red-500'
              }`}
            >
              {t('common.home')}
            </Link>
            <div className="w-3" />

            {/* Tab: Products */}
            <Link
              href={ROUTES.PRODUCTS}
              onClick={() => setActiveTab('Products')}
              className={`text-base font-semibold transition-colors duration-300 ${
                activeTab === 'Products' ? 'text-red-500' : 'text-foreground hover:text-red-500'
              }`}
            >
              {t('seo.products_title')}
            </Link>
            <div className="w-3" />

            {/* Tab: Category */}
            <Link
              href={ROUTES.CATEGORIES}
              onClick={() => setActiveTab('Category')}
              className={`text-base font-semibold transition-colors duration-300 ${
                activeTab === 'Category' ? 'text-red-500' : 'text-foreground hover:text-red-500'
              }`}
            >
              {t('nav.categories')}
            </Link>

            {/* Additional menu links from backend (Stores, Blog, etc.) */}
            {menus.length > 0 &&
              menus
                .filter((m: MenuItem) => m.is_visible && m.parent_id === null)
                .sort((a: MenuItem, b: MenuItem) => a.position - b.position)
                .map((menu: MenuItem) => (
                  <span key={menu.id} className="flex items-center">
                    <div className="w-3" />
                    <Link
                      href={menu.url ? `/${menu.url}` : '/'}
                      className="text-base font-semibold text-foreground transition-colors duration-300 hover:text-red-500"
                    >
                      {menu.name}
                    </Link>
                  </span>
                ))}

            <div className="w-3" />

            {/* Search widget — Flutter: Container 12px radius, grey.shade300 border */}
            {/* Input: 12px, w400, #5A637E | SearchIcon 18px grey | right padding 24px */}
            <form onSubmit={handleSearch} className="flex flex-1">
              <div className="flex w-full items-center rounded-xl border bg-card">
                <div className="w-4" />
                <input
                  type="search"
                  placeholder={t('common.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-none bg-transparent py-2 text-xs font-normal text-muted-foreground outline-none placeholder:text-muted-foreground"
                />
                <Search className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
                <div className="w-6" />
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ══════════ Mobile Search Bar ══════════ */}
      <div className="border-b bg-card px-4 py-2 lg:hidden">
        <form
          onSubmit={handleSearch}
          className="flex items-center overflow-hidden rounded-xl border bg-card"
        >
          <div className="w-4" />
          <input
            type="search"
            placeholder={t('common.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 flex-1 border-none bg-transparent text-xs font-normal text-muted-foreground outline-none placeholder:text-muted-foreground"
          />
          <button type="submit" className="flex shrink-0 items-center justify-center px-4">
            <Search className="h-[18px] w-[18px] text-muted-foreground" />
          </button>
        </form>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
