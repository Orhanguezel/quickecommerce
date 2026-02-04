'use client';
import { Routes } from '@/config/routes';
import { SellerRoutes } from '@/config/sellerRoutes';
import { API_ENDPOINTS } from '@/endpoints/AdminApiEndPoints';
import { SELLER_API_ENDPOINTS } from '@/endpoints/SellerApiEndPoints';
import { setAuthCredentials } from '@/lib/auth-utils';
import { authorizationAtom } from '@/lib/authorization-atom';
import { AUTH_TOKEN_KEY, AUTH_USER } from '@/lib/constants';
import { useToken } from '@/lib/use-token';
import {
  type ChangePasswordInput,
  type ForgetPasswordInput,
  type LoginInput,
  type ResetPasswordInput,
  type SignUpInput,
  type TokenInput,
} from '@/modules/users/users.schema';
import {
  useChangePasswordService,
  useForgotPasswordService,
  useGetPermissionsService,
  useLoginService,
  useMeService,
  useOTPService,
  useResendVerificationEmailService,
  useResetChangePasswordService,
  useResetPasswordService,
  useSendVerificationEmailService,
  useStoreOwnerLoginService,
  useUserService,
  useVerifyEmailService,
  useVerifyResetPasswordService,
} from '@/modules/users/users.service';
import { useAppDispatch } from '@/redux/hooks';
import { setRefetch } from '@/redux/slices/refetchSlice';
import { setSelectedStore } from '@/redux/slices/storeSlice';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { UsersQueryOptions } from './users.type';

export const useRegisterMutation = ({ isRedirect = true }: { isRedirect?: boolean }) => {
  const queryClient = useQueryClient();
  const { setToken } = useToken();
  const router = useRouter();
  const userService = useUserService(); // Use the hook
  const [_, setAuthorized] = useAtom(authorizationAtom);

  return useMutation({
    mutationFn: (values: SignUpInput) => userService.create(values),
    mutationKey: [API_ENDPOINTS.STORE_OWNER_REGISTER],
    onSuccess: async (data) => {
      if (!data.data?.token) {
        toast.error('Wrong Credentials!');
        return;
      }
      toast.success('User Register Successfully');
      setToken(data?.data?.token);
      setAuthCredentials(data?.data?.token, data?.data?.permissions);
      setAuthorized(true);
      localStorage.setItem(
        'email_verification_settings',
        data?.data?.email_verification_settings.toString(),
      );
      localStorage.setItem('email_verified', data?.data?.email_verified.toString());
      localStorage.setItem('user_email', data?.data?.email);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      if (errorText && typeof errorText === 'object') {
        Object.entries(errorText).forEach(([key, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(msg));
          } else if (typeof messages === 'string') {
            toast.error(messages);
          }
        });
      } else {
        toast.error(errorText?.message);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS?.STORE_OWNER_REGISTER],
      });
    },
  });
};

export const useLogin = ({ isRedirect = true }: { isRedirect?: boolean }) => {
  const queryClient = useQueryClient();
  const { setToken } = useToken();
  const router = useRouter();
  const loginService = useLoginService();

  const [_, setAuthorized] = useAtom(authorizationAtom);
  return useMutation({
    mutationFn: (values: LoginInput) => loginService.create(values),
    mutationKey: [API_ENDPOINTS.USERS_LOGIN],
    onSuccess: async (data) => {
      if (!data.data?.token) {
        toast.error('Wrong Credentials!');
        return;
      }
      toast.success(data?.data?.message);
      const { token, expires_at, permissions } = data.data;
      Cookies.set(AUTH_TOKEN_KEY, token);
      Cookies.set(AUTH_USER, 'system_level');
      localStorage.setItem('expires_at', expires_at);
      setToken(data?.data?.token);
      setAuthCredentials(data?.data?.token, data?.data?.permissions);
      setAuthorized(true);
      if (isRedirect) {
        router.push(`${Routes.dashboard}`);
        localStorage.setItem('selectedStore', JSON.stringify({ id: '', slug: '' }));
      }
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS?.USERS_LOGIN],
      });
    },
  });
};
export const useLogoutMutation = (p0?: { onSuccess: () => void }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const loginService = useLoginService();
  const [_, setAuthorized] = useAtom(authorizationAtom);
  return useMutation({
    mutationFn: () => loginService.logout(),
    mutationKey: [API_ENDPOINTS.LOGOUT],
    onSuccess: async () => {
      Cookies.remove(AUTH_TOKEN_KEY);
      Cookies.remove(AUTH_USER);
      setAuthorized(false);
      queryClient.removeQueries({ queryKey: [API_ENDPOINTS.ME] });
      router.push(Routes.signin);
      localStorage.clear();
      localStorage.setItem('selectedStore', JSON.stringify({ id: '', slug: '' }));
      dispatch(setSelectedStore({ id: '', type: '', slug: '' }));
      toast.success('User Logout Successfully');
    },
    onError: (error) => {
      toast.error('Logout failed');
    },
  });
};

