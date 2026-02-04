'use client';

import LoaderOverlay from '@/components/molecules/LoaderOverlay';
import CategoryTable from '@/components/blocks/admin-section/category/CategoryTable';
import { Button, Card, CardContent, Input } from '@/components/ui';
import { Routes } from '@/config/routes';
import { Layers3 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

function withLocalePath(path: string, locale: string) {
  const p = path.startsWith('/') ? path : `/${path}`;
  const prefix = `/${locale}`;
  if (p === prefix || p.startsWith(`${prefix}/`)) return p;
  return `${prefix}${p}`;
}

const Category = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchButtonClick = () => {
    setSearchValue(searchQuery);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') handleSearchButtonClick();
  };

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isLoading ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isLoading]);

  React.useEffect(() => {
    if (searchQuery.trim() === '') setSearchValue('');
  }, [searchQuery]);

  const addHref = withLocalePath(Routes.addCategory, locale);

  return (
    <>
      <LoaderOverlay isLoading={isLoading} />

      <Card>
        <CardContent className="flex flex-col md:flex-row justify-between p-2 md:p-4">
          <div className="mb-4 md:mb-0">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              <Layers3 /> {t('common.all_category')}
            </h1>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center">
              <Input
                type="text"
                placeholder={t('place_holder.search_by_category')}
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={handleSearchInputChange}
                className="mx-0 lg:mx-2 app-input"
              />
              <Button
                variant="outline"
                onClick={handleSearchButtonClick}
                className="app-button mx-2 lg:mx-0"
              >
                {t('button.search')}
              </Button>
            </div>

            <Link
              href={addHref}
              onClick={(e) => {
                const isNewTab = e.metaKey || e.ctrlKey || (e as any).button === 1;
                if (!isNewTab) setIsLoading(true);
              }}
            >
              <Button variant="outline" className="app-button">
                + {t('button.add_category')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <CategoryTable searchValue={searchValue} />
    </>
  );
};

export default Category;
