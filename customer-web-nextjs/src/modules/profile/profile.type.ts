export interface CustomerProfile {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  email: string;
  birth_day: string | null;
  gender: "male" | "female" | "others" | null;
  image: string | null;
  image_url: string | null;
  status: number;
  email_verified: boolean;
  unread_notifications: number;
  wishlist_count: number;
}

export interface UpdateProfileInput {
  first_name: string;
  last_name?: string;
  phone?: string;
  birth_day?: string;
  gender?: "male" | "female" | "others";
}

export interface ChangePasswordInput {
  old_password: string;
  new_password: string;
  new_password_confirmation: string;
}
