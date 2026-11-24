"use client";

import { useQuery } from "@tanstack/react-query";
import { useBaseService } from "@/modules/core/base.service";

export const WHATSAPP_API = "/v1/admin/whatsapp";

export const eventLabels: Record<string, string> = {
  payment_confirmed: "Ödeme onayı",
  cod_order_accepted: "Kapıda ödeme siparişi",
  shipment_dispatched: "Kargoya verildi",
  shipment_delivered: "Teslim edildi",
  order_cancelled: "Sipariş iptali",
  refund_confirmed: "İade onayı",
};

export type Connection = {
  business_account_id: string;
  phone_number_id: string;
  enabled: boolean;
  pilot_mode: boolean;
  enabled_events: string[];
  subscribed: boolean;
  out_of_hours_enabled: boolean;
  out_of_hours_text?: string;
  office_start: number;
  office_end: number;
  health: { connected?: boolean; messaging_status?: string; display_phone_number?: string; verified_name?: string };
};

export type WhatsappStatus = {
  configured: boolean;
  channel_available: boolean;
  callback_url: string;
  events: Record<string, { template: string; parameters: number }>;
  connection: Connection | null;
  pilot_number_count: number;
};

export function useWhatsappStatus() {
  const api = useBaseService<unknown>(WHATSAPP_API).getAxiosInstance();
  return useQuery({
    queryKey: ["whatsapp-status"],
    queryFn: async () => (await api.get<WhatsappStatus>(WHATSAPP_API)).data,
  });
}

export function replyReady(status: WhatsappStatus) {
  return !!(status.channel_available && status.connection?.subscribed &&
    status.connection.health.connected && status.connection.health.messaging_status === "AVAILABLE");
}
