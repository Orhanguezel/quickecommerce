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
    label: '1 TL alışveriş kaç puan kazandırsın',
    help: '0,01 yazarsanız 100 TL alışveriş 1 puan kazandırır. Puan, sipariş TESLİM EDİLDİĞİNDE yazılır — ödendiğinde değil. Aşağıdaki özet kutusu bu oranın ne demek olduğunu yazıyor.',
    section: 'earn',
  },
  {
    key: 'com_loyalty_review_bonus_with_image',
    label: 'Fotoğraflı değerlendirmeye kaç puan',
    help: '1 puan = 1 TL olduğu için buraya yazdığınız sayı doğrudan TL karşılığıdır. Yıldız sayısından BAĞIMSIZ verilir, her ürün için bir kez.',
    section: 'earn',
  },
  {
    key: 'com_loyalty_review_bonus_no_image',
    label: 'Fotoğrafsız değerlendirmeye kaç puan',
    help: 'Fotoğraflıdan düşük olmalı — amaç fotoğraflı değerlendirmeyi teşvik etmek. Aynı ürün tekrar alınsa da ikinci bonus verilmez.',
    section: 'earn',
  },
  {
    key: 'com_loyalty_review_max_per_order',
    label: 'Bir siparişte en fazla kaç ürün puan kazandırsın',
    help: '10 ürünlük bir sepette 10 bonus ödememek için üst sınır. 3 yazarsanız o siparişten en fazla 3 değerlendirme puan kazandırır.',
    section: 'earn',
  },
  {
    key: 'com_loyalty_hold_days',
    label: 'Puan bekleme süresi (gün)',
    help: 'Kazanılan puan bu süre boyunca beklemede kalır, sonra kullanıma açılır. İade gelirse puan henüz harcanamadığı için temiz şekilde geri alınır. Varsayılan 14 gün = cayma hakkı süresi.',
    section: 'earn',
  },
  {
    key: 'com_loyalty_points_expire_days',
    label: 'Puan geçerlilik süresi (gün)',
    help: 'Puan, kullanıma açıldıktan sonra kaç gün geçerli olacak. Bekleme süresi bu süreden düşülmez.',
    section: 'earn',
  },
  {
    key: 'com_loyalty_redeem_points_per_unit',
    label: 'Kaç puan',
    help: 'Bu iki alan birlikte puanın kurudur. İKİSİNE DE 1 yazın — böylece 1 puan = 1 TL olur ve kimsenin kafası karışmaz. Farklı yaparsanız müşteri ekranda gördüğü puanın kaç TL ettiğini hesaplamak zorunda kalır.',
    section: 'redeem',
  },
  {
    key: 'com_loyalty_redeem_value',
    label: '...kaç TL eder',
    help: 'Üstteki alanla birlikte okunur. İkisi de 1 iken 1 puan = 1 TL. Bu kuru değiştirmek BİRİKMİŞ puanların değerini de değiştirir — duyurmadan yapmayın.',
    section: 'redeem',
  },
  {
    key: 'com_loyalty_min_redeem_points',
    label: 'Çek almak için en az kaç puan gerekli',
    help: 'Çok düşük tutarlı çek üretilmesini engeller. Müşterinin bu puana ulaşmak için kaç TL alışveriş yapması gerektiğini özet kutusunda yazıyor.',
    section: 'redeem',
  },
  {
    key: 'com_loyalty_voucher_min_order',
    label: 'Çek en az kaç TL\'lik sepette kullanılabilsin',
    help: 'Asıl fren budur: 25 TL\'lik çek 500 TL sepette kullanılırsa indirim %5\'te kalır. Düşürürseniz çekin gerçek maliyeti artar.',
    section: 'redeem',
  },
  {
    key: 'com_loyalty_voucher_valid_days',
    label: 'Çek kaç gün geçerli olsun',
    help: 'Müşteri puanını çeke çevirdiği andan itibaren sayılır. Kısa tutmak çekin kullanılmadan sönmesine, uzun tutmak yükümlülüğün birikmesine yol açar.',
    section: 'redeem',
  },
  {
    key: 'com_review_invite_window_days',
    label: 'Değerlendirme daveti kaç gün içinde gönderilsin',
    help: 'Teslimattan sonra bu süre içinde müşteriye "ürünü değerlendirin" e-postası gider. Bu ayar puanla ilgili değildir, sadece davetin zamanlamasıdır.',
    section: 'other',
  },
];

/**
 * Ayar veritabaninda yoksa formda gosterilecek deger. Backend'deki varsayilanla
 * AYNI olmalidir (LoyaltyService::holdDays).
 */
