'use client';
import { SubmitButton } from '@/components/blocks/shared';
import CardSkletonLoader from '@/components/molecules/CardSkletonLoader';
import { Card, CardContent, Input, Switch } from '@/components/ui';
import {
  useLoyaltySettingsQuery,
  useLoyaltySettingsStoreMutation,
  useLoyaltySummaryQuery,
} from '@/modules/admin-section/loyalty-settings/loyalty-settings.action';
import {
  LoyaltySettingsFormData,
  loyaltySettingsSchema,
} from '@/modules/admin-section/loyalty-settings/loyalty-settings.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

type ToggleState = {
  enabled: string;
  redeem_enabled: string;
};

/** Sayisal alanlar: anahtar + etiket + yardim metni. */
const NUMERIC_FIELDS: {
  key: keyof LoyaltySettingsFormData;
  label: string;
  help: string;
  section: 'earn' | 'redeem' | 'other';
}[] = [
  {
    key: 'com_loyalty_earn_per_currency',
    label: '1 TL kaç puan',
    help: 'Sipariş TESLİM EDİLDİĞİNDE yazılır, ödendiğinde değil.',
    section: 'earn',
  },
  {
    key: 'com_loyalty_review_bonus_with_image',
    label: 'Görselli değerlendirme bonusu (puan)',
    help: 'Değerlendirme onaylandığında verilir. Yıldız sayısından BAĞIMSIZ, ÜRÜN BAŞINA bir kez.',
    section: 'earn',
  },
  {
    key: 'com_loyalty_review_bonus_no_image',
    label: 'Görselsiz değerlendirme bonusu (puan)',
    help: 'Ürün başına bir kez; aynı ürün tekrar alınsa da ikinci bonus verilmez.',
    section: 'earn',
  },
  {
    key: 'com_loyalty_review_max_per_order',
    label: 'Sipariş başına en fazla kaç değerlendirme puan kazandırsın',
    help: 'Çok kalemli sepette bonusun marjı yemesini engeller.',
    section: 'earn',
  },
  {
    key: 'com_loyalty_points_expire_days',
    label: 'Puan geçerlilik süresi (gün)',
    help: 'Kazanılan puanın kaç gün sonra geçersiz olacağı.',
    section: 'earn',
  },
  {
    key: 'com_loyalty_redeem_points_per_unit',
    label: 'Kaç puan = 1 birim',
    help: 'Örn. 1000 puan = 10 TL için buraya 1000 yazın.',
    section: 'redeem',
  },
  {
    key: 'com_loyalty_redeem_value',
    label: 'Birimin TL karşılığı',
    help: 'Örn. 1000 puan = 10 TL için buraya 10 yazın.',
    section: 'redeem',
  },
  {
    key: 'com_loyalty_min_redeem_points',
    label: 'Minimum bozdurma (puan)',
    help: 'Bu puanın altında çek oluşturulamaz.',
    section: 'redeem',
  },
  {
    key: 'com_loyalty_voucher_min_order',
    label: 'Çekin minimum sepet tutarı (TL)',
    help: 'Çek yalnızca bu tutarın üzerindeki sepetlerde kullanılabilir.',
    section: 'redeem',
  },
  {
    key: 'com_loyalty_voucher_valid_days',
    label: 'Çek geçerlilik süresi (gün)',
    help: 'Oluşturulan çekin kaç gün geçerli olacağı.',
    section: 'redeem',
  },
  {
    key: 'com_review_invite_window_days',
    label: 'Değerlendirme daveti penceresi (gün)',
    help: 'Teslimattan sonra kaç gün içinde davet e-postası gönderilsin.',
    section: 'other',
  },
];

