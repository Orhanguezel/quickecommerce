"use client";
import { store } from "@/redux/store";
import { useLocale } from "next-intl";
import { ReactNode } from "react";
import { Provider } from "react-redux";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  return (
    <div dir={dir}>
      <Provider store={store}>
        <main className="flex-1 flex flex-col justify-between w-full mx-auto">
          {children}
        </main>
      </Provider>
    </div>
  );
}
