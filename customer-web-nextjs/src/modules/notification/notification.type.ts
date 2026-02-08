export interface NotificationData {
  order_id?: number;
  [key: string]: unknown;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  notifiable_type: string;
  notifiable_id: number;
  data: NotificationData | null;
  status: "read" | "unread";
  created_at: string;
}

export interface NotificationListResponse {
  success: boolean;
  message: string;
  data: Notification[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}
