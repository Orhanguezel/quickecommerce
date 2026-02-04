// hooks/useFirebaseNotifications.ts
"use client";
import { useEffect, useState } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { getClientMessaging } from "@/lib/firebase";
import { toast } from "react-toastify";

type NotificationPayload = {
  title: string;
  body: string;
  data: any;
};

export const useFirebaseNotifications = (onNewNotification?: () => void) => {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initFCM = async () => {
      try {
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
          return;
        }

        const messaging = getClientMessaging();

        if (!messaging) return;

        const swRegistration = await navigator.serviceWorker.ready;
        const fcmToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: swRegistration,
        });

        if (fcmToken) {
          setToken(fcmToken);
        } else {
          toast.error("Failed to retrieve FCM token.");
        }

        onMessage(messaging, (payload) => {
          const title = payload.notification?.title ?? "New Notification";
          const body = payload.notification?.body ?? "";
          const data = payload.data ?? {};
          setNotifications((prev) => [...prev, { title, body, data }]);
          toast.info(`${title}: ${body}`);
          if (onNewNotification) onNewNotification();
        });
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== "undefined") {
      initFCM();
    }
  }, [onNewNotification]);

  return { token, notifications, loading };
};
