import type { ReactNode } from "react";
import WhatsappHeader from "./whatsapp-header";

export default function WhatsappLayout({ children }: { children: ReactNode }) {
  return (
    <section className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-5">
      <WhatsappHeader />
      {children}
    </section>
  );
}
