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
  /** Puanin kullanima acilacagi an. null = aninda kullanilabilir. */
  available_at: string | null;
  /** Bekleme suresi henuz dolmadi. */
  is_pending: boolean;
  created_at: string;
}

export interface LoyaltyRules {
  earn_per_currency: number;
  redeem_points_per_unit: number;
  redeem_value: number;
  min_redeem_points: number;
  voucher_min_order: number;
  voucher_valid_days: number;
  /** Kazanilan puanin kullanima acilmasi icin beklenen gun sayisi. */
  hold_days: number;
}

export interface LoyaltyInfoResponse {
  status: boolean;
  data: {
    balance: number;
    balance_value: number;
    /** Bekleme suresi dolmamis, henuz bozdurulamayan puan. */
    pending_balance: number;
    pending_value: number;
    /** Bekleyen puanlardan en yakin acilma tarihi. */
    next_available_at: string | null;
    earning_enabled: boolean;
    redeem_enabled: boolean;
    /** Misafir checkout ile acilmis hafif hesap. */
    is_guest: boolean;
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

export interface LoyaltyCampaign {
  active: boolean;
  review_bonus_with_image: number;
  review_bonus_with_image_value: number;
  review_bonus_no_image: number;
  review_bonus_no_image_value: number;
  earn_per_currency: number;
  min_redeem_points: number;
  min_redeem_value: number;
  voucher_min_order: number;
  voucher_valid_days: number;
  max_per_order: number;
  hold_days: number;
  /** Yasal aciklama metni; tek yerden gelir. */
  disclosure: string;
  /** Kosullar sayfasi yayinda degilse null gelir; arayuz baglantiyi basmaz. */
  terms_url: string | null;
}

export interface LoyaltyCampaignResponse {
  status: boolean;
  data: LoyaltyCampaign;
}
