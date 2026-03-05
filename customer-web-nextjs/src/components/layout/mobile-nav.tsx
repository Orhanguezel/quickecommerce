'use client';

import { Link } from '@/i18n/routing';
import { ROUTES } from '@/config/routes';
import { useMenuQuery } from '@/modules/site/site.action';
import { useAuthStore } from '@/stores/auth-store';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { CurrencySwitcher } from '@/components/common/currency-switcher';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import {
  X,
  Home,
  ShoppingBag,
  Heart,
  User,
  BookOpen,
  Tag,
  Info,
  Phone,
  Store,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useToken } from '@/lib/use-token';
import { useState } from 'react';
import type { MenuItem } from '@/modules/site/site.type';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

interface DefaultLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const t = useTranslations();
  const { menus } = useMenuQuery();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const { removeToken } = useToken();
  const [expandedMenus, setExpandedMenus] = useState<number[]>([]);

  const handleLogout = () => {
    removeToken();
    logout();
    onClose();
  };

  if (!open) return null;

  const toMenuHref = (url?: string) => {
    if (!url) return '/';
    return url.startsWith('/') ? url : `/${url}`;
  };

  const toggleMenu = (menuId: number) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
    );
  };

  const defaultLinks: DefaultLink[] = [
    { href: ROUTES.HOME, label: t('common.home'), icon: Home },
    { href: ROUTES.STORES, label: t('nav.stores'), icon: Store },
    { href: ROUTES.BLOG, label: t('nav.blog'), icon: BookOpen },
    { href: ROUTES.COUPONS, label: t('nav.coupons'), icon: Tag },
    { href: ROUTES.ABOUT, label: t('nav.about'), icon: Info },
    { href: ROUTES.CONTACT, label: t('nav.contact'), icon: Phone },
    { href: ROUTES.SELLER_REGISTER, label: t('common.become_seller'), icon: Store },
  ];

  const customerLinks: DefaultLink[] = [
    { href: ROUTES.ORDERS, label: t('order.my_orders'), icon: ShoppingBag },
    { href: ROUTES.WISHLIST, label: t('common.wishlist'), icon: Heart },
    { href: ROUTES.PROFILE, label: t('common.account'), icon: User },
  ];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 w-[86vw] max-w-sm bg-background shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between bg-primary px-5 py-4 text-primary-foreground">
            <span className="text-lg font-semibold">{t('nav.categories')}</span>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-primary-foreground hover:bg-white/15 hover:text-primary-foreground">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Locale + Currency controls */}
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <LanguageSwitcher />
            <CurrencySwitcher />
          </div>

          {/* Links */}
          <nav className="flex-1 overflow-y-auto p-5">
            <ul className="space-y-2">
              {menus.length > 0
                ? menus
                    .filter((m: MenuItem) => m.is_visible && m.parent_id === null)
                    .sort((a: MenuItem, b: MenuItem) => a.position - b.position)
                    .map((menu: MenuItem) => (
                      <li key={menu.id}>
                        {menu.childrenRecursive && menu.childrenRecursive.length > 0 ? (
                          <>
                            <button
                              type="button"
                              onClick={() => toggleMenu(menu.id)}
                              className="flex w-full items-center justify-between rounded-md px-4 py-3 text-left text-base font-medium transition-colors hover:bg-accent"
                            >
                              <span>{menu.name}</span>
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${
                                  expandedMenus.includes(menu.id) ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                            {expandedMenus.includes(menu.id) && (
                              <ul className="mt-1 space-y-1 pl-3">
                                {menu.childrenRecursive
                                  .filter((child: MenuItem) => child.is_visible)
                                  .sort((a: MenuItem, b: MenuItem) => a.position - b.position)
                                  .map((child: MenuItem) => (
                                    <li key={child.id}>
                                      <Link
                                        href={toMenuHref(child.url)}
                                        onClick={onClose}
                                        className="flex items-center rounded-md px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                      >
                                        {child.name}
                                      </Link>
                                    </li>
                                  ))}
                              </ul>
                            )}
                          </>
                        ) : (
                          <Link
                            href={toMenuHref(menu.url)}
                            onClick={onClose}
                            className="flex items-center gap-3 rounded-md px-4 py-3 text-base transition-colors hover:bg-accent"
                          >
                            {menu.name}
                          </Link>
                        )}
                      </li>
                    ))
                : defaultLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-md px-4 py-3 text-base transition-colors hover:bg-accent"
                      >
                        <link.icon className="h-[18px] w-[18px] text-primary" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
            </ul>

            {menus.length > 0 && (
              <>
                <div className="my-4 border-t" />
                <ul className="space-y-2">
                  <li>
                    <Link
                      href={ROUTES.SELLER_REGISTER}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-md px-4 py-3 text-base font-medium transition-colors hover:bg-accent"
                    >
                      <Store className="h-[18px] w-[18px] text-primary" />
                      {t('common.become_seller')}
                    </Link>
                  </li>
                </ul>
              </>
            )}

            {/* Customer Links */}
            {isAuthenticated && (
              <>
                <div className="my-4 border-t" />
                <ul className="space-y-2">
                  {customerLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-md px-4 py-3 text-base transition-colors hover:bg-accent"
                      >
                        <link.icon className="h-[18px] w-[18px] text-primary" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-base text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="h-[18px] w-[18px]" />
                      {t('common.logout')}
                    </button>
                  </li>
                </ul>
              </>
            )}

            {!isAuthenticated && (
              <>
                <div className="my-4 border-t" />
                <div className="flex flex-col gap-2 px-3">
                  <Button asChild>
                    <Link href={ROUTES.LOGIN} onClick={onClose}>
                      {t('common.login')}
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={ROUTES.REGISTER} onClick={onClose}>
                      {t('common.register')}
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
