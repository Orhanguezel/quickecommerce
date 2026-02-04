import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import {
  type ForgetPasswordInput,
  type TokenInput,
  type Login,
  type SignUpInput,
  type ResetPasswordInput,
  type ChangePasswordInput,
} from "@/modules/users/users.schema";
import {
  type User,
  type AuthResponse,
  type FormMessage,
  type UpdateUserInput,
} from "@/types";
import { toast } from "react-toastify";
import { Email, Token } from "./users.type";
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";

// Signup Service Hook
export const useUserService = () => {
  return useBaseService<AuthResponse, SignUpInput>(
    API_ENDPOINTS.STORE_OWNER_REGISTER
  );
};

// Login Service Hook
export const useLoginService = () => {
  const service = useBaseService<AuthResponse, Login>(
    API_ENDPOINTS.USERS_LOGIN
  );
  const logout = async () => {
    try {
      await service.getAxiosInstance().post(API_ENDPOINTS.LOGOUT, {});
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `Error refetching data: ${error.message}`
          : "An unknown error occurred while refetching data"
      );
    }
  };
  return { ...service, logout };
};
// Store Owner Login Service Hook
export const useStoreOwnerLoginService = () => {
  const service = useBaseService<AuthResponse, Login>(
    API_ENDPOINTS.SHOP_OWNER_LOGIN
  );
  const logout = async () => {
    try {
      await service.getAxiosInstance().post(API_ENDPOINTS.LOGOUT, {});
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `Error refetching data: ${error.message}`
          : "An unknown error occurred while refetching data"
      );
    }
  };
  return { ...service, logout };
};

// Me Service Hook
export const useMeService = () => {
  const service = useBaseService<User>(API_ENDPOINTS.ME);
  const me = () => {
    return service.findAll(); // Assuming this route just retrieves user info
  };
  return { ...service, me };
};
export const useGetPermissionsService = () => {
  return useBaseService<User>(API_ENDPOINTS.GET_PERMISSIONS);
};

// Verify Reset Password Service Hook
export const useVerifyResetPasswordService = () => {
  return useBaseService<FormMessage, TokenInput>(
    API_ENDPOINTS.VERIFY_FORGET_PASSWORD_TOKEN
  );
};

// Reset Change Password Service Hook
export const useResetChangePasswordService = () => {
  return useBaseService<FormMessage, ResetPasswordInput>(
    API_ENDPOINTS.RESET_PASSWORD
  );
};

// Change Password Service Hook
export const useChangePasswordService = () => {
  return useBaseService<FormMessage, ChangePasswordInput>(
    API_ENDPOINTS.CHANGE_PASSWORD
  );
};

// Update User Service Hook
export const useUpdateUserService = () => {
  return useBaseService<User, UpdateUserInput>(API_ENDPOINTS.USERS);
};

export const useForgotPasswordService = () => {
  return useBaseService<any>(API_ENDPOINTS.ADMIN_FORGOT_PASSWORD);
};
export const useOTPService = () => {
  return useBaseService<any>(API_ENDPOINTS.ADMIN_VERIFY_TOKEN);
};
export const useResetPasswordService = () => {
  return useBaseService<any>(API_ENDPOINTS.ADMIN_RESET_PASSWORD);
};


export const useSendVerificationEmailService = () => {
    return useBaseService<Email>(SELLER_API_ENDPOINTS.SEND_VERIFICATION_EMAIL);
};
export const useResendVerificationEmailService = () => {
    return useBaseService<Email>(SELLER_API_ENDPOINTS.RESEND_VERIFICATION_EMAIL);
};
export const useVerifyEmailService = () => {
    return useBaseService<Token>(SELLER_API_ENDPOINTS.VERIFY_TOKEN_BY_EMAIL);
};