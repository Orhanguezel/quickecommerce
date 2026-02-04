import {useLocale, useTranslations} from 'next-intl';
import {Link} from '@/routing';

export default function LocaleSwitcher() {
  const t = useTranslations('menu');

  const locale = useLocale();
  const otherLocale = locale === 'tr' ? 'en' : 'tr';

  return (
    <Link href="/" locale={otherLocale}>
      {t('main', {locale: otherLocale})}
    </Link>
  );
}
