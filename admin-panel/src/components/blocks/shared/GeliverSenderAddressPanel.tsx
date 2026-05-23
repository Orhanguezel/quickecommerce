'use client';

import { Button, Card, CardContent, Input, Textarea } from '@/components/ui';
import { useBaseService } from '@/modules/core/base.service';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

type Props = {
  storeId?: string | number | null;
  endpoint: string;
  store?: any;
};

type FormState = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
};

const emptyForm: FormState = {
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  district: '',
};

export default function GeliverSenderAddressPanel({ storeId, endpoint, store }: Props) {
  const { getAxiosInstance } = useBaseService<any>(endpoint);
  const axios = getAxiosInstance();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [senderAddressId, setSenderAddressId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!storeId) return;

    setLoading(true);
    axios
      .get(endpoint)
      .then((res) => {
        const data = res.data?.data ?? {};
        const suggested = data.suggested ?? {};
        const firstName = suggested.first_name || store?.seller?.first_name || '';
        const lastName = suggested.last_name || store?.seller?.last_name || '';

        setSenderAddressId(data.geliver_sender_address_id || store?.geliver_sender_address_id || '');
        setForm({
          first_name: firstName,
          last_name: lastName,
          phone: suggested.phone || store?.phone || '',
          email: suggested.email || store?.email || '',
          address: suggested.address || store?.address || '',
          city: '',
          district: '',
        });
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || 'Geliver gönderici adres durumu alınamadı.');
      })
      .finally(() => setLoading(false));
  }, [endpoint, storeId]);

  if (!storeId) return null;

  const isComplete = Object.values(form).every((value) => value.trim().length > 0);

  function update(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function submit() {
    if (!isComplete) {
      toast.error('Geliver gönderici adresi için tüm alanlar zorunludur.');
      return;
    }

    setLoading(true);
    axios
      .post(endpoint, form)
      .then((res) => {
        const id = res.data?.data?.geliver_sender_address_id;
        if (id) setSenderAddressId(id);
        toast.success(res.data?.message || 'Geliver gönderici adresi kaydedildi.');
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || 'Geliver gönderici adresi kaydedilemedi.');
      })
      .finally(() => setLoading(false));
  }

  return (
    <Card className="mt-4">
      <CardContent className="p-4 space-y-4">
        <div>
          <p className="text-lg md:text-2xl font-medium">Geliver Gönderici Adresi</p>
          {senderAddressId ? (
            <p className="mt-1 text-sm text-green-600">Bağlı ID: {senderAddressId}</p>
          ) : (
            <p className="mt-1 text-sm text-red-500">Bu mağaza için Geliver sender address ID bağlı değil.</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input placeholder="Ad" value={form.first_name} onChange={(e) => update('first_name', e.target.value)} />
          <Input placeholder="Soyad" value={form.last_name} onChange={(e) => update('last_name', e.target.value)} />
          <Input placeholder="Telefon" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
          <Input placeholder="E-posta" value={form.email} onChange={(e) => update('email', e.target.value)} />
          <Input placeholder="İl" value={form.city} onChange={(e) => update('city', e.target.value)} />
          <Input placeholder="İlçe" value={form.district} onChange={(e) => update('district', e.target.value)} />
        </div>
        <Textarea placeholder="Adres" value={form.address} onChange={(e) => update('address', e.target.value)} />

        <Button type="button" onClick={submit} disabled={loading || !isComplete}>
          {loading ? 'Geliver kaydediliyor...' : 'Geliver sender address oluştur / bağla'}
        </Button>
      </CardContent>
    </Card>
  );
}
