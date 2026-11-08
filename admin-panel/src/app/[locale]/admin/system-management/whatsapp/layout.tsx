import type { ReactNode } from "react";
import WhatsappTabs from "./whatsapp-tabs";

export default function WhatsappLayout({ children }: { children: ReactNode }) {
  return <section className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
    <h1 className="text-2xl font-semibold">WhatsApp Business</h1>
    <WhatsappTabs />
    {children}
  </section>;
}
