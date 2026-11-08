'use client';

import { Button, Card, CardContent, Input } from '@/components/ui';
import { useBaseService } from '@/modules/core/base.service';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

type Authorization = {
  id: number;
  brand_id: number | null;
  brand_name: string | null;
  evidence: string | null;
  valid_from: string | null;
  valid_to: string | null;
  active: boolean;
};

type Brand = { id: number; brand_name: string };

const emptyForm = { brand_id: '', evidence: '', valid_from: '', valid_to: '' };

// Yetkili satici rozeti yalniz buradan, admin tarafindan acilir. Kayit = onay;
// belge bilgisi (yetki belgesi no / dosya linki) zorunludur.
export default function AuthorizedSellerPanel({ storeId }: { storeId?: string | number | null }) {
  const endpoint = `v1/admin/store/${storeId}/brand-authorizations`;
  const { getAxiosInstance } = useBaseService<any>(endpoint);
  const axios = getAxiosInstance();
  const [items, setItems] = useState<Authorization[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    if (!storeId) return;
    axios
      .get(endpoint)
      .then((res) => {
        setItems(res.data?.data?.authorizations ?? []);
        setBrands(res.data?.data?.brands ?? []);
      })
      .catch((error) => toast.error(error?.response?.data?.message || 'Yetkili satıcı kayıtları alınamadı.'));
  }, [endpoint, storeId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!storeId) return null;

  function submit() {
    if (!form.evidence.trim()) {
      toast.error('Yetki belgesi bilgisi zorunludur.');
      return;
    }
    setLoading(true);
    axios
      .post(endpoint, {
        brand_id: form.brand_id ? Number(form.brand_id) : null,
        evidence: form.evidence.trim(),
        valid_from: form.valid_from || null,
        valid_to: form.valid_to || null,
      })
      .then((res) => {
        toast.success(res.data?.message || 'Kaydedildi.');
        setForm(emptyForm);
        load();
      })
      .catch((error) => toast.error(error?.response?.data?.message || 'Kaydedilemedi.'))
      .finally(() => setLoading(false));
  }

  function remove(id: number) {
    setLoading(true);
    axios
      .delete(`${endpoint}/${id}`)
      .then((res) => {
        toast.success(res.data?.message || 'Kaldırıldı.');
        load();
      })
      .catch((error) => toast.error(error?.response?.data?.message || 'Kaldırılamadı.'))
      .finally(() => setLoading(false));
  }

  return (
    <Card className="mt-4">
      <CardContent className="p-4 space-y-4">
        <div>
          <p className="text-lg md:text-2xl font-medium">Yetkili Satıcı Rozeti</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Rozet yalnız belgesi doğrulanmış yetkiler için açılmalıdır. Marka seçilmezse mağazanın tüm ürünleri
            &quot;Yetkili Satıcı&quot; rozeti alır; marka seçilirse yalnız o markanın ürünleri. Bitiş tarihi geçince
            rozet kendiliğinden kalkar.
          </p>
        </div>

        {items.length > 0 && (
          <ul className="divide-y rounded-lg border">
            {items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                <div>
                  <strong>{item.brand_name ?? 'Tüm mağaza'}</strong>
                  <span className={item.active ? 'ml-2 text-green-600' : 'ml-2 text-red-500'}>
                    {item.active ? 'Aktif' : 'Pasif / süresi dolmuş'}
                  </span>
                  <p className="text-muted-foreground">
                    {item.evidence}
                    {(item.valid_from || item.valid_to) &&
                      ` · ${item.valid_from ?? '…'} – ${item.valid_to ?? 'süresiz'}`}
                  </p>
                </div>
                <Button type="button" variant="outline" disabled={loading} onClick={() => remove(item.id)}>
                  Kaldır
                </Button>
              </li>
            ))}
          </ul>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={form.brand_id}
            onChange={(e) => setForm((prev) => ({ ...prev, brand_id: e.target.value }))}
          >
            <option value="">Tüm mağaza (marka seçmeden)</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.brand_name}
              </option>
            ))}
          </select>
          <Input
            placeholder="Yetki belgesi (belge no / dosya linki)"
            value={form.evidence}
            onChange={(e) => setForm((prev) => ({ ...prev, evidence: e.target.value }))}
          />
          <label className="text-sm">
            Başlangıç
            <Input
              type="date"
              value={form.valid_from}
              onChange={(e) => setForm((prev) => ({ ...prev, valid_from: e.target.value }))}
            />
          </label>
          <label className="text-sm">
            Bitiş (boş = süresiz)
            <Input
              type="date"
              value={form.valid_to}
              onChange={(e) => setForm((prev) => ({ ...prev, valid_to: e.target.value }))}
            />
          </label>
        </div>

        <Button type="button" onClick={submit} disabled={loading || !form.evidence.trim()}>
          {loading ? 'Kaydediliyor...' : 'Yetkiyi kaydet'}
        </Button>
      </CardContent>
    </Card>
  );
}
