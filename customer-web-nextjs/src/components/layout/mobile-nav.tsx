'use client';

import { Link } from '@/i18n/routing';
import { ROUTES } from '@/config/routes';
import { useMenuQuery } from '@/modules/site/site.action';
import { useAuthStore } from '@/stores/auth-store';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';
import { useToken } from '@/lib/use-token';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const t = useTranslations();
  const { menus } = useMenuQuery();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const { removeToken } = useToken();

  const handleLogout = () => {
    removeToken();
    logout();
    onClose();
  };

  if (!open) return null;

  const defaultLinks = [
    { href: ROUTES.HOME, label: t('common.home'), icon: Home },
    { href: ROUTES.STORES, label: t('nav.stores'), icon: Store },
    { href: ROUTES.BLOG, label: t('nav.blog'), icon: BookOpen },
    { href: ROUTES.COUPONS, label: t('nav.coupons'), icon: Tag },
    { href: ROUTES.ABOUT, label: t('nav.about'), icon: Info },
    { href: ROUTES.CONTACT, label: t('nav.contact'), icon: Phone },
  ];

  const customerLinks = [
    { href: ROUTES.ORDERS, label: t('order.my_orders'), icon: ShoppingBag },
    { href: ROUTES.WISHLIST, label: t('common.wishlist'), icon: Heart },
    { href: ROUTES.PROFILE, label: t('common.account'), icon: User },
  ];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-background shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
            <span className="text-lg font-semibold">{t('nav.categories')}</span>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-primary-foreground hover:bg-white/15 hover:text-primary-foreground">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {menus.length > 0
                ? menus
                    .filter((m: any) => m.is_visible && m.parent_id === null)
                    .map((menu: any) => (
                      <li key={menu.id}>
                        <Link
                          href={menu.url || '/'}
                          onClick={onClose}
                          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                        >
                          {menu.name}
                        </Link>
                      </li>
                    ))
                : defaultLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                      >
                        <link.icon className="h-4 w-4 text-primary" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
            </ul>

            {/* Customer Links */}
            {isAuthenticated && (
              <>
                <div className="my-4 border-t" />
                <ul className="space-y-1">
                  {customerLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                      >
                        <link.icon className="h-4 w-4 text-primary" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
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
