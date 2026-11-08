import type { ReactNode } from "react";
import LoyaltyTabs from "./loyalty-tabs";

export default function LoyaltyLayout({ children }: { children: ReactNode }) {
  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-lg font-semibold text-blue-500 md:text-2xl">
          Sadakat Yönetimi
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Müşteri puanlarını ve sadakat programı ayarlarını yönetin.
        </p>
      </header>
      <LoyaltyTabs />
      {children}
    </section>
  );
}
