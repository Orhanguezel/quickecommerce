"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { ROUTES } from "@/config/routes";
import {
  useWalletInfoQuery,
  useWalletTransactionsQuery,
} from "@/modules/wallet/wallet.service";
import type { WalletTransaction } from "@/modules/wallet/wallet.type";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface Props {
  translations: Record<string, string>;
}

type TypeFilter = "" | "credit" | "debit";

export function WalletClient({ translations: t }: Props) {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("");

  const { data: walletData, isLoading: walletLoading } = useWalletInfoQuery();
  const { data: txData, isLoading: txLoading } =
    useWalletTransactionsQuery({ page, type: typeFilter || undefined });

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    const key = `status_${status}`;
    return t[key] || status;
  };

  if (walletLoading) {
    return (
      <div className="container mx-auto flex min-h-[40vh] items-center justify-center px-4 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const wallet = walletData?.wallets;
  const transactions = txData?.transactions ?? [];
  const meta = txData?.meta;
  const totalPages = meta?.last_page ?? 1;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href={ROUTES.HOME} className="hover:text-foreground">
          {t.home}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{t.wallet}</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold">
        <Wallet className="mr-2 inline-block h-6 w-6" />
        {t.wallet}
      </h1>

      {/* Balance Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Wallet className="h-4 w-4" />
            {t.balance}
          </div>
          <p className="text-3xl font-bold text-primary">
            {t.currency}
            {Number(wallet?.total_balance ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-green-600" />
            {t.total_earnings}
          </div>
          <p className="text-2xl font-bold text-green-600">
            {t.currency}
            {Number(wallet?.total_earnings ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingDown className="h-4 w-4 text-orange-600" />
            {t.total_withdrawn}
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {t.currency}
            {Number(wallet?.total_withdrawn ?? 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Transactions */}
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">{t.transactions}</h2>
          <div className="flex gap-2">
            {(["", "credit", "debit"] as TypeFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => {
                  setTypeFilter(f);
                  setPage(1);
                }}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  typeFilter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {f === ""
                  ? t.filter_all
                  : f === "credit"
                    ? t.filter_credit
                    : t.filter_debit}
              </button>
            ))}
          </div>
        </div>

        {txLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            {t.no_transactions}
          </p>
        ) : (
          <div className="divide-y">
            {transactions.map((tx: WalletTransaction) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-4"
              >
                <div className="flex items-center gap-3">
                  {tx.type === "credit" ? (
                    <ArrowDownCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <ArrowUpCircle className="h-8 w-8 text-orange-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {tx.type === "credit" ? t.type_credit : t.type_debit}
                      {tx.purpose && (
                        <span className="ml-1 text-muted-foreground">
                          ({tx.purpose})
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString("tr-TR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${getPaymentStatusColor(tx.payment_status)}`}
                      >
                        {getPaymentStatusLabel(tx.payment_status)}
                      </span>
                    </div>
                    {tx.transaction_ref && (
                      <p className="text-xs text-muted-foreground">
                        Ref: {tx.transaction_ref}
                      </p>
                    )}
                  </div>
                </div>
                <p
                  className={`text-base font-bold ${
                    tx.type === "credit" ? "text-green-600" : "text-orange-600"
                  }`}
                >
                  {tx.type === "credit" ? "+" : "-"}
                  {t.currency}
                  {Number(tx.amount).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2 border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              {t.previous}
            </Button>
            <span className="px-3 text-sm text-muted-foreground">
              {t.page} {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              {t.next}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
