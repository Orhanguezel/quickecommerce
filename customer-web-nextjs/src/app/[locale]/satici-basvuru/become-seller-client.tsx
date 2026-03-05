"use client";

import { Suspense, useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { ROUTES } from "@/config/routes";
import { getApiBaseUrl } from "@/lib/api-url";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { ChevronRight, Check, HelpCircle, MessageSquare, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { useSiteInfoQuery } from "@/modules/site/site.action";
import { useThemeConfig } from "@/modules/theme/use-theme-config";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface StepItem {
  title: string;
  subtitle: string;
  question?: string;
  answer?: string;
  image?: number;
  image_url?: string;
}

export interface BecomeSellerContent {
  login_register_section: {
    register_title: string;
    register_subtitle: string;
    login_title: string;
    login_subtitle: string;
    agree_button_title: string | null;
    social_button_enable_disable?: string | null;
    background_image: number;
    background_image_url: string;
  };
  on_board_section: {
    title: string;
    subtitle: string;
    steps: StepItem[];
  };
  video_section: {
    section_title: string;
    section_subtitle: string;
    video_url: string;
  };
  join_benefits_section: {
    title: string;
    subtitle: string;
    steps: StepItem[];
  };
  faq_section: {
    title: string;
    subtitle: string;
    steps: StepItem[];
  };
  contact_section: {
    title: string;
    subtitle: string;
    agree_button_title: string;
    image: number;
    image_url: string;
  };
}

interface BecomeSellerClientProps {
  content: BecomeSellerContent | null;
  translations: Record<string, string>;
}

interface SellerApplicationFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  company_name: string;
  brand_name: string;
  sector: string;
  tax_office: string;
  tax_number: string;
  mersis_number: string;
  website_url: string;
  country: string;
  city: string;
  district: string;
  postal_code: string;
  address_line1: string;
  address_line2: string;
  bank_name: string;
  bank_account_holder: string;
  iban: string;
  bank_account_number: string;
  bank_branch_code: string;
  swift_code: string;
  application_note: string;
  agree: boolean;
}

const sectorOptions = [
  "Gıda ve Market",
  "Tekstil ve Moda",
  "Elektronik",
  "Ev ve Yaşam",
  "Kozmetik ve Kişisel Bakım",
  "Spor ve Outdoor",
  "Anne & Bebek",
  "Hobi ve Oyuncak",
  "Otomotiv",
  "Diğer",
];

const inputClass =
  "mt-1 h-11 border-[#cfd8e3] bg-white focus-visible:ring-2 focus-visible:ring-primary/20";
const selectClass =
  "mt-1 flex h-11 w-full rounded-md border border-[#cfd8e3] bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20";
const textareaClass =
  "mt-1 w-full rounded-md border border-[#cfd8e3] bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20";

export function BecomeSellerClient({ content, translations: t }: BecomeSellerClientProps) {
  const router = useRouter();
  const { siteInfo } = useSiteInfoQuery();
  const { loginConfig, registerConfig } = useThemeConfig();

  const [formData, setFormData] = useState<SellerApplicationFormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    company_name: "",
    brand_name: "",
    sector: "",
    tax_office: "",
    tax_number: "",
    mersis_number: "",
    website_url: "",
    country: "Türkiye",
    city: "",
    district: "",
    postal_code: "",
    address_line1: "",
    address_line2: "",
    bank_name: "",
    bank_account_holder: "",
    iban: "",
    bank_account_number: "",
    bank_branch_code: "",
    swift_code: "",
    application_note: "",
    agree: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateFormField = <K extends keyof SellerApplicationFormData>(
    field: K,
    value: SellerApplicationFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const requiredTextFields: Array<[keyof SellerApplicationFormData, string]> = [
      ["first_name", "Ad"],
      ["email", "E-posta"],
      ["company_name", "Firma unvanı"],
      ["sector", "Sektör"],
      ["tax_number", "Vergi numarası"],
      ["city", "İl"],
      ["district", "İlçe"],
      ["address_line1", "Açık adres"],
      ["bank_name", "Banka adı"],
      ["bank_account_holder", "Hesap sahibi"],
      ["iban", "IBAN"],
    ];

    const missingField = requiredTextFields.find(([field]) => !String(formData[field]).trim());
    if (missingField) {
      setError(`${missingField[1]} alanı zorunludur.`);
      return;
    }

    if (!formData.agree) {
      setError(t.agree_required || "Şartları ve koşulları kabul etmelisiniz");
      return;
    }

    if (formData.password.length < 6) {
      setError(t.password_min || "Şifre en az 6 karakter olmalıdır");
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError(t.passwords_not_match || "Şifreler eşleşmiyor");
      return;
    }

    setLoading(true);

    try {
      const applicationDetails = {
        company_name: formData.company_name,
        brand_name: formData.brand_name,
        sector: formData.sector,
        tax_office: formData.tax_office,
        tax_number: formData.tax_number,
        mersis_number: formData.mersis_number,
        website_url: formData.website_url,
        address: {
          country: formData.country,
          city: formData.city,
          district: formData.district,
          postal_code: formData.postal_code,
          address_line1: formData.address_line1,
          address_line2: formData.address_line2,
        },
        bank: {
          bank_name: formData.bank_name,
          account_holder: formData.bank_account_holder,
          iban: formData.iban,
          account_number: formData.bank_account_number,
          branch_code: formData.bank_branch_code,
          swift_code: formData.swift_code,
        },
        note: formData.application_note,
      };

      const res = await fetch(
        `${getApiBaseUrl()}${API_ENDPOINTS.SELLER_REGISTER}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            password_confirmation: formData.password_confirmation,
            ...applicationDetails,
            application_details: applicationDetails,
          }),
        }
      );

      const data = await res.json();

      if (res.ok && data.status) {
        setSuccess(true);
      } else {
        if (data.errors) {
          const firstError = Object.values(data.errors).flat()[0];
          setError(String(firstError));
        } else if (data.message) {
          setError(data.message);
        } else if (typeof data === "object" && !Array.isArray(data)) {
          const firstError = Object.values(data).flat()[0];
          setError(String(firstError));
        } else {
          setError(t.registration_failed || "Kayıt başarısız oldu");
        }
      }
    } catch {
      setError(t.generic_error || "Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const login_register_section = content?.login_register_section;
  const on_board_section = content?.on_board_section;
  const video_section = content?.video_section;
  const join_benefits_section = content?.join_benefits_section;
  const faq_section = content?.faq_section;
  const contact_section = content?.contact_section;

  const sideImageUrl =
    login_register_section?.background_image_url ||
    registerConfig.imageUrl ||
    loginConfig.imageUrl ||
    "/images/reg_bg.png";

  const showGoogle = siteInfo?.com_google_login_enabled === "on";
  const showFacebook = siteInfo?.com_facebook_login_enabled === "on";
  const showSocialButtons =
    (showGoogle || showFacebook) &&
    login_register_section?.social_button_enable_disable !== "off";

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <div className="border-b bg-white/70 backdrop-blur-sm">
        <div className="container py-3">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href={ROUTES.HOME} className="hover:text-foreground">
              {t.home}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">{t.become_seller}</span>
          </nav>
        </div>
      </div>

      <section className="py-8 lg:py-12">
        <div className="container">
          <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_580px]">
            <div className="hidden lg:flex lg:justify-center">
              <div className="w-full max-w-[680px] rounded-2xl border border-[#dbe3f0] bg-white/60 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sideImageUrl}
                  alt={login_register_section?.register_title || t.register_title}
                  className="h-auto w-full rounded-xl object-contain"
                />
              </div>
            </div>

            <div className="rounded-xl border border-[#d5dbe7] bg-white p-5 shadow-sm md:p-7">
              {success ? (
                <div className="py-10 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold">{t.registration_success_title}</h3>
                  <p className="mt-2 text-muted-foreground">{t.registration_success_message}</p>
                  <Button className="mt-6" onClick={() => router.push(ROUTES.HOME)}>
                    {t.home}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-6 text-center">
                    <h1 className="text-3xl font-semibold leading-tight text-foreground">
                      {login_register_section?.register_title || t.register_title}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {login_register_section?.register_subtitle || t.register_subtitle}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="max-h-[62vh] space-y-5 overflow-y-auto pr-1">
                      <div className="space-y-4 rounded-lg border border-[#e6ebf3] p-4">
                        <h3 className="text-sm font-semibold text-foreground">Hesap Bilgileri</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label htmlFor="first_name">{t.first_name} *</Label>
                            <Input
                              id="first_name"
                              type="text"
                              required
                              value={formData.first_name}
                              onChange={(e) => updateFormField("first_name", e.target.value)}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <Label htmlFor="last_name">{t.last_name}</Label>
                            <Input
                              id="last_name"
                              type="text"
                              value={formData.last_name}
                              onChange={(e) => updateFormField("last_name", e.target.value)}
                              className={inputClass}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="phone">{t.phone}</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => updateFormField("phone", e.target.value)}
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <Label htmlFor="email">{t.email} *</Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => updateFormField("email", e.target.value)}
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <Label htmlFor="password">{t.password} *</Label>
                          <div className="relative mt-1">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              required
                              value={formData.password}
                              onChange={(e) => updateFormField("password", e.target.value)}
                              className={`${inputClass} pr-10`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="password_confirmation">{t.confirm_password} *</Label>
                          <div className="relative mt-1">
                            <Input
                              id="password_confirmation"
                              type={showConfirmPassword ? "text" : "password"}
                              required
                              value={formData.password_confirmation}
                              onChange={(e) => updateFormField("password_confirmation", e.target.value)}
                              className={`${inputClass} pr-10`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 rounded-lg border border-[#e6ebf3] p-4">
                        <h3 className="text-sm font-semibold text-foreground">Şirket ve Vergi Bilgileri</h3>
                        <div>
                          <Label htmlFor="company_name">Firma Unvanı *</Label>
                          <Input
                            id="company_name"
                            type="text"
                            value={formData.company_name}
                            onChange={(e) => updateFormField("company_name", e.target.value)}
                            className={inputClass}
                            required
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label htmlFor="brand_name">Mağaza/Marka Adı</Label>
                            <Input
                              id="brand_name"
                              type="text"
                              value={formData.brand_name}
                              onChange={(e) => updateFormField("brand_name", e.target.value)}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <Label htmlFor="sector">Sektör *</Label>
                            <select
                              id="sector"
                              required
                              value={formData.sector}
                              onChange={(e) => updateFormField("sector", e.target.value)}
                              className={selectClass}
                            >
                              <option value="">Sektör seçin</option>
                              {sectorOptions.map((sector) => (
                                <option key={sector} value={sector}>
                                  {sector}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label htmlFor="tax_office">Vergi Dairesi</Label>
                            <Input
                              id="tax_office"
                              type="text"
                              value={formData.tax_office}
                              onChange={(e) => updateFormField("tax_office", e.target.value)}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <Label htmlFor="tax_number">Vergi Numarası *</Label>
                            <Input
                              id="tax_number"
                              type="text"
                              required
                              value={formData.tax_number}
                              onChange={(e) => updateFormField("tax_number", e.target.value)}
                              className={inputClass}
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label htmlFor="mersis_number">MERSİS Numarası</Label>
                            <Input
                              id="mersis_number"
                              type="text"
                              value={formData.mersis_number}
                              onChange={(e) => updateFormField("mersis_number", e.target.value)}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <Label htmlFor="website_url">Web Sitesi</Label>
                            <Input
                              id="website_url"
                              type="url"
                              value={formData.website_url}
                              onChange={(e) => updateFormField("website_url", e.target.value)}
                              className={inputClass}
                              placeholder="https://"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 rounded-lg border border-[#e6ebf3] p-4">
                        <h3 className="text-sm font-semibold text-foreground">Adres Bilgileri</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label htmlFor="country">Ülke</Label>
                            <Input
                              id="country"
                              type="text"
                              value={formData.country}
                              onChange={(e) => updateFormField("country", e.target.value)}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <Label htmlFor="city">İl *</Label>
                            <Input
                              id="city"
                              type="text"
                              required
                              value={formData.city}
                              onChange={(e) => updateFormField("city", e.target.value)}
                              className={inputClass}
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label htmlFor="district">İlçe *</Label>
                            <Input
                              id="district"
                              type="text"
                              required
                              value={formData.district}
                              onChange={(e) => updateFormField("district", e.target.value)}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <Label htmlFor="postal_code">Posta Kodu</Label>
                            <Input
                              id="postal_code"
                              type="text"
                              value={formData.postal_code}
                              onChange={(e) => updateFormField("postal_code", e.target.value)}
                              className={inputClass}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="address_line1">Açık Adres *</Label>
                          <textarea
                            id="address_line1"
                            required
                            value={formData.address_line1}
                            onChange={(e) => updateFormField("address_line1", e.target.value)}
                            className={`${textareaClass} min-h-[90px]`}
                          />
                        </div>
                        <div>
                          <Label htmlFor="address_line2">Adres Satırı 2</Label>
                          <Input
                            id="address_line2"
                            type="text"
                            value={formData.address_line2}
                            onChange={(e) => updateFormField("address_line2", e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="space-y-4 rounded-lg border border-[#e6ebf3] p-4">
                        <h3 className="text-sm font-semibold text-foreground">Banka Bilgileri</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label htmlFor="bank_name">Banka Adı *</Label>
                            <Input
                              id="bank_name"
                              type="text"
                              required
                              value={formData.bank_name}
                              onChange={(e) => updateFormField("bank_name", e.target.value)}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <Label htmlFor="bank_account_holder">Hesap Sahibi *</Label>
                            <Input
                              id="bank_account_holder"
                              type="text"
                              required
                              value={formData.bank_account_holder}
                              onChange={(e) => updateFormField("bank_account_holder", e.target.value)}
                              className={inputClass}
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label htmlFor="iban">IBAN *</Label>
                            <Input
                              id="iban"
                              type="text"
                              required
                              value={formData.iban}
                              onChange={(e) => updateFormField("iban", e.target.value.toUpperCase())}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <Label htmlFor="bank_account_number">Hesap Numarası</Label>
                            <Input
                              id="bank_account_number"
                              type="text"
                              value={formData.bank_account_number}
                              onChange={(e) => updateFormField("bank_account_number", e.target.value)}
                              className={inputClass}
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label htmlFor="bank_branch_code">Şube Kodu</Label>
                            <Input
                              id="bank_branch_code"
                              type="text"
                              value={formData.bank_branch_code}
                              onChange={(e) => updateFormField("bank_branch_code", e.target.value)}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <Label htmlFor="swift_code">SWIFT Kodu</Label>
                            <Input
                              id="swift_code"
                              type="text"
                              value={formData.swift_code}
                              onChange={(e) => updateFormField("swift_code", e.target.value.toUpperCase())}
                              className={inputClass}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="application_note">Ek Not</Label>
                        <textarea
                          id="application_note"
                          value={formData.application_note}
                          onChange={(e) => updateFormField("application_note", e.target.value)}
                          className={`${textareaClass} min-h-[80px]`}
                          placeholder="Satış yapmak istediğiniz ürün grupları, operasyon notları vb."
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-start gap-2">
                      <Checkbox
                        id="agree"
                        checked={formData.agree}
                        onCheckedChange={(checked) => updateFormField("agree", !!checked)}
                      />
                      <label htmlFor="agree" className="cursor-pointer text-sm leading-tight">
                        {t.agree_terms}
                      </label>
                    </div>

                    {error && (
                      <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                      </p>
                    )}

                    <Button type="submit" className="h-11 w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t.registering}
                        </>
                      ) : (
                        t.create_seller_account
                      )}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      {t.already_have_account}{" "}
                      <Link href={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
                        {t.login}
                      </Link>
                    </p>
                  </form>

                  {showSocialButtons && (
                    <div className="mt-4">
                      <Suspense>
                        <SocialLoginButtons
                          translations={{
                            or: t.or || "Or",
                            google: t.google || "Sign in with Google",
                            facebook: t.facebook || "Sign in with Facebook",
                            social_error: t.social_error || "Social login failed",
                          }}
                          showGoogle={showGoogle}
                          showFacebook={showFacebook}
                        />
                      </Suspense>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {on_board_section && on_board_section.steps?.length > 0 && (
        <section className="border-b bg-background py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">{on_board_section.title}</h2>
              <p className="mt-2 text-muted-foreground">{on_board_section.subtitle}</p>
            </div>
            <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {on_board_section.steps.map((step, i) => (
                <div key={i} className="rounded-lg border p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {i + 1}
                  </div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {video_section?.video_url && (
        <section className="border-b bg-muted/30 py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">{video_section.section_title}</h2>
              <p className="mt-2 text-muted-foreground">{video_section.section_subtitle}</p>
            </div>
            <div className="mx-auto mt-8 max-w-4xl">
              <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                <iframe
                  src={video_section.video_url.replace("watch?v=", "embed/")}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {join_benefits_section && join_benefits_section.steps?.length > 0 && (
        <section className="border-b bg-background py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">{join_benefits_section.title}</h2>
              <p className="mt-2 text-muted-foreground">{join_benefits_section.subtitle}</p>
            </div>
            <div className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {join_benefits_section.steps.map((benefit, i) => (
                <div key={i} className="rounded-lg border p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{benefit.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{benefit.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {faq_section && faq_section.steps?.length > 0 && (
        <section className="border-b bg-muted/30 py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">{faq_section.title}</h2>
              <p className="mt-2 text-muted-foreground">{faq_section.subtitle}</p>
            </div>
            <div className="mx-auto mt-8 max-w-3xl">
              <Accordion type="single" collapsible className="space-y-3">
                {faq_section.steps.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    className="rounded-lg border bg-background px-6"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <span className="text-left font-medium">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      )}

      <section className="bg-background py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">{contact_section?.title || t.contact_title}</h2>
            <p className="mt-2 text-muted-foreground">{contact_section?.subtitle || t.contact_subtitle}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href={ROUTES.CONTACT}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {t.contact_us}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={ROUTES.ABOUT}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  {t.more_info}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
