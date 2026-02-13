"use client";

import axios from "axios";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { Currency, CurrencyConvertRequest, CurrencyConvertResponse } from "./currency.type";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_REST_API_ENDPOINT || "http://localhost:8000/api/v1",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const CurrencyService = {
  /**
   * Get all active currencies
   */
  async getAll(): Promise<Currency[]> {
    const response = await api.get(API_ENDPOINTS.CURRENCIES);
    return response.data.data;
  },

  /**
   * Get default currency
   */
  async getDefault(): Promise<Currency> {
    const response = await api.get(API_ENDPOINTS.CURRENCY_DEFAULT);
    return response.data.data;
  },

  /**
   * Convert amount between currencies
   */
  async convert(data: CurrencyConvertRequest): Promise<CurrencyConvertResponse> {
    const response = await api.post(API_ENDPOINTS.CURRENCY_CONVERT, data);
    return response.data;
  },
};