export const useShopOwnerLogin = ({ isRedirect = true }: { isRedirect?: boolean }) => {
  const queryClient = useQueryClient();
  const { setToken } = useToken();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const loginService = useStoreOwnerLoginService(); // Use the hook

  const [_, setAuthorized] = useAtom(authorizationAtom);
  return useMutation({
    mutationFn: (values: LoginInput) => loginService.create(values),
    mutationKey: [SELLER_API_ENDPOINTS.SHOP_OWNER_LOGIN],
    onSuccess: async (data) => {
      if (!data.data?.token) {
        toast.error('Wrong Credentials!');
        return;
      }
      toast.success(data?.data?.message);
      const { token, expires_at, permissions, email_verified, email_verification_settings, email } =
        data.data;
      Cookies.set(AUTH_TOKEN_KEY, token);
      Cookies.set(AUTH_USER, 'store_level');
      localStorage.setItem('expires_at', expires_at);
      setToken(token);
      setAuthCredentials(token, permissions);
      setAuthorized(true);
      localStorage.setItem('email_verified', data?.data?.email_verified.toString());
      localStorage.setItem(
        'email_verification_settings',
        data?.data?.email_verification_settings.toString(),
      );
      localStorage.setItem('user_email', data?.data?.email);

      if (isRedirect) {
        if (email_verified === false && email_verification_settings === 'on') {
          router.push(SellerRoutes.emailVerification);
        } else {
          router.push(SellerRoutes.dashboard);
          localStorage.setItem('selectedStore', JSON.stringify({ id: '', slug: '' }));
          dispatch(setSelectedStore({ id: '', type: '', slug: '' }));
        }
      }
    },
    onError: async (data) => {
      const ErrorText = (data as any)?.response?.data?.message;
      toast.error(ErrorText);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: [SELLER_API_ENDPOINTS?.SHOP_OWNER_LOGIN],
      });
    },
  });
};
export const useStoreOwnerLogoutMutation = (p0?: { onSuccess: () => void }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const loginService = useLoginService();
  const [_, setAuthorized] = useAtom(authorizationAtom);
  return useMutation({
    mutationFn: () => loginService.logout(),
    mutationKey: [API_ENDPOINTS.LOGOUT],
    onSuccess: async () => {
      Cookies.remove(AUTH_TOKEN_KEY);
      Cookies.remove(AUTH_USER);
      setAuthorized(false);
      queryClient.removeQueries({ queryKey: [API_ENDPOINTS.ME] });
      router.push(SellerRoutes.signin);
      localStorage.clear();
      dispatch(setSelectedStore({ id: '', type: '', slug: '' }));
      localStorage.setItem('selectedStore', JSON.stringify({ id: '', slug: '' }));
      dispatch(setRefetch(true));
      toast.success('User Logout Successfully');
    },
    onError: (error) => {
      toast.error('Logout failed');
    },
  });
};

export const useMeQuery = (options?: any) => {
  const [isAuthorized] = useAtom(authorizationAtom);
  const meService = useMeService();

  const query = useQuery<any>({
    queryKey: [API_ENDPOINTS.ME],
    queryFn: () => meService.me(),
    retry: false,
    enabled: isAuthorized,
    ...options,
  });

  return {
    me: query.data?.data,
    isPending: query.isPending,
    error: query.error,
    isAuthorized,
    isFetchedAfterMount: query.isFetchedAfterMount,
    refetch: query.refetch,
  };
};
export const useGetPermissionsQuery = (
  options: Partial<UsersQueryOptions>,
  p0?: { enabled: boolean; staleTime: number },
) => {
  const [isAuthorized] = useAtom(authorizationAtom);
  const { findAll } = useGetPermissionsService(); // Use the hook
  const { data, isPending, error, isFetchedAfterMount, refetch, isFetching } = useQuery<any>({
    queryKey: [API_ENDPOINTS.GET_PERMISSIONS],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });

  return {
    getPermissions: data?.data,
    isPending,
    isFetching,
    error,
    isAuthorized,
    isFetchedAfterMount,
    refetch,
  };
};