const LoyaltySettingsForm = () => {
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const { register, setValue, handleSubmit, watch } = useForm<LoyaltySettingsFormData>({
    resolver: zodResolver(loyaltySettingsSchema),
  });

  const [toggles, setToggles] = useState<ToggleState>({
    enabled: '',
    redeem_enabled: 'on',
  });

  const {
    LoyaltySettingsData,
    refetch,
    isPending: isQuerying,
    error,
  } = useLoyaltySettingsQuery({});
  const { summary, refetch: refetchSummary } = useLoyaltySummaryQuery();

  const settings = useMemo(
    () => (LoyaltySettingsData as any)?.data ?? null,
    [LoyaltySettingsData],
  );

  useEffect(() => {
    if (!settings) return;

    NUMERIC_FIELDS.forEach(({ key }) => {
      setValue(key, settings?.[key] ?? '');
    });

    setToggles({
      enabled: settings?.com_loyalty_enabled === 'on' ? 'on' : '',
      // Varsayilan acik: yalnizca acikca 'off' ise kapali.
      redeem_enabled: settings?.com_loyalty_redeem_enabled === 'off' ? '' : 'on',
    });
  }, [settings, setValue]);

  const handleToggle = (property: keyof ToggleState) => {
    setToggles((prev) => ({
      ...prev,
      [property]: prev[property] === 'on' ? '' : 'on',
    }));
  };

  const { mutate: storeSettings, isPending } = useLoyaltySettingsStoreMutation();

  const onSubmit = async (values: LoyaltySettingsFormData) => {
    const submissionData: Record<string, string> = {
      com_loyalty_enabled: toggles.enabled === 'on' ? 'on' : 'off',
      com_loyalty_redeem_enabled: toggles.redeem_enabled === 'on' ? 'on' : 'off',
    };

    NUMERIC_FIELDS.forEach(({ key }) => {
      const value = values[key];
      if (value !== undefined && value !== '') {
        submissionData[key] = String(value);
      }
    });

    return storeSettings(submissionData as any, {
      onSuccess: () => {
        refetch();
        refetchSummary();
      },
    });
  };

  useEffect(() => {
    if (!isQuerying && !error) refetch();
  }, [isQuerying, refetch, error]);

  // Canli onizleme: girilen oranla ortalama sepet ne kadar geri verir.
  const perUnit = Number(watch('com_loyalty_redeem_points_per_unit')) || 0;
  const unitValue = Number(watch('com_loyalty_redeem_value')) || 0;
  const earnRate = Number(watch('com_loyalty_earn_per_currency')) || 0;
  const givebackPct =
    perUnit > 0 && earnRate > 0 ? ((unitValue / perUnit) * earnRate * 100).toFixed(2) : null;

  // Fotografli yorum bonusunun TL karsiligi — puan degeri tek basina anlamsiz.
  const reviewBonusPoints = Number(watch('com_loyalty_review_bonus_with_image')) || 0;
  const reviewBonusValue =
    perUnit > 0 && reviewBonusPoints > 0
      ? ((reviewBonusPoints / perUnit) * unitValue).toFixed(2)
      : null;

  const renderField = (field: (typeof NUMERIC_FIELDS)[number]) => (
    <div key={field.key}>
      <label htmlFor={field.key} className="text-sm font-medium mb-1 block">
        {field.label}
      </label>
      <Input
        id={field.key}
        type="number"
        step="any"
        {...register(field.key)}
        className="app-input"
      />
      <p className="mt-1 text-xs text-gray-500">{field.help}</p>
    </div>
  );

  return (
    <div>
      {isQuerying ? (
        <CardSkletonLoader />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Durum ozeti */}
          {summary && (
            <Card className="mt-4">
              <CardContent className="p-2 md:p-4">
                <h3 className="text-base font-semibold mb-3">Program Durumu</h3>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-gray-500">Dağıtılan puan</p>
                    <p className="text-lg font-bold">{summary.points_earned?.toLocaleString('tr-TR')}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-gray-500">Harcanan puan</p>
                    <p className="text-lg font-bold">{summary.points_spent?.toLocaleString('tr-TR')}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-gray-500">Açık yükümlülük</p>
                    <p className="text-lg font-bold text-orange-600">
                      {summary.outstanding_liability} TL
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Bugün herkes bozdursa verilecek indirim
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-gray-500">Çek (üretilen / kullanılan)</p>
                    <p className="text-lg font-bold">
                      {summary.vouchers_created} / {summary.vouchers_used}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Anahtarlar */}
          <Card className="mt-4">
            <CardContent className="p-2 md:p-4">
              <h3 className="text-base font-semibold mb-4">Açma / Kapama</h3>
              <div dir={dir} className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                <div>
                  <div className="flex items-start gap-4">
                    <label className="text-sm font-medium">Puan kazanımı</label>
                    <Switch
                      dir="ltr"
                      checked={toggles.enabled === 'on'}
                      onCheckedChange={() => handleToggle('enabled')}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Kapatıldığında yeni puan kazanılmaz.
                  </p>
                </div>

                <div>
                  <div className="flex items-start gap-4">
                    <label className="text-sm font-medium">Puan kullanımı</label>
                    <Switch
                      dir="ltr"
                      checked={toggles.redeem_enabled === 'on'}
                      onCheckedChange={() => handleToggle('redeem_enabled')}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    <strong>Ayrı anahtar.</strong> Programı kapatırken önce kazanımı
                    durdurun, birikmiş puanların kullanımını bir süre açık bırakın —
                    puan müşteriye verilmiş bir sözdür.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kazanma */}
          <Card className="mt-4">
            <CardContent className="p-2 md:p-4">
              <h3 className="text-base font-semibold mb-4">Kazanma</h3>
              <div dir={dir} className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
                {NUMERIC_FIELDS.filter((f) => f.section === 'earn').map(renderField)}
              </div>
            </CardContent>
          </Card>

          {/* Harcama */}
          <Card className="mt-4">
            <CardContent className="p-2 md:p-4">
              <h3 className="text-base font-semibold mb-4">Harcama</h3>
              <div dir={dir} className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
                {NUMERIC_FIELDS.filter((f) => f.section === 'redeem').map(renderField)}
              </div>

              {givebackPct && (
                <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
                  <p>
                    Alışveriş puanı müşteriye{' '}
                    <strong>ciro üzerinden %{givebackPct}</strong> geri verir.
                    Platform komisyonunuzun altında kalmalı.
                  </p>
                  {reviewBonusValue !== null && (
                    <p className="mt-1">
                      Buna ek olarak her fotoğraflı değerlendirme{' '}
                      <strong>{reviewBonusValue} TL</strong> maliyet yaratır (ürün
                      başına bir kez, sipariş başına en fazla{' '}
                      {watch('com_loyalty_review_max_per_order') || 3} adet).
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Üst sınır %20; aşan ayarlar sunucu tarafından reddedilir.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Diger */}
          <Card className="mt-4">
            <CardContent className="p-2 md:p-4">
              <h3 className="text-base font-semibold mb-4">Değerlendirme Daveti</h3>
              <div dir={dir} className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
                {NUMERIC_FIELDS.filter((f) => f.section === 'other').map(renderField)}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4 sticky bottom-0 w-full p-4">
            <SubmitButton IsLoading={isPending} AddLabel="Değişiklikleri Kaydet" />
          </Card>
        </form>
      )}
    </div>
  );
};

export default LoyaltySettingsForm;
