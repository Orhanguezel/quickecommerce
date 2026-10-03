import { BadgeCheck } from "lucide-react";

// Rozet yalniz API admin onayli, suresi gecerli yetki kaydi dondurdugunde
// basilir; metin sayfanin kendi ceviri kaynagindan gelir.
export function AuthorizedSellerBadge({
  label,
  hint,
  variant = "default",
}: {
  label: string;
  hint: string;
  variant?: "default" | "onDark";
}) {
  return (
    <span
      title={hint}
      className={
        variant === "onDark"
          ? "inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white ring-1 ring-white/30"
          : "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800"
      }
    >
      <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
