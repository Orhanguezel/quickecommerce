"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { ROUTES } from "@/config/routes";
import { ChevronRight, Check, Play, HelpCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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

interface BecomeSellerContent {
  login_register_section: {
    register_title: string;
    register_subtitle: string;
    login_title: string;
    login_subtitle: string;
    agree_button_title: string | null;
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
  translations: {
    home: string;
    becomeSeller: string;
  };
}

export function BecomeSellerClient({ content, translations: t }: BecomeSellerClientProps) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    agree: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.agree) {
      setError("Şartları ve koşulları kabul etmelisiniz");
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError("Şifreler eşleşmiyor");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/seller/registration`,
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
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        // Redirect to seller panel or show success
        window.location.href = "/seller/dashboard";
      } else {
        setError(data.message || "Kayıt başarısız oldu");
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  if (!content) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground">İçerik yükleniyor...</p>
      </div>
    );
  }

  const {
    login_register_section,
    on_board_section,
    video_section,
    join_benefits_section,
    faq_section,
    contact_section,
  } = content;

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container py-3">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href={ROUTES.HOME} className="hover:text-foreground">
              {t.home}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">{t.becomeSeller}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section - Registration Form */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16">
        <div className="container">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left - Info */}
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
                {login_register_section.register_title}
              </h1>
              <p className="mt-3 text-lg text-muted-foreground">
                {login_register_section.register_subtitle}
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm">Ücretsiz kayıt ve kolay kurulum</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm">Milyonlarca müşteriye ulaşın</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm">7/24 satıcı desteği</p>
                </div>
              </div>
            </div>

            {/* Right - Form */}
            <div className="rounded-lg border bg-card p-6 shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="first_name">Ad *</Label>
                    <Input
                      id="first_name"
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Soyad</Label>
                    <Input
                      id="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">E-posta *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Şifre *</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="password_confirmation">Şifre Tekrar *</Label>
                  <Input
                    id="password_confirmation"
                    type="password"
                    required
                    value={formData.password_confirmation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password_confirmation: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="agree"
                    checked={formData.agree}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, agree: !!checked })
                    }
                  />
                  <label
                    htmlFor="agree"
                    className="cursor-pointer text-sm leading-tight"
                  >
                    {contact_section.agree_button_title}
                  </label>
                </div>

                {error && (
                  <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Kaydediliyor..." : "Satıcı Hesabı Oluştur"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Zaten hesabınız var mı?{" "}
                  <Link href={ROUTES.LOGIN} className="text-primary hover:underline">
                    Giriş Yap
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Onboarding Steps */}
      <section className="border-b bg-background py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
              {on_board_section.title}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {on_board_section.subtitle}
            </p>
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

      {/* Video Section */}
      <section className="border-b bg-muted/30 py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
              {video_section.section_title}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {video_section.section_subtitle}
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-4xl">
            <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
              {video_section.video_url && (
                <iframe
                  src={video_section.video_url.replace("watch?v=", "embed/")}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-b bg-background py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
              {join_benefits_section.title}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {join_benefits_section.subtitle}
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {join_benefits_section.steps.map((benefit, i) => (
              <div key={i} className="rounded-lg border p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{benefit.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {benefit.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b bg-muted/30 py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
              {faq_section.title}
            </h2>
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
                  <AccordionContent className="text-sm text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Contact/Support */}
      <section className="bg-background py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
              {contact_section.title}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {contact_section.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href={ROUTES.CONTACT}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Bize Ulaşın
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={ROUTES.ABOUT}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Daha Fazla Bilgi
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
