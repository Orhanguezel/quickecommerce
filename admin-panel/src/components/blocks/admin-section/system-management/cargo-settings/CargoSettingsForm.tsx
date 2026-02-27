"use client";
import { SubmitButton } from "@/components/blocks/shared";
import { Card, CardContent, Input, Switch } from "@/components/ui";
import {
  useCargoSettingsMutation,
  useCargoSettingsQuery,
  useCreateSenderAddressMutation,
} from "@/modules/admin-section/cargo-settings/cargo-settings.action";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp, MapPin, Copy, Check } from "lucide-react";

const TR_CITIES = [
  { code: "01", name: "Adana" }, { code: "06", name: "Ankara" },
  { code: "07", name: "Antalya" }, { code: "16", name: "Bursa" },
  { code: "20", name: "Denizli" }, { code: "21", name: "Diyarbakır" },
  { code: "27", name: "Gaziantep" }, { code: "34", name: "Istanbul" },
  { code: "35", name: "Izmir" }, { code: "38", name: "Kayseri" },
  { code: "42", name: "Konya" }, { code: "44", name: "Malatya" },
  { code: "33", name: "Mersin" }, { code: "55", name: "Samsun" },
  { code: "63", name: "Sanliurfa" }, { code: "61", name: "Trabzon" },
];

