import type { ReactNode } from "react";
import WhatsappHeader from "./whatsapp-header";
import styles from "./whatsapp.module.css";

export default function WhatsappLayout({ children }: { children: ReactNode }) {
  return (
    <section className={`${styles.shell} mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-5`}>
      <WhatsappHeader />
      {children}
    </section>
  );
}