export const useForgetPasswordMutation = () => {
  const resetPasswordService = useResetPasswordService(); // Use the hook
  return useMutation({
    mutationFn: (values: ForgetPasswordInput) => resetPasswordService.create(values),
    mutationKey: [API_ENDPOINTS.FORGET_PASSWORD],
    onSuccess: async () => {
      toast.success('Check Your Email Inbox');
    },
  });
};

export const useVerifyForgetPasswordTokenMutation: any = () => {
  const verifyResetPasswordService = useVerifyResetPasswordService(); // Use the hook
  return useMutation({
    mutationFn: (values: TokenInput) => verifyResetPasswordService.create(values),
    mutationKey: [API_ENDPOINTS.VERIFY_FORGET_PASSWORD_TOKEN],
  });
};

export const useResetPasswordMutation = () => {
  const resetChangePasswordService = useResetChangePasswordService(); // Use the hook
  return useMutation({
    mutationFn: (values: ResetPasswordInput) => resetChangePasswordService.create(values),
    mutationKey: [API_ENDPOINTS.RESET_PASSWORD],
  });
};

export const useChangePasswordMutation = () => {
  const router = useRouter();
  const changePasswordService = useChangePasswordService(); // Use the hook
  return useMutation({
    mutationFn: (values: Omit<ChangePasswordInput, 'passwordConfirmation'>) =>
      changePasswordService.create(values),
    mutationKey: [API_ENDPOINTS.CHANGE_PASSWORD],
    onSuccess: async () => {
      toast.success('Change Password Successfully');
      router?.push(Routes.signin);
    },
  });
};

export const useForgotPassword = () => {
  const { create } = useForgotPasswordService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.ADMIN_FORGOT_PASSWORD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success((data as any)?.data?.message);
      } else {
        toast.error((data as any)?.data?.message);
      }
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data?.message;
      if (errorText && typeof errorText === 'object') {
        Object.entries(errorText).forEach(([key, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(msg));
          } else if (typeof messages === 'string') {
            toast.error(messages);
          }
        });
      } else {
        toast.error(errorText);
      }
    },
  });
};
export const useOTP = () => {
  const { create } = useOTPService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.ADMIN_VERIFY_TOKEN],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success((data as any)?.data?.message);
      } else {
        toast.error((data as any)?.data?.message);
      }
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data?.message;
      if (errorText && typeof errorText === 'object') {
        Object.entries(errorText).forEach(([key, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(msg));
          } else if (typeof messages === 'string') {
            toast.error(messages);
          }
        });
      } else {
        toast.error(errorText);
      }
    },
  });
};
export const useResetPassword = () => {
  const { create } = useResetPasswordService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.ADMIN_RESET_PASSWORD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success((data as any)?.data?.message);
      } else {
        toast.error((data as any)?.data?.message);
      }
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data?.message;
      if (errorText && typeof errorText === 'object') {
        Object.entries(errorText).forEach(([key, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(msg));
          } else if (typeof messages === 'string') {
            toast.error(messages);
          }
        });
      } else {
        toast.error(errorText);
      }
    },
  });
};

export const useSendVerificationEmailMutation = () => {
  const { create } = useSendVerificationEmailService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.SEND_VERIFICATION_EMAIL],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success('Verification email sent successfully!');
      } else {
        toast.error('Failed to send verification email. Please try again.');
      }
    },
    onError: async (data: any) => {
      toast.error(data?.response?.data?.message);
    },
  });
};

export const useResendVerificationEmailMutation = () => {
  const { create } = useResendVerificationEmailService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.RESEND_VERIFICATION_EMAIL],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success('Verification email sent successfully!');
      } else {
        toast.error('Failed to send verification email. Please try again.');
      }
    },
    onError: async (data: any) => {
      toast.error(data?.response?.data?.message);
    },
  });
};

export const useVerifyTokenByEmailMutation = () => {
  const { create } = useVerifyEmailService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.VERIFY_TOKEN_BY_EMAIL],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success('Token verification successful!');
      } else {
        toast.error('Token does not match. Please try again.');
      }
    },
    onError: async (data: any) => {
      toast.error(data?.response?.data?.message);
    },
  });
};
