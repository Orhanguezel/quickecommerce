import { type QueryOptions } from "@/types";

export interface SellerApplicationUser {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
}

export interface SellerApplication {
  id: string;
  user_id: string;
  user: SellerApplicationUser;
  company_name: string;
  brand_name: string;
  sector: string;
  tax_office: string;
  tax_number: string;
  mersis_number: string;
  website_url: string;
  address: {
    country: string;
    city: string;
    district: string;
    postal_code: string;
    address_line1: string;
    address_line2: string;
  };
  bank: {
    bank_name: string;
    account_holder: string;
    iban: string;
    account_number: string;
    branch_code: string;
    swift_code: string;
  };
  note: string;
  status: number;
  admin_note: string;
  reviewed_by: string;
  reviewed_at: string;
  created_at: string;
  updated_at: string;
}

export interface SellerApplicationQueryOptions extends QueryOptions {
  status?: string;
  per_page?: number;
  search?: string;
  page?: number;
}
