'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SignInForm from '@/components/molecules/forms/sign-in';
import { PublicNavbar } from '@/components/blocks/shared/PublicNavbar';
import { AUTH_TOKEN_KEY, AUTH_USER } from '@/lib/constants';
import Cookies from 'js-cookie';
import Loader from '@/components/molecules/Loader';
import { Routes } from '@/config/routes';
import { PublicNavbarSkeleton } from '@/components/molecules/PublicNavbarSkeleton';
import { SignInFormSkeleton } from '@/components/molecules/SignInFormSkeleton';

const SignInPage = () => {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = Cookies.get(AUTH_TOKEN_KEY);
    const authUser = Cookies.get(AUTH_USER);

    if (token && authUser == 'system_level') {
      router.replace(Routes.dashboard);
    } else if (token && authUser == 'store_level') {
      Cookies.remove(AUTH_TOKEN_KEY);
      Cookies.remove(AUTH_USER);
      setCheckingAuth(false);
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  if (checkingAuth) {
    return (
      <div>
        <PublicNavbarSkeleton />
        <SignInFormSkeleton />
      </div>
    );
  }

  return (
    <>
      <PublicNavbar />
      <SignInForm />
    </>
  );
};

export default SignInPage;
