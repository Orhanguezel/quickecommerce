export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  image?: string;
  image_url?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterInput {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface VerifyTokenInput {
  token: string;
}

export interface ResetPasswordInput {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface SocialLoginInput {
  email: string;
  access_token: string;
  type: "google" | "facebook";
}

export interface OtpLoginSendInput {
  email: string;
}

export interface OtpLoginVerifyInput {
  email: string;
  otp: string;
}

export interface OtpLoginSendResponse {
  status?: boolean;
  message?: string;
}

export interface LoginResponse {
  token: string;
  expires_at: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  expires_at: string;
  user: User;
}
