"use client";

import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const STORAGE_KEY = "sportoonline_cookie_consent_v1";
const SHOW_DELAY_FALLBACK_MS = 500;

type CookieStep = {
  title: string;
  descriptions: string;
  /** "required" | "active" | "deactive" — admin tarafından tanımlanır */
  req_status: string;
};

type GdprBasic = {
  com_gdpr_title?: string;
  com_gdpr_message?: string;
  com_gdpr_more_info_label?: string;
  com_gdpr_more_info_link?: string;
  com_gdpr_accept_label?: string;
  com_gdpr_decline_label?: string;
  com_gdpr_manage_label?: string;
  com_gdpr_manage_title?: string;
  com_gdpr_show_delay?: string;
  com_gdpr_enable_disable?: string;
  com_gdpr_can_reject_all?: string;
};

type GdprMoreInfo = {
  section_title?: string;
  section_details?: string;
  steps?: CookieStep[];
};

type GdprContent = {
  gdpr_basic_section?: GdprBasic;
  gdpr_more_info_section?: GdprMoreInfo;
};

type StoredConsent = {
  accepted_at: string;
  /** Kullanıcının her kategori için seçimi. Required olanlar her zaman true. */
  categories: Record<string, boolean>;
};

interface Props {
  apiUrl: string;
  locale: string;
}

/**
 * KVKK / GDPR çerez onay banner'ı.
 *
 * Backend `/gdpr-cookie-settings` admin tarafından dolduruluyor; banner
 * yalnızca `com_gdpr_enable_disable === "on"` ise gösterilir. Onay
 * verildikten sonra localStorage'a yazılır ve banner bir daha çıkmaz.
 * "Yönet" düğmesi her kategoriyi (Zorunlu / Analitik / Pazarlama vb.)
 * tek tek aç-kapa imkânı sunar; "required" işaretli kategoriler her
 * zaman aktif kalır.
 */
export function CookieBanner({ apiUrl, locale }: Props) {
  const [content, setContent] = useState<GdprContent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [categoryChoices, setCategoryChoices] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(STORAGE_KEY)) return;

    let cancelled = false;
    fetch(`${apiUrl}/gdpr-cookie-settings?language=${locale}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled || !json?.data?.content) return;
        const c: GdprContent = json.data.content;
        const enabled = c.gdpr_basic_section?.com_gdpr_enable_disable === "on";
        if (!enabled) return;
        setContent(c);

        const initial: Record<string, boolean> = {};
        for (const step of c.gdpr_more_info_section?.steps || []) {
          initial[step.title] = step.req_status === "required" || step.req_status === "active";
        }
        setCategoryChoices(initial);

        const delayStr = c.gdpr_basic_section?.com_gdpr_show_delay;
        const delay = delayStr ? Number(delayStr) : SHOW_DELAY_FALLBACK_MS;
        const timer = window.setTimeout(
          () => setVisible(true),
          Number.isFinite(delay) && delay >= 0 ? delay : SHOW_DELAY_FALLBACK_MS,
        );
        return () => window.clearTimeout(timer);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [apiUrl, locale]);

  if (!visible || !content) return null;

  const basic = content.gdpr_basic_section || {};
  const more = content.gdpr_more_info_section;
  const canRejectAll = basic.com_gdpr_can_reject_all !== "off";

  const persist = (categories: Record<string, boolean>) => {
    const payload: StoredConsent = {
      accepted_at: new Date().toISOString(),
      categories,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
    setVisible(false);
    setShowManage(false);
  };

  const acceptAll = () => {
    const all: Record<string, boolean> = {};
    for (const step of more?.steps || []) all[step.title] = true;
    persist(all);
  };

  const rejectAll = () => {
    const minimal: Record<string, boolean> = {};
    for (const step of more?.steps || []) {
      minimal[step.title] = step.req_status === "required";
    }
    persist(minimal);
  };

  const saveSelection = () => persist(categoryChoices);

  return (
    <>
      {!showManage && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="container py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex flex-1 items-start gap-3">
                <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0">
                  {basic.com_gdpr_title && (
                    <p className="font-semibold text-sm">{basic.com_gdpr_title}</p>
                  )}
                  {basic.com_gdpr_message && (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {basic.com_gdpr_message}{" "}
                      {basic.com_gdpr_more_info_link && (
                        <a
                          href={basic.com_gdpr_more_info_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline underline-offset-2"
                        >
                          {basic.com_gdpr_more_info_label || "Daha Fazla Bilgi"}
                        </a>
                      )}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                {more?.steps && more.steps.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowManage(true)}
                  >
                    {basic.com_gdpr_manage_label || "Yönet"}
                  </Button>
                )}
                {canRejectAll && (
                  <Button type="button" variant="outline" size="sm" onClick={rejectAll}>
                    {basic.com_gdpr_decline_label || "Reddet"}
                  </Button>
                )}
                <Button type="button" size="sm" onClick={acceptAll}>
                  {basic.com_gdpr_accept_label || "Kabul Et"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showManage && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowManage(false);
          }}
        >
          <div className="w-full max-w-2xl rounded-t-lg bg-background shadow-xl sm:rounded-lg">
            <div className="flex items-start justify-between gap-3 border-b p-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {basic.com_gdpr_manage_title || "Çerez Tercihlerini Yönet"}
                </h2>
                {more?.section_title && (
                  <p className="mt-1 text-sm text-muted-foreground">{more.section_title}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowManage(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-4 py-3">
              {more?.section_details && (
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {more.section_details}
                </p>
              )}

              <div className="space-y-3">
                {(more?.steps || []).map((step) => {
                  const isRequired = step.req_status === "required";
                  return (
                    <div
                      key={step.title}
                      className="flex items-start justify-between gap-3 rounded-md border p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm">
                          {step.title}
                          {isRequired && (
                            <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground">
                              Zorunlu
                            </span>
                          )}
                        </p>
                        {step.descriptions && (
                          <p className="mt-1 text-xs text-muted-foreground">{step.descriptions}</p>
                        )}
                      </div>
                      <Switch
                        checked={isRequired ? true : !!categoryChoices[step.title]}
                        disabled={isRequired}
                        onCheckedChange={(v) =>
                          setCategoryChoices((prev) => ({ ...prev, [step.title]: v }))
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end">
              {canRejectAll && (
                <Button type="button" variant="outline" onClick={rejectAll}>
                  {basic.com_gdpr_decline_label || "Reddet"}
                </Button>
              )}
              <Button type="button" variant="outline" onClick={saveSelection}>
                Tercihleri Kaydet
              </Button>
              <Button type="button" onClick={acceptAll}>
                {basic.com_gdpr_accept_label || "Hepsini Kabul Et"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