const CargoSettingsForm = () => {
  const t = useTranslations();
  const { cargoSettingsData, refetch, isPending } = useCargoSettingsQuery();
  const { mutate: saveSettings, isPending: isSaving } = useCargoSettingsMutation();
  const { mutate: createAddress, isPending: isCreatingAddress } = useCreateSenderAddressMutation();

  const { register, setValue, handleSubmit } = useForm<{
    geliver_api_token: string;
    geliver_sender_address_id: string;
    geliver_webhook_header_name: string;
    geliver_webhook_header_secret: string;
  }>();

  const {
    register: regAddr,
    handleSubmit: handleAddrSubmit,
    watch: watchAddr,
    setValue: setAddrValue,
  } = useForm({
    defaultValues: {
      name: "SPORTOONLINE SPORTIF FAALIYETLER SANAYI VE TICARET LIMITED SIRKETI",
      email: "sportoonlinecom@gmail.com",
      phone: "05550907070",
      neighborhood: "Aksoy",
      address: "1671 Sokak No:151C",
      city_code: "35",
      city_name: "Izmir",
      district: "Karşıyaka",
      zip: "35000",
    },
  });

  const [testMode, setTestMode] = useState(false);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const webhookUrl = cargoSettingsData?.geliver_webhook_url || "";
  const selectedCityCode = watchAddr("city_code");

  useEffect(() => {
    if (cargoSettingsData) {
      setValue("geliver_api_token", cargoSettingsData.geliver_api_token || "");
      setValue("geliver_sender_address_id", cargoSettingsData.geliver_sender_address_id || "");
      setValue("geliver_webhook_header_name", cargoSettingsData.geliver_webhook_header_name || "");
      setValue("geliver_webhook_header_secret", cargoSettingsData.geliver_webhook_header_secret || "");
      setTestMode(cargoSettingsData.geliver_test_mode === "on");
    }
  }, [cargoSettingsData, setValue]);

  useEffect(() => {
    const city = TR_CITIES.find((c) => c.code === selectedCityCode);
    if (city) setAddrValue("city_name", city.name);
  }, [selectedCityCode, setAddrValue]);

  const onSubmit = (values: any) => {
    saveSettings(
      {
        geliver_api_token: values.geliver_api_token,
        geliver_sender_address_id: values.geliver_sender_address_id,
        geliver_test_mode: testMode ? "on" : "",
        geliver_webhook_header_name: values.geliver_webhook_header_name,
        geliver_webhook_header_secret: values.geliver_webhook_header_secret,
      },
      { onSuccess: () => refetch() }
    );
  };

  const onCreateAddress = (values: any) => {
    createAddress(values, {
      onSuccess: (data: any) => {
        const newId = data?.data?.data?.id;
        if (newId) setValue("geliver_sender_address_id", newId);
        setShowAddrForm(false);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="mt-4">
        <CardContent className="p-4 md:p-6 space-y-5">

          {/* Test Mode */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Test Modu (Gerçek kargo oluşturulmaz)
            </label>
            <Switch checked={testMode} onCheckedChange={setTestMode} />
            <p className="text-xs text-slate-500 mt-1">
              {testMode
                ? "Test modunda — gerçek kargo oluşturulmaz."
                : "Canlı mod — gerçek Geliver kargolar oluşturulur."}
            </p>
          </div>

          {/* API Token */}
          <div>
            <label className="text-sm font-medium mb-1 block">Geliver API Token</label>
            <Input
              {...register("geliver_api_token")}
              className="app-input"
              placeholder="Geliver API token buraya..."
              type="password"
              autoComplete="new-password"
            />
            <p className="text-xs text-slate-500 mt-1">
              Token almak için:{" "}
              <a
                href="https://app.geliver.io/apitokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                app.geliver.io/apitokens
              </a>
            </p>
          </div>

          {/* Sender Address ID */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Varsayılan Gönderici Adres ID
            </label>
            <div className="flex gap-2">
              <Input
                {...register("geliver_sender_address_id")}
                className="app-input flex-1 font-mono text-sm"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
              <button
                type="button"
                title="Kopyala"
                className="px-2 text-slate-400 hover:text-blue-500"
                onClick={() => {
                  const el = document.querySelector<HTMLInputElement>(
                    '[name="geliver_sender_address_id"]'
                  );
                  if (el?.value) {
                    navigator.clipboard.writeText(el.value);
                    setCopiedId(true);
                    setTimeout(() => setCopiedId(false), 2000);
                  }
                }}
              >
                {copiedId
                  ? <Check width={16} height={16} className="text-green-500" />
                  : <Copy width={16} height={16} />}
              </button>
            </div>

            {/* Adres Oluşturma Toggle */}
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-blue-500 hover:underline mt-2"
              onClick={() => setShowAddrForm((v) => !v)}
            >
              <MapPin width={12} height={12} />
              {showAddrForm ? "Formu Kapat" : "Geliver'da Yeni Adres Oluştur"}
              {showAddrForm
                ? <ChevronUp width={12} height={12} />
                : <ChevronDown width={12} height={12} />}
            </button>

            {/* Adres Formu */}
            {showAddrForm && (
              <div className="mt-3 border rounded-lg p-4 bg-slate-50 space-y-3">
                <p className="text-xs text-slate-500">
                  Geliver&apos;da yeni gönderici adresi oluşturur — ID otomatik dolar.
                  <br />
                  <strong>Not:</strong> Mahalle alanı Geliver tarafından zorunludur.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium mb-1 block">Kişi / Kurum Adı *</label>
                    <Input {...regAddr("name")} className="app-input text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">E-posta *</label>
                    <Input {...regAddr("email")} className="app-input text-sm" type="email" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Telefon *</label>
                    <Input {...regAddr("phone")} className="app-input text-sm" placeholder="05xxxxxxxxx" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">
                      Mahalle *{" "}
                      <span className="text-slate-400 font-normal">(sadece isim, &quot;Mahallesi&quot; yazma)</span>
                    </label>
                    <Input {...regAddr("neighborhood")} className="app-input text-sm" placeholder="Aksoy" />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Geliver&apos;a &quot;Aksoy Mahallesi, 1671 Sokak...&quot; formatında gönderilir
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Cadde / Sokak / No *</label>
                    <Input {...regAddr("address")} className="app-input text-sm" placeholder="1671 Sokak No:151C" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Şehir *</label>
                    <select
                      {...regAddr("city_code")}
                      className="w-full border rounded px-3 py-2 text-sm bg-white"
                    >
                      {TR_CITIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">İlçe *</label>
                    <Input {...regAddr("district")} className="app-input text-sm" placeholder="Karşıyaka" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Posta Kodu</label>
                    <Input {...regAddr("zip")} className="app-input text-sm" placeholder="35000" />
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
                  disabled={isCreatingAddress}
                  onClick={handleAddrSubmit(onCreateAddress)}
                >
                  {isCreatingAddress
                    ? "Geliver'da Oluşturuluyor..."
                    : "Geliver'da Adres Oluştur → ID Otomatik Dolar"}
                </button>
              </div>
            )}
          </div>

          {/* Webhook Settings */}
          <div className="border-t pt-5">
            <h3 className="text-sm font-semibold mb-3">Webhook Ayarları (Kargo Takip)</h3>

            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">Webhook URL</label>
              <div className="flex gap-2">
                <Input
                  className="app-input flex-1"
                  value={webhookUrl}
                  readOnly
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  type="button"
                  className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 whitespace-nowrap"
                  onClick={() => navigator.clipboard.writeText(webhookUrl)}
                >
                  Kopyala
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Bu URL&apos;yi Geliver webhook ayarlarına girin. Tip: TRACK_UPDATED
              </p>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">Webhook Header Name</label>
              <Input
                {...register("geliver_webhook_header_name")}
                className="app-input"
                placeholder="Ör: Sportoonline"
              />
              <p className="text-xs text-slate-500 mt-1">
                Geliver dashboard&apos;da webhook eklerken girdiğiniz Header Name
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Webhook Header Value (Secret)
              </label>
              <Input
                {...register("geliver_webhook_header_secret")}
                className="app-input"
                placeholder="Ör: gizli-anahtar-123"
                type="password"
                autoComplete="new-password"
              />
              <p className="text-xs text-slate-500 mt-1">
                Geliver dashboard&apos;da webhook eklerken girdiğiniz Header Value. Doğrulama için kullanılır.
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded p-3 text-sm text-blue-700">
            <strong>Kurye Akışı:</strong>
            <ol className="list-decimal list-inside mt-1 space-y-1">
              <li>Sipariş geldiğinde admin veya satıcı &quot;Kargo Oluştur&quot; butonuna tıklar</li>
              <li>Geliver otomatik olarak en ucuz teklifi seçer (Aras, Yurtiçi vb.)</li>
              <li>Barkod + etiket URL oluşturulur</li>
              <li>Geliver kargo durumu değişince webhook ile otomatik güncellenir</li>
              <li>Müşteri sipariş sayfasında takip numarasını görebilir</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4 sticky bottom-0 w-full p-4">
        <SubmitButton IsLoading={isSaving || isPending} AddLabel={t("button.save_changes")} />
      </Card>
    </form>
  );
};

export default CargoSettingsForm;
