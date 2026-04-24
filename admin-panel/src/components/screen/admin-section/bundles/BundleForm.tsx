"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui";
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2, Search } from "lucide-react";

interface BundleItemInput {
  product_id: number;
  product_name?: string;
  variant_id?: number | null;
  quantity: number;
}

interface ProductOption {
  id: number;
  name: string;
}

export default function BundleForm({ bundleId }: { bundleId: number | null }) {
  const router = useRouter();
  const isEdit = bundleId !== null;

  const detailService = useBaseService<unknown>(API_ENDPOINTS.ADMIN_BUNDLE_DETAIL);
  const createService = useBaseService<unknown>(API_ENDPOINTS.ADMIN_BUNDLE_CREATE);
  const searchService = useBaseService<unknown>(API_ENDPOINTS.ADMIN_PRODUCT_SEARCH);
  const axios = createService.getAxiosInstance();

  // --- form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [bundlePrice, setBundlePrice] = useState<string>("0");
  const [currencyCode, setCurrencyCode] = useState("TRY");
  const [status, setStatus] = useState(1);
  const [sortOrder, setSortOrder] = useState(0);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [items, setItems] = useState<BundleItemInput[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [errors, setErrors] = useState<string | null>(null);

  // --- load existing bundle
  const { data: detailRes } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_BUNDLE_DETAIL, bundleId],
    enabled: isEdit,
    queryFn: () => detailService.find(String(bundleId)),
    retry: false,
  });

  useEffect(() => {
    const bundle = (detailRes?.data as { data?: Record<string, unknown> })?.data;
    if (!bundle) return;
    setName(String(bundle.name ?? ""));
    setSlug(String(bundle.slug ?? ""));
    setDescription(String(bundle.description ?? ""));
    setBundlePrice(String(bundle.bundle_price ?? "0"));
    setCurrencyCode(String(bundle.currency_code ?? "TRY"));
    setStatus(Number(bundle.status ?? 1));
    setSortOrder(Number(bundle.sort_order ?? 0));
    setStartsAt(bundle.starts_at ? String(bundle.starts_at).slice(0, 16) : "");
    setEndsAt(bundle.ends_at ? String(bundle.ends_at).slice(0, 16) : "");
    const loadedItems = (bundle.items as Array<Record<string, unknown>>) ?? [];
    setItems(
      loadedItems.map((it) => ({
        product_id: Number(it.product_id),
        product_name: (it.product as { name?: string } | null)?.name,
        variant_id: it.variant_id ? Number(it.variant_id) : null,
        quantity: Number(it.quantity ?? 1),
      }))
    );
  }, [detailRes]);

  // --- product search
  const { data: productsRes, isFetching: searchingProducts } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_PRODUCT_SEARCH, productSearch],
    enabled: productSearch.length >= 2,
    queryFn: () => searchService.findAll({ search: productSearch, limit: 20 }),
    retry: false,
  });

  const productOptions = useMemo<ProductOption[]>(() => {
    const payload = productsRes?.data as { data?: { data?: Array<{ id: number; name: string }> } | Array<{ id: number; name: string }> } | undefined;
    const list = Array.isArray(payload?.data) ? payload?.data : payload?.data?.data;
    return (list ?? []).map((p) => ({ id: p.id, name: p.name }));
  }, [productsRes]);

  // --- mutations
  const save = useMutation({
    mutationFn: async () => {
      const body = {
        name,
        slug: slug || undefined,
        description: description || null,
        bundle_price: Number(bundlePrice),
        currency_code: currencyCode,
        status,
        sort_order: sortOrder,
        starts_at: startsAt || null,
        ends_at: endsAt || null,
        items: items.map((it) => ({
          product_id: it.product_id,
          variant_id: it.variant_id ?? null,
          quantity: it.quantity,
        })),
      };

      if (isEdit) {
        return axios.put(`${API_ENDPOINTS.ADMIN_BUNDLE_UPDATE}/${bundleId}`, body);
      }
      return createService.create(body);
    },
    onSuccess: () => {
      router.push("/admin/bundles");
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setErrors(e?.response?.data?.message ?? "Kaydetme başarısız oldu.");
    },
  });

  const addProduct = (p: ProductOption) => {
    if (items.some((it) => it.product_id === p.id)) return;
    setItems([...items, { product_id: p.id, product_name: p.name, variant_id: null, quantity: 1 }]);
    setProductSearch("");
  };

  const removeItem = (idx: number) =>
    setItems(items.filter((_, i) => i !== idx));

  const setQuantity = (idx: number, qty: number) =>
    setItems(items.map((it, i) => (i === idx ? { ...it, quantity: Math.max(1, qty) } : it)));

  const canSubmit = name.trim() && items.length >= 2 && Number(bundlePrice) > 0;

  return (
    <div className="space-y-6 p-6">
      <header className="flex items-center gap-3">
        <Link
          href="/admin/bundles"
          className="flex h-9 w-9 items-center justify-center rounded-md border hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? "Paketi Düzenle" : "Yeni Paket"}</h1>
          <p className="text-sm text-muted-foreground">
            2 veya daha fazla ürünü tek fiyata sun
          </p>
        </div>
      </header>

      {errors && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {errors}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-sm font-medium">Paket Adı *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Yaz Kamp Paketi"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Slug (URL)</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="yaz-kamp-paketi (boş bırakılırsa otomatik)"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Açıklama</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Items picker */}
          <Card>
            <CardContent className="space-y-4 p-6">
              <div>
                <h3 className="mb-2 font-semibold">Pakete Dahil Ürünler</h3>
                <p className="mb-3 text-xs text-muted-foreground">
                  En az 2 ürün eklemelisin. Miktar varyant bazlı değil, ürün bazlıdır.
                </p>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="En az 2 karakter yaz..."
                    className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm"
                  />
                  {productSearch.length >= 2 && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-64 overflow-y-auto rounded-md border bg-card shadow-lg">
                      {searchingProducts ? (
                        <div className="p-3 text-sm text-muted-foreground">Aranıyor...</div>
                      ) : productOptions.length === 0 ? (
                        <div className="p-3 text-sm text-muted-foreground">Sonuç yok</div>
                      ) : (
                        productOptions.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => addProduct(p)}
                            className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted"
                          >
                            <span>{p.name}</span>
                            <Plus className="h-4 w-4 text-primary" />
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {items.length > 0 && (
                <ul className="space-y-2">
                  {items.map((it, idx) => (
                    <li
                      key={`${it.product_id}-${idx}`}
                      className="flex items-center gap-3 rounded-md border bg-muted/30 p-3"
                    >
                      <span className="flex-1 text-sm font-medium">
                        {it.product_name || `Ürün #${it.product_id}`}
                      </span>
                      <input
                        type="number"
                        min={1}
                        value={it.quantity}
                        onChange={(e) => setQuantity(idx, Number(e.target.value))}
                        className="w-20 rounded-md border border-input bg-background px-2 py-1 text-center text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="rounded p-1 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {items.length < 2 && (
                <p className="text-xs text-amber-700">
                  ⚠ En az 2 ürün eklenmeli.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-sm font-medium">Paket Fiyatı *</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={bundlePrice}
                    onChange={(e) => setBundlePrice(e.target.value)}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <select
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value)}
                    className="rounded-md border border-input bg-background px-2 py-2 text-sm"
                  >
                    <option value="TRY">TRY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Normal fiyat ürünlerin variant fiyatları toplamından hesaplanır.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Durum</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value={1}>Aktif</option>
                  <option value={0}>Pasif</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Sıra</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Başlangıç (opsiyonel)</label>
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Bitiş (opsiyonel)</label>
                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <button
            type="button"
            onClick={() => save.mutate()}
            disabled={!canSubmit || save.isPending}
            className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {save.isPending ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Oluştur"}
          </button>
        </div>
      </div>
    </div>
  );
}
