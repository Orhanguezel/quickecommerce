'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const toggleLocale = () => {
    const newLocale = locale === 'tr' ? 'en' : 'tr';
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLocale}
      title={locale === 'tr' ? 'English' : 'Türkçe'}
    >
      <Globe className="h-5 w-5" />
    </Button>
  );
}
