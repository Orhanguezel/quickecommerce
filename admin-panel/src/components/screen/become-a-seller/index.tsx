'use client';
import BecomeASeller from '@/components/blocks/become-a-seller/BecomeASeller';
import BecomeASellerThemeTwo from '@/components/blocks/become-a-seller/BecomeASellerThemeTwo';
import LoaderOverlay from '@/components/molecules/LoaderOverlay';
import { useGeneralQuery } from '@/modules/common/com/com.action';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { SellerRoutes } from '@/config/sellerRoutes';
import { AUTH_TOKEN_KEY, AUTH_USER } from '@/lib/constants';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Loader from '@/components/molecules/Loader';

const BecaomeASellerIndex = () => {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const localeMain = useLocale();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = Cookies.get(AUTH_TOKEN_KEY);
    const authUser = Cookies.get(AUTH_USER);
    if (token && authUser == 'store_level') {
      router.replace(SellerRoutes.dashboard);
    } else if (token && authUser == 'system_level') {
      Cookies.remove(AUTH_TOKEN_KEY);
      Cookies.remove(AUTH_USER);
      setCheckingAuth(false);
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  const { general, refetch: generalRefetch } = useGeneralQuery({
    language: localeMain,
  });
  const originalDataGeneral = useMemo(() => {
    const data = (general as any) || {};
    return data;
  }, [general]);

  const GeneralData = originalDataGeneral.site_settings;

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isLoading]);

  if (checkingAuth) {
    return (
      <div>
        <Loader customClass="mt-64" size="large" />
      </div>
    );
  }

  return (
    <>
      <LoaderOverlay isLoading={isLoading} />
      {GeneralData?.active_theme == 'theme_one' ? <BecomeASeller /> : <BecomeASellerThemeTwo />}
    </>
  );
};

export default BecaomeASellerIndex;
