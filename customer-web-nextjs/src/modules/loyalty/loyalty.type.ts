export type LoyaltyTransactionType =
  | "order"
  | "review"
  | "redeem"
  | "revoke"
  | "expire"
  | "manual";

export interface LoyaltyTransaction {
  id: number;
  points: number;
  type: LoyaltyTransactionType;
  description: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface LoyaltyRules {
  earn_per_currency: number;
  redeem_points_per_unit: number;
  redeem_value: number;
  min_redeem_points: number;
  voucher_min_order: number;
  voucher_valid_days: number;
}

export interface LoyaltyInfoResponse {
  status: boolean;
  data: {
    balance: number;
    balance_value: number;
    earning_enabled: boolean;
    redeem_enabled: boolean;
    rules: LoyaltyRules;
    transactions: LoyaltyTransaction[];
  };
  meta?: { current_page: number; last_page: number; total: number };
}

export interface LoyaltyVoucher {
  coupon_code: string;
  discount: number;
  min_order_value: number;
  end_date: string | null;
  is_used: boolean;
  is_expired: boolean;
}

export interface LoyaltyVouchersResponse {
  status: boolean;
  data: LoyaltyVoucher[];
}

export interface LoyaltyRedeemResponse {
  status: boolean;
  message: string;
  data: LoyaltyVoucher;
}
