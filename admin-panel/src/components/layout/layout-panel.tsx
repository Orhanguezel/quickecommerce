"use client";
import { Footer } from "@/components/blocks/shared/footer";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";

export default function LayoutPanel({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebar = useStore(useSidebarToggle, (state) => state);
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  if (!sidebar) return null;

  return (
    <div dir={dir} className="min-h-[calc(100vh-5rem)] flex flex-col ">
      <main
        className={cn(
          "flex-grow bg-[#F3F4F6] dark:bg-gray-900 transition-[margin-left] ease-in-out duration-300",
          sidebar?.isOpen === false
            ? dir === "rtl"
              ? "lg:mr-[90px]"
              : "lg:ml-[90px]"
            : dir === "rtl"
            ? "lg:mr-72"
            : "lg:ml-72"
        )}
      >
        {children}
      </main>
      <footer
        className={cn(
          "transition-[margin-left] ease-in-out duration-300",
          sidebar?.isOpen === false
            ? dir === "rtl"
              ? "lg:mr-[80px]"
              : "lg:ml-[80px]"
            : dir === "rtl"
            ? "lg:mr-[200px]"
            : "lg:ml-[200px]"
        )}
      >
        <Footer />
      </footer>
    </div>
  );
}
