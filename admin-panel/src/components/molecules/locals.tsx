'use client';

import { useLocale } from 'next-intl';

const localeRTLList = ['ar', 'he'];

export function useIsRTL() {
  const locale = useLocale();
  if (localeRTLList.includes(locale)) {
    return { isRTL: true, alignLeft: 'right', alignRight: 'left' };
  }
  return { isRTL: false, alignLeft: 'left', alignRight: 'right' };
}

export let languageMenu = [
  {
    id: 'en',
    name: 'English',
    value: 'en',
    icon: 'https://ipgeolocation.io/static/flags/us_64.png',
  },
  {
    id: 'tr',
    name: 'Türkçe',
    value: 'tr',
    icon: 'https://ipgeolocation.io/static/flags/tr_64.png',
  },
];
