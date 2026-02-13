'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, ChevronDown } from 'lucide-react';

const languages = [
  { code: 'tr', flag: '🇹🇷' },
  { code: 'en', flag: '🇬🇧' },
] as const;

export function LanguageSwitcher() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();

  const currentLanguage = languages.find((lang) => lang.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-xs font-medium"
        >
          <span>{currentLanguage ? t(`lang_${currentLanguage.code}` as "lang_tr" | "lang_en") : ''}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        {languages.map((lang) => (
          <Link
            key={lang.code}
            href={pathname}
            locale={lang.code}
            className="flex w-full cursor-pointer items-center px-2 py-1.5 text-sm transition-colors hover:bg-accent"
          >
            <span className="mr-2">{lang.flag}</span>
            <span className="flex-1">{t(`lang_${lang.code}` as "lang_tr" | "lang_en")}</span>
            {locale === lang.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
