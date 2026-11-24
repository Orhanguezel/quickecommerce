"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import WhatsappTabs from "./whatsapp-tabs";
import { useWhatsappStatus } from "./whatsapp-data";
import styles from "./whatsapp.module.css";

export default function WhatsappHeader() {
  const { data } = useWhatsappStatus();
  const connected = data?.connection?.health.connected;

  return (
    <header className={cn("overflow-hidden rounded-xl border text-card-foreground shadow-sm", styles.workspaceHeader)}>
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-5 sm:px-6">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">WhatsApp Business</h1>
          {data && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="outline" className={cn("gap-1.5", connected && "border-emerald-600/30 text-emerald-700 dark:text-emerald-400")}>
                <span aria-hidden className={cn("size-2 rounded-full bg-muted-foreground", connected && "bg-emerald-600")} />
                {connected ? "Bağlı" : data.configured ? "Bağlantı kontrolü gerekli" : "Hesap bağlı değil"}
              </Badge>
              {data.connection?.health.display_phone_number && (
                <span className="tabular-nums">{data.connection.health.display_phone_number}</span>
              )}
            </div>
          )}
        </div>
        {data?.configured && (
          <div className="text-sm text-muted-foreground">
            Otomatik bildirimler <span className="font-semibold text-foreground">{data.connection?.enabled ? "Açık" : "Kapalı"}</span>
          </div>
        )}
      </div>
      <WhatsappTabs />
    </header>
  );
}
