"use client";
import { SubmitButton } from "@/components/blocks/shared";
import AppPhoneNumberInput from "@/components/blocks/common/AppPhoneNumberInput";
import { Input } from "@/components/ui";
import {
  useSellerStoreMutation,
  useSellerUpdateMutation,
} from "@/modules/admin-section/seller/seller.action";
import {
  SellerFormData,
  sellerSchema,
} from "@/modules/admin-section/seller/seller.schema";
import { useAppDispatch } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Building2, MapPin, CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function CreateOrUpdateSellerForm({ data }: any) {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [phoneNumber, setPhoneNumber] = useState("");
  const [on, setOn] = useState(false);
  const [onConfirm, setOnConfirm] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<SellerFormData>({
    resolver: zodResolver(sellerSchema),
    defaultValues: {
      business_type: "company",
    },
  });
  const businessType = watch("business_type") ?? "company";
  const isIndividual = businessType === "individual";

  useEffect(() => {
    if (data) {
      setValue("first_name", data.first_name ?? "");
      setValue("last_name", data.last_name ?? "");
      setValue("phone", data.phone ?? "");
      setPhoneNumber(data?.phone ?? "");
      setValue("email", data.email ?? "");
      // KYC fields
      setValue("business_type", data.business_type ?? "company");
      setValue("company_name", data.company_name ?? "");
      setValue("brand_name", data.brand_name ?? "");
      setValue("sector", data.sector ?? "");
      setValue("tax_office", data.tax_office ?? "");
      setValue("tax_number", data.tax_number ?? "");
      setValue("mersis_number", data.mersis_number ?? "");
      setValue("website_url", data.website_url ?? "");
      setValue("address_country", data.address_country ?? "Türkiye");
      setValue("address_city", data.address_city ?? "");
      setValue("address_district", data.address_district ?? "");
      setValue("address_postal_code", data.address_postal_code ?? "");
      setValue("address_line1", data.address_line1 ?? "");
      setValue("address_line2", data.address_line2 ?? "");
      setValue("bank_name", data.bank_name ?? "");
      setValue("bank_account_holder", data.bank_account_holder ?? "");
      setValue("bank_iban", data.bank_iban ?? "");
      setValue("bank_account_number", data.bank_account_number ?? "");
      setValue("bank_branch_code", data.bank_branch_code ?? "");
      setValue("bank_swift_code", data.bank_swift_code ?? "");
    }
  }, [data, setValue]);

  const { mutate: brandStore, isPending } = useSellerStoreMutation();
  const { mutate: brandUpdate, isPending: isUpdating } = useSellerUpdateMutation();

  const onSubmit = async (values: SellerFormData) => {
    if (!data && values?.password === "") {
      return toast.error(t("toast.please_enter_Password"));
    }
    const defaultData: any = {
      first_name:           values.first_name,
      last_name:            values.last_name,
      phone:                values.phone,
      email:                values.email,
      // KYC
      business_type:        values.business_type ?? "company",
      company_name:         values.company_name,
      brand_name:           values.brand_name,
      sector:               values.sector,
      tax_office:           values.tax_office,
      tax_number:           values.tax_number,
      mersis_number:        values.mersis_number,
      website_url:          values.website_url,
      address_country:      values.address_country,
      address_city:         values.address_city,
      address_district:     values.address_district,
      address_postal_code:  values.address_postal_code,
      address_line1:        values.address_line1,
      address_line2:        values.address_line2,
      bank_name:            values.bank_name,
      bank_account_holder:  values.bank_account_holder,
      bank_iban:            values.bank_iban,
      bank_account_number:  values.bank_account_number,
      bank_branch_code:     values.bank_branch_code,
      bank_swift_code:      values.bank_swift_code,
    };
    if (!data) {
      defaultData.password = values.password;
      defaultData.password_confirmation = values.password_confirmation;
    }

    const submissionData = { ...defaultData, id: data?.id };

    return data
      ? brandUpdate({ ...(submissionData as any) }, { onSuccess: () => { reset(); dispatch(setRefetch(true)); } })
      : brandStore({ ...(submissionData as any) }, { onSuccess: () => { reset(); dispatch(setRefetch(true)); } });
  };

  const field = (name: keyof SellerFormData, label: string, placeholder?: string, type = "text") => (
    <div>
      <p className="text-sm font-medium mb-1">{label}</p>
      <Input
        type={type}
        defaultValue={(data?.[name] as string) ?? ""}
        {...register(name)}
        className="app-input"
        placeholder={placeholder ?? label}
      />
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name]?.message as string}</p>
      )}
    </div>
  );

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div dir={dir} className="space-y-4">

          {/* ── Temel Bilgiler ── */}
          <div>
            <p className="text-sm font-medium mb-1">{t("label.first_name")}</p>
            <Input
              type="text"
              defaultValue={data?.first_name ?? ""}
              {...register("first_name")}
              className="app-input"
              placeholder={t("place_holder.enter_first_name")}
            />
            {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>}
          </div>

          <div>
            <p className="text-sm font-medium mb-1">{t("label.last_name")}</p>
            <Input
              type="text"
              defaultValue={data?.last_name ?? ""}
              {...register("last_name")}
              className="app-input"
              placeholder={t("place_holder.enter_last_name")}
            />
          </div>

          <div>
            <p className="text-sm font-medium mb-1">{t("label.email")}</p>
            <Input
              type="text"
              defaultValue={data?.email ?? ""}
              {...register("email")}
              className="app-input"
              placeholder={t("place_holder.enter_email")}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div className="mr-3">
            <p className="text-sm font-medium mb-1">{t("label.phone")}</p>
            <AppPhoneNumberInput
              value={phoneNumber}
              onChange={(value) => { setPhoneNumber(value); setValue("phone", value); }}
            />
          </div>

          {!data && (
            <>
              <div>
                <p className="text-sm font-medium mb-1">{t("label.password")}</p>
                <div className="relative">
                  <Input
                    type={on ? "text" : "password"}
                    maxLength={12}
                    {...register("password")}
                    className="app-input"
                    placeholder={t("place_holder.enter_password")}
                  />
                  <div className="absolute right-3 top-2 cursor-pointer" onClick={() => setOn(!on)}>
                    {on ? <Eye className="text-gray-500 dark:text-white w-5" /> : <EyeOff className="text-gray-500 dark:text-white w-5" />}
                  </div>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <p className="text-sm font-medium mb-1">{t("label.confirm_password")}</p>
                <div className="relative">
                  <Input
                    type={onConfirm ? "text" : "password"}
                    maxLength={12}
                    {...register("password_confirmation")}
                    className="app-input"
                    placeholder={t("place_holder.enter_confirm_password")}
                  />
                  <div className="absolute right-3 top-2 cursor-pointer" onClick={() => setOnConfirm(!onConfirm)}>
                    {onConfirm ? <Eye className="text-gray-500 dark:text-white w-5" /> : <EyeOff className="text-gray-500 dark:text-white w-5" />}
                  </div>
                </div>
                {errors.password_confirmation && <p className="text-red-500 text-sm mt-1">{errors.password_confirmation.message}</p>}
              </div>
            </>
          )}

          {/* ── KYC Accordion ── */}
          <Accordion type="multiple" defaultValue={["company"]} className="border rounded-lg mt-2">

            {/* Şirket Bilgileri */}
            <AccordionItem value="company">
              <AccordionTrigger className="px-4 py-3 text-sm font-semibold">
                <span className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Vergi / Kimlik Bilgileri</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Hesap Tipi</p>
                  <select
                    {...register("business_type")}
                    className="app-input"
                    value={businessType}
                    onChange={(event) => setValue("business_type", event.target.value as SellerFormData["business_type"])}
                  >
                    <option value="individual">Bireysel</option>
                    <option value="company">Şirket</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Bireysel hesapta TC kimlik numarası kullanılır. Şirket hesabına geçildiğinde vergi/MERSİS bilgileri tekrar incelenir.
                  </p>
                </div>
                {!isIndividual && field("company_name", "Şirket Adı", "Şirket Adı A.Ş.")}
                {field("brand_name", "Marka Adı", "Marka adı (varsa)")}
                {field("sector", "Sektör", "Spor, Tekstil...")}
                {!isIndividual && field("tax_office", "Vergi Dairesi", "Vergi dairesi adı")}
                {field("tax_number", isIndividual ? "TC Kimlik No" : "Vergi / TC No", isIndividual ? "11 haneli TC kimlik no" : "10 haneli vergi no veya 11 haneli TC")}
                {!isIndividual && field("mersis_number", "MERSİS No", "Şirketler için MERSİS numarası")}
                {field("website_url", "Web Sitesi", "https://...")}
              </AccordionContent>
            </AccordionItem>

            {/* Adres Bilgileri */}
            <AccordionItem value="address">
              <AccordionTrigger className="px-4 py-3 text-sm font-semibold">
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Adres Bilgileri</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-3">
                {field("address_country", "Ülke", "Türkiye")}
                <div className="grid grid-cols-2 gap-3">
                  {field("address_city", "Şehir", "İstanbul")}
                  {field("address_district", "İlçe", "Kadıköy")}
                </div>
                {field("address_postal_code", "Posta Kodu", "34710")}
                {field("address_line1", "Adres Satırı 1", "Mahalle, Sokak, No")}
                {field("address_line2", "Adres Satırı 2 (isteğe bağlı)", "Daire, Kat...")}
              </AccordionContent>
            </AccordionItem>

            {/* Banka Bilgileri */}
            <AccordionItem value="bank">
              <AccordionTrigger className="px-4 py-3 text-sm font-semibold">
                <span className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Banka Bilgileri</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-3">
                {field("bank_name", "Banka Adı", "Ziraat Bankası")}
                {field("bank_account_holder", "Hesap Sahibi", "Ad Soyad / Şirket Adı")}
                {field("bank_iban", "IBAN", "TR00 0000 0000 0000 0000 0000 00")}
                {field("bank_account_number", "Hesap Numarası (isteğe bağlı)", "")}
                <div className="grid grid-cols-2 gap-3">
                  {field("bank_branch_code", "Şube Kodu (isteğe bağlı)", "")}
                  {field("bank_swift_code", "SWIFT Kodu (isteğe bağlı)", "")}
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </div>

        <div className="col-span-2 mt-6">
          <SubmitButton
            UpdateData={data}
            IsLoading={isPending || isUpdating}
            AddLabel={t("button.add_seller")}
            UpdateLabel={t("button.update_seller")}
          />
        </div>
      </form>
    </div>
  );
}
