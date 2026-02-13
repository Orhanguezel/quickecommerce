export interface Currency {
  id: number;
  name: string;
  code: string;
  symbol: string;
  exchange_rate: number;
  is_default: boolean;
}

export interface CurrencyConvertRequest {
  amount: number;
  from: string;
  to: string;
}

export interface CurrencyConvertResponse {
  success: boolean;
  data: {
    amount: number;
    from: string;
    to: string;
    converted_amount: number;
  };
}
