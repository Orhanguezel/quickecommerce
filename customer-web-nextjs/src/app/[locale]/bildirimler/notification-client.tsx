"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { Bell, ChevronRight, Package } from "lucide-react";
import {
  useNotificationListQuery,
  useMarkAsReadMutation,
} from "@/modules/notification/notification.service";
import type { Notification } from "@/modules/notification/notification.type";

interface NotificationTranslations {
  title: string;
  no_notifications: string;
  mark_as_read: string;
  all: string;
  unread: string;
  read: string;
  order_notification: string;
  loading: string;
  error: string;
  previous: string;
  next: string;
  home: string;
}

interface NotificationClientProps {
  translations: NotificationTranslations;
}

export function NotificationClient({ translations: t }: NotificationClientProps) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"read" | "unread" | undefined>(
    undefined
  );

  const { data, isLoading, isError } = useNotificationListQuery({
    page,
    status: statusFilter,
  });
  const markAsRead = useMarkAsReadMutation();

  const notifications = data?.notifications ?? [];
  const meta = data?.meta;

  function handleMarkAsRead(notification: Notification) {
    if (notification.status === "unread") {
      markAsRead.mutate(notification.id);
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="container py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {t.home}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{t.title}</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold tracking-tight">{t.title}</h1>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2">
        {([
          { key: undefined, label: t.all },
          { key: "unread" as const, label: t.unread },
          { key: "read" as const, label: t.read },
        ]).map((tab) => (
          <button
            key={tab.label}
            onClick={() => {
              setStatusFilter(tab.key);
              setPage(1);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border p-4">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-muted" />
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-1/4 rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground">{t.error}</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bell className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-lg font-medium">{t.no_notifications}</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleMarkAsRead(notification)}
                className={`cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
                  notification.status === "unread"
                    ? "border-primary/20 bg-primary/5"
                    : ""
                }`}
              >
                <div className="flex gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      notification.status === "unread"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {notification.data?.order_id ? (
                      <Package className="h-5 w-5" />
                    ) : (
                      <Bell className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={`text-sm ${
                          notification.status === "unread" ? "font-semibold" : "font-medium"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      {notification.status === "unread" && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatDate(notification.created_at)}</span>
                      {notification.data?.order_id && (
                        <Link
                          href={`/siparislerim`}
                          className="text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {t.order_notification} #{notification.data.order_id}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2">
              {page > 1 && (
                <button
                  onClick={() => setPage(page - 1)}
                  className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
                >
                  {t.previous}
                </button>
              )}

              {Array.from({ length: Math.min(meta.last_page, 7) }).map((_, i) => {
                let p: number;
                if (meta.last_page <= 7) {
                  p = i + 1;
                } else if (page <= 4) {
                  p = i + 1;
                } else if (page >= meta.last_page - 3) {
                  p = meta.last_page - 6 + i;
                } else {
                  p = page - 3 + i;
                }

                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`rounded-md border px-3 py-2 text-sm ${
                      p === page
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              {page < meta.last_page && (
                <button
                  onClick={() => setPage(page + 1)}
                  className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
                >
                  {t.next}
                </button>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