const FIELD_DEFAULTS: Partial<Record<keyof LoyaltySettingsFormData, string>> = {
  com_loyalty_hold_days: '14',
};

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
      // Sunucu bu ayari hic yazilmamissa bos doner ama servis varsayilani
      // uygular. Formu bos birakmak yoneticiye "bekleme yok" izlenimi verirdi.
      setValue(key, settings?.[key] ?? FIELD_DEFAULTS[key] ?? '');
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

  const holdRaw = watch('com_loyalty_hold_days');
  const holdDays = holdRaw === undefined || holdRaw === '' ? 14 : Number(holdRaw);

  // --- Yoneticinin ayarlari SOYUT degil kendi rakamlariyla gormesi icin.
  // "2500 puan gerekli" tek basina bir sey soylemez; "ortalama sepetiniz
  // 2.473 TL, yani kabaca bir siparis" soyler.
  const bonusImg = Number(watch('com_loyalty_review_bonus_with_image')) || 0;
  const bonusNoImg = Number(watch('com_loyalty_review_bonus_no_image')) || 0;
  const minRedeem = Number(watch('com_loyalty_min_redeem_points')) || 0;
  const voucherMin = Number(watch('com_loyalty_voucher_min_order')) || 0;
  const voucherDays = Number(watch('com_loyalty_voucher_valid_days')) || 0;
  const maxPerOrder = Number(watch('com_loyalty_review_max_per_order')) || 0;

  /** Puanin TL karsiligi — backend'deki pointsToCurrency ile ayni formul. */
  const toTL = (points: number) =>
    perUnit > 0 ? (points / perUnit) * unitValue : 0;

  const tl = (n: number) =>
    `${n.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} TL`;

  /** Puan ve TL birebir mi — oyleyse tum aciklamalar sadelesir. */
  const oneToOne = perUnit === 1 && unitValue === 1;

  /** 1 puan kazanmak icin kac TL harcamak gerekiyor. */
  const spendPerPoint = earnRate > 0 ? 1 / earnRate : 0;
  /** Minimum ceke ulasmak icin gereken alisveris. */
  const spendForVoucher = earnRate > 0 ? minRedeem / earnRate : 0;

  const avgOrder = Number(summary?.avg_order_value) || 0;
  const itemsPerOrder = Number(summary?.items_per_order) || 0;
  /** Ortalama sepette tek siparisten cikabilecek en yuksek puan maliyeti. */
  const worstCase = avgOrder * earnRate + bonusImg * maxPerOrder;
  const typicalCase =
    avgOrder * earnRate + bonusImg * Math.max(1, Math.round(itemsPerOrder));

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
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
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
                    <p className="text-xs text-gray-500">Bekleyen puan</p>
                    <p className="text-lg font-bold text-blue-600">
                      {summary.points_pending?.toLocaleString('tr-TR') ?? 0}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      İade gelirse geri alınabilir kısım
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

          {/* Bu ayarlarla ne oluyor — formun en ustunde, HER ZAMAN acik.
              Katlanan rehber detay icindir; bu kutu "ne yaptigimi anlamiyorum"
              sorununu cozmek icin var. */}
          <Card className="mt-4 border-blue-300 dark:border-blue-800">
            <CardContent className="p-3 md:p-5">
              <h3 className="mb-1 text-base font-semibold text-blue-700 dark:text-blue-400">
                Şu anki ayarlarla ne oluyor?
              </h3>
              <p className="mb-4 text-xs text-gray-500">
                Aşağıdaki alanları değiştirdikçe bu kutu anında güncellenir.
                Kaydetmeden önce buradaki cümleleri okuyun.
              </p>

              <div className="space-y-4 text-sm">
                <div className="rounded-lg border p-3">
                  <p className="mb-2 font-semibold">Puanın değeri</p>
                  {oneToOne ? (
                    <p className="text-green-700 dark:text-green-400">
                      <strong>1 puan = 1 TL.</strong> Müşteri ekranda kaç puan
                      görüyorsa o kadar TL demektir; kimsenin hesap yapması
                      gerekmiyor.
                    </p>
                  ) : (
                    <p className="text-amber-700 dark:text-amber-400">
                      <strong>
                        {perUnit.toLocaleString('tr-TR')} puan ={' '}
                        {tl(unitValue)}
                      </strong>{' '}
                      — yani 1 puan = {tl(toTL(1))}. Müşteri gördüğü puanın kaç TL
                      ettiğini hesaplamak zorunda. Karışıklığı önlemek için iki
                      alana da 1 yazıp puanı TL ile eşitleyebilirsiniz.
                    </p>
                  )}
                </div>

                <div className="rounded-lg border p-3">
                  <p className="mb-2 font-semibold">Müşteri nasıl kazanıyor?</p>
                  <ul className="list-disc space-y-1 pl-5 text-gray-700 dark:text-gray-300">
                    {earnRate > 0 && (
                      <li>
                        Her <strong>{tl(spendPerPoint)}</strong> alışverişte{' '}
                        <strong>1 puan</strong>. Örnek: 1.000 TL&apos;lik sipariş{' '}
                        <strong>
                          {Math.floor(1000 * earnRate).toLocaleString('tr-TR')} puan
                        </strong>{' '}
                        ({tl(toTL(Math.floor(1000 * earnRate)))}) kazandırır.
                      </li>
                    )}
                    <li>
                      Puan <strong>teslimatta</strong> yazılır, ödemede değil.
                      {holdDays > 0 && (
                        <>
                          {' '}
                          Sonra <strong>{holdDays} gün</strong> beklemede kalır;
                          bu sürede iade gelirse puan temiz şekilde geri alınır.
                        </>
                      )}
                    </li>
                    <li>
                      Fotoğraflı değerlendirme <strong>{tl(toTL(bonusImg))}</strong>,
                      fotoğrafsız <strong>{tl(toTL(bonusNoImg))}</strong> — her ürün
                      için <strong>bir kez</strong>, bir siparişte en fazla{' '}
                      <strong>{maxPerOrder} ürün</strong>.
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border p-3">
                  <p className="mb-2 font-semibold">Müşteri nasıl kullanıyor?</p>
                  <ul className="list-disc space-y-1 pl-5 text-gray-700 dark:text-gray-300">
                    <li>
                      Çek almak için <strong>{minRedeem.toLocaleString('tr-TR')} puan</strong>{' '}
                      gerekiyor → <strong>{tl(toTL(minRedeem))} indirim çeki</strong>.
                      {earnRate > 0 && (
                        <>
                          {' '}
                          Bunun için <strong>{tl(spendForVoucher)}</strong> alışveriş
                          yapması lazım
                          {avgOrder > 0 && (
                            <>
                              {' '}
                              — ortalama sepetiniz {tl(avgOrder)}, yani kabaca{' '}
                              <strong>
                                {(spendForVoucher / avgOrder).toLocaleString('tr-TR', {
                                  maximumFractionDigits: 1,
                                })}{' '}
                                sipariş
                              </strong>
                            </>
                          )}
                          .
                        </>
                      )}
                    </li>
                    <li>
                      Çek yalnızca <strong>{tl(voucherMin)}</strong> ve üzeri
                      sepetlerde, <strong>{voucherDays} gün</strong> boyunca
                      kullanılabilir.
                      {voucherMin > 0 && minRedeem > 0 && (
                        <>
                          {' '}
                          Yani {tl(toTL(minRedeem))}&apos;lik çek en kötü ihtimalle{' '}
                          <strong>
                            %
                            {((toTL(minRedeem) / voucherMin) * 100).toLocaleString(
                              'tr-TR',
                              { maximumFractionDigits: 1 },
                            )}
                          </strong>{' '}
                          indirim demek.
                        </>
                      )}
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border border-orange-300 bg-orange-50 p-3 dark:border-orange-900 dark:bg-orange-950/20">
                  <p className="mb-2 font-semibold text-orange-800 dark:text-orange-400">
                    Size maliyeti
                  </p>
                  <ul className="list-disc space-y-1 pl-5 text-orange-900 dark:text-orange-300">
                    {givebackPct && (
                      <li>
                        Alışveriş puanı: <strong>ciro üzerinden %{givebackPct}</strong>.
                        Bu oran platform komisyonunuzun altında kalmalı, yoksa her
                        sipariş zararına çalışır. (Üst sınır %20; aşan ayar sunucu
                        tarafından reddedilir.)
                      </li>
                    )}
                    {avgOrder > 0 && (
                      <li>
                        Ortalama {tl(avgOrder)}&apos;lik siparişinizde tipik maliyet{' '}
                        <strong>{tl(typicalCase)}</strong> (
                        {((typicalCase / avgOrder) * 100).toLocaleString('tr-TR', {
                          maximumFractionDigits: 1,
                        })}
                        %), müşteri {maxPerOrder} ürünü de fotoğraflı
                        değerlendirirse en fazla <strong>{tl(worstCase)}</strong> (
                        {((worstCase / avgOrder) * 100).toLocaleString('tr-TR', {
                          maximumFractionDigits: 1,
                        })}
                        %).
                        {itemsPerOrder > 0 && (
                          <>
                            {' '}
                            Şu an sipariş başına ortalama{' '}
                            {itemsPerOrder.toLocaleString('tr-TR')} ürün var, o yüzden
                            gerçek maliyet tipik rakama yakın olur.
                          </>
                        )}
                      </li>
                    )}
                    <li>
                      Değerlendirme bonusu <strong>ürün başına bir kez</strong>{' '}
                      verildiği için tekrarlayan bir gider değil; asıl büyüyen kalem
                      alışveriş puanıdır.
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

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

              {holdDays === 0 && (
                <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                  <strong>Bekleme süresi 0.</strong> Puan teslimatın hemen ardından
                  kullanıma açılır; müşteri aynı gün çeke çevirip harcayabilir. Sonradan
                  gelen iadede geri alınacak puan kalmayabilir — bu durumda sistem
                  müşteriye borç çıkarmaz, geri alma kalan bakiye kadar kırpılır ve
                  fark mağazanın üzerinde kalır. Cayma hakkı süresi olan 14 gün önerilir.
                </div>
              )}
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
