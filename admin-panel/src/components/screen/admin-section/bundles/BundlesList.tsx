"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui";
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

interface BundleRow {
  id: number;
  name: string;
  slug: string;
  original_price: number;
  bundle_price: number;
  discount_percent: number;
  savings: number;
  currency_code: string;
  status?: number;
  items?: Array<{ id: number; product: { name: string } | null }>;
}

export default function BundlesList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const listService = useBaseService<unknown>(API_ENDPOINTS.ADMIN_BUNDLE_LIST);
  const deleteService = useBaseService<unknown>(API_ENDPOINTS.ADMIN_BUNDLE_DELETE);
  const qc = useQueryClient();

  const { data: listRes } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_BUNDLE_LIST, search, page],
    queryFn: () => listService.findAll({ search, page, per_page: 25 }),
    retry: false,
  });

  const remove = useMutation({
    mutationFn: async (id: number) =>
      deleteService.delete(String(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: [API_ENDPOINTS.ADMIN_BUNDLE_LIST] }),
  });

  const payload = (listRes?.data as { data?: { data?: BundleRow[]; total?: number } }) ?? {};
  const rows: BundleRow[] = payload.data?.data ?? [];
  const total = payload.data?.total ?? 0;

  return (
    <div className="space-y-6 p-6">
      <header className="flex items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <Package className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold">Paketler</h1>
            <p className="text-sm text-muted-foreground">Bir arada satılan paket ürünler</p>
          </div>
        </div>
        <Link
          href="/admin/bundles/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Yeni Paket
        </Link>
      </header>

      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Paket adı ara..."
            className="w-72 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr className="text-left">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">İsim</th>
                  <th className="px-4 py-3 text-right">Ürün</th>
                  <th className="px-4 py-3 text-right">Normal Fiyat</th>
                  <th className="px-4 py-3 text-right">Paket Fiyatı</th>
                  <th className="px-4 py-3 text-right">İndirim</th>
                  <th className="px-4 py-3 text-center">Durum</th>
                  <th className="px-4 py-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-muted-foreground">
                      Henüz paket yok. <Link href="/admin/bundles/new" className="text-primary underline">Yeni paket ekle</Link>
                    </td>
                  </tr>
                ) : rows.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-right">{r.items?.length ?? 0}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground line-through">
                      {Number(r.original_price).toLocaleString("tr-TR")} {r.currency_code}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {Number(r.bundle_price).toLocaleString("tr-TR")} {r.currency_code}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      %{r.discount_percent}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.status === 1
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {r.status === 1 ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/bundles/${r.id}`}
                          className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                          aria-label="Düzenle"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => {
                            if (confirm(`"${r.name}" paketini silmek istediğinize emin misiniz?`)) {
                              remove.mutate(r.id);
                            }
                          }}
                          className="rounded p-1.5 text-red-600 hover:bg-red-50"
                          aria-label="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {total > 25 && (
            <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
              <span>Toplam {total} kayıt</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="rounded border px-3 py-1 disabled:opacity-40"
                >
                  Önceki
                </button>
                <span className="px-3 py-1">Sayfa {page}</span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={rows.length < 25}
                  className="rounded border px-3 py-1 disabled:opacity-40"
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
