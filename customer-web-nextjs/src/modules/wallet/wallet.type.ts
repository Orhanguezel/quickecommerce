export interface WalletInfo {
  id: number;
  owner_id: number;
  owner_type: string;
  total_balance: number;
  total_earnings: number;
  total_withdrawn: number;
  status: "active" | "inactive";
}

export interface WalletTransaction {
  id: number;
  owner_name: string;
  wallet_id: number;
  transaction_ref: string | null;
  transaction_details: string | null;
  amount: number;
  type: "credit" | "debit";
  purpose: string | null;
  payment_gateway: string | null;
  payment_status: "pending" | "paid" | "failed";
  status: 0 | 1;
  currency_code: string;
  exchange_rate: number;
  created_at: string;
  updated_at: string;
}

export interface WalletBankAccount {
  bank_name: string;
  account_holder: string;
  iban: string;
  description: string;
}

export interface WalletInfoResponse {
  wallets: WalletInfo;
  max_deposit_per_transaction: number;
  bank_account: WalletBankAccount | null;
}

export interface WalletTransactionsResponse {
  wallets: WalletTransaction[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
