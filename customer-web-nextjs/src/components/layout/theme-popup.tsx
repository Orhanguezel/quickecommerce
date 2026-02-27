"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useThemeConfig } from "@/modules/theme/use-theme-config";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";

type PopupDisplay = "modal_center" | "top_bar" | "bottom_bar";
type PopupTextBehavior = "static" | "marquee";

type PopupConfig = {
  id: string;
  isEnabled: boolean;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
  couponCode: string;
  sortOrder: number;
  delaySeconds: number;
  frequencyDays: number;
  pageTarget: "all" | "home";
  displayType: PopupDisplay;
  textBehavior: PopupTextBehavior;
  popupBgColor?: string;
  popupTextColor?: string;
  popupButtonBgColor?: string;
  popupButtonTextColor?: string;
};

export function ThemePopup() {
  const pathname = usePathname();
  const locale = useLocale();
  const { popupConfigs } = useThemeConfig();
  const [copiedPopupId, setCopiedPopupId] = useState<string | null>(null);
  const [activeTopIndex, setActiveTopIndex] = useState(0);
  const [activeModalIndex, setActiveModalIndex] = useState(0);
  const [activeBottomIndex, setActiveBottomIndex] = useState(0);
  const [topVisible, setTopVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [bottomVisible, setBottomVisible] = useState(false);
  const topTimerRef = useRef<number | null>(null);
  const modalTimerRef = useRef<number | null>(null);
  const bottomTimerRef = useRef<number | null>(null);

  const ordered = useMemo(() => (popupConfigs || []) as PopupConfig[], [popupConfigs]);
  const clearTimer = useCallback((timer: MutableRefObject<number | null>) => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const eligiblePopups = useMemo(() => {
    const normalizedPath = (pathname || "").replace(/\/+$/, "");
    const segments = normalizedPath.split("/").filter(Boolean);
    const isHome = segments.length === 1 && segments[0] === locale;
    return ordered.filter((popup) => {
      if (!popup.isEnabled) return false;
      if (!popup.title?.trim()) return false;
      if (popup.pageTarget === "home" && !isHome) return false;
      return true;
    });
  }, [locale, ordered, pathname]);

  const topPopups = useMemo(
    () => eligiblePopups.filter((item) => item.displayType === "top_bar"),
    [eligiblePopups]
  );
  const modalPopups = useMemo(
    () => eligiblePopups.filter((item) => item.displayType === "modal_center"),
    [eligiblePopups]
  );
  const bottomPopups = useMemo(
    () => eligiblePopups.filter((item) => item.displayType === "bottom_bar"),
    [eligiblePopups]
  );

  const currentTopPopup = topPopups[activeTopIndex] || null;
  const currentModalPopup = modalPopups[activeModalIndex] || null;
  const currentBottomPopup = bottomPopups[activeBottomIndex] || null;
  const currentTopId = currentTopPopup?.id;
  const currentTopDelay = currentTopPopup?.delaySeconds ?? 0;
  const currentModalId = currentModalPopup?.id;
  const currentModalDelay = currentModalPopup?.delaySeconds ?? 0;
  const currentBottomId = currentBottomPopup?.id;
  const currentBottomDelay = currentBottomPopup?.delaySeconds ?? 0;

  const topKey = useMemo(() => topPopups.map((item) => item.id).join("|"), [topPopups]);
  const modalKey = useMemo(() => modalPopups.map((item) => item.id).join("|"), [modalPopups]);
  const bottomKey = useMemo(() => bottomPopups.map((item) => item.id).join("|"), [bottomPopups]);
  const eligibilityKey = useMemo(
    () => eligiblePopups.map((popup) => popup.id).join("|"),
    [eligiblePopups]
  );

  useEffect(() => {
    clearTimer(topTimerRef);
    clearTimer(modalTimerRef);
    clearTimer(bottomTimerRef);
    const resetId = window.setTimeout(() => {
      setActiveTopIndex(0);
      setActiveModalIndex(0);
      setActiveBottomIndex(0);
      setTopVisible(false);
      setModalVisible(false);
      setBottomVisible(false);
      setCopiedPopupId(null);
    }, 0);
    return () => {
      window.clearTimeout(resetId);
      clearTimer(topTimerRef);
      clearTimer(modalTimerRef);
      clearTimer(bottomTimerRef);
    };
  }, [clearTimer, pathname, eligibilityKey]);

  useEffect(() => {
    clearTimer(topTimerRef);
    if (!currentTopId) return;
    topTimerRef.current = window.setTimeout(() => setTopVisible(true), Math.max(0, currentTopDelay) * 1000);
    return () => clearTimer(topTimerRef);
  }, [activeTopIndex, clearTimer, currentTopDelay, currentTopId, topKey]);

  useEffect(() => {
    const topOffset = topVisible && currentTopPopup ? "44px" : "0px";
    document.documentElement.style.setProperty("--theme-popup-top-offset", topOffset);
    return () => {
      document.documentElement.style.setProperty("--theme-popup-top-offset", "0px");
    };
  }, [currentTopPopup, topVisible]);

  useEffect(() => {
    clearTimer(modalTimerRef);
    if (!currentModalId) return;
    modalTimerRef.current = window.setTimeout(() => setModalVisible(true), Math.max(0, currentModalDelay) * 1000);
    return () => clearTimer(modalTimerRef);
  }, [activeModalIndex, clearTimer, currentModalDelay, currentModalId, modalKey]);

  useEffect(() => {
    clearTimer(bottomTimerRef);
    if (!currentBottomId) return;
    bottomTimerRef.current = window.setTimeout(() => setBottomVisible(true), Math.max(0, currentBottomDelay) * 1000);
    return () => clearTimer(bottomTimerRef);
  }, [activeBottomIndex, bottomKey, clearTimer, currentBottomDelay, currentBottomId]);

  const dismissTop = () => {
    clearTimer(topTimerRef);
    setTopVisible(false);
    if (activeTopIndex + 1 < topPopups.length) {
      setActiveTopIndex((prev) => prev + 1);
    }
  };
  const dismissModal = () => {
    clearTimer(modalTimerRef);
    setModalVisible(false);
    if (activeModalIndex + 1 < modalPopups.length) {
      setActiveModalIndex((prev) => prev + 1);
    }
  };
  const dismissBottom = () => {
    clearTimer(bottomTimerRef);
    setBottomVisible(false);
    if (activeBottomIndex + 1 < bottomPopups.length) {
      setActiveBottomIndex((prev) => prev + 1);
    }
  };

  const handleCopyCoupon = async (popup: PopupConfig) => {
    const coupon = popup.couponCode?.trim();
    if (!coupon) return;
    try {
      await navigator.clipboard.writeText(coupon);
      setCopiedPopupId(popup.id);
      window.setTimeout(() => {
        setCopiedPopupId((prev) => (prev === popup.id ? null : prev));
      }, 1800);
    } catch {
      // no-op
    }
  };

  const buildStyles = (popup: PopupConfig | null) => {
    return {
      containerStyle: {
        backgroundColor: popup?.popupBgColor || undefined,
        color: popup?.popupTextColor || undefined,
      },
      buttonStyle: {
        backgroundColor: popup?.popupButtonBgColor || undefined,
        color: popup?.popupButtonTextColor || undefined,
        borderColor: popup?.popupButtonTextColor || undefined,
      },
      closeButtonStyle: {
        borderColor: popup?.popupTextColor || undefined,
        color: popup?.popupTextColor || undefined,
      },
    };
  };

  const renderText = (popup: PopupConfig) =>
    popup.textBehavior === "marquee" ? (
      <div className="overflow-hidden whitespace-nowrap">
        <div className="inline-block min-w-full animate-[marquee_16s_linear_infinite]">
          <span className="mr-12 text-sm">{popup.title}</span>
          {popup.subtitle ? <span className="text-sm">{popup.subtitle}</span> : null}
        </div>
      </div>
    ) : (
      <>
        <p className="text-sm font-semibold">{popup.title}</p>
        {popup.subtitle ? <p className="text-xs opacity-90">{popup.subtitle}</p> : null}
      </>
    );

  return (
    <>
      <style>{`@keyframes marquee { 0%{transform:translateX(100%)} 100%{transform:translateX(-100%)} }`}</style>
      {topVisible && currentTopPopup ? (() => {
        const { containerStyle, buttonStyle, closeButtonStyle } = buildStyles(currentTopPopup);
        return (
          <div className="fixed top-0 left-0 right-0 z-[70] border bg-primary text-primary-foreground" style={containerStyle}>
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
              <div className="min-w-0 flex-1">{renderText(currentTopPopup)}</div>
              {currentTopPopup.couponCode ? (
                <button type="button" onClick={() => handleCopyCoupon(currentTopPopup)} className="rounded border px-2 py-1 text-xs" style={closeButtonStyle}>
                  {copiedPopupId === currentTopPopup.id ? "Kopyalandı" : currentTopPopup.couponCode}
                </button>
              ) : null}
              {currentTopPopup.buttonText && currentTopPopup.buttonUrl ? (
                <a href={currentTopPopup.buttonUrl} onClick={dismissTop} target="_blank" rel="nofollow noopener noreferrer" className="rounded border bg-white px-3 py-1 text-xs font-semibold text-primary" style={buttonStyle}>
                  {currentTopPopup.buttonText}
                </a>
              ) : null}
              <button type="button" onClick={dismissTop} className="rounded border px-2 py-1 text-xs" style={closeButtonStyle}>
                Kapat
              </button>
            </div>
          </div>
        );
      })() : null}

      {bottomVisible && currentBottomPopup ? (() => {
        const { containerStyle, buttonStyle, closeButtonStyle } = buildStyles(currentBottomPopup);
        return (
          <div className="fixed bottom-0 left-0 right-0 z-[70] border bg-primary text-primary-foreground" style={containerStyle}>
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
              <div className="min-w-0 flex-1">{renderText(currentBottomPopup)}</div>
              {currentBottomPopup.couponCode ? (
                <button type="button" onClick={() => handleCopyCoupon(currentBottomPopup)} className="rounded border px-2 py-1 text-xs" style={closeButtonStyle}>
                  {copiedPopupId === currentBottomPopup.id ? "Kopyalandı" : currentBottomPopup.couponCode}
                </button>
              ) : null}
              {currentBottomPopup.buttonText && currentBottomPopup.buttonUrl ? (
                <a href={currentBottomPopup.buttonUrl} onClick={dismissBottom} target="_blank" rel="nofollow noopener noreferrer" className="rounded border bg-white px-3 py-1 text-xs font-semibold text-primary" style={buttonStyle}>
                  {currentBottomPopup.buttonText}
                </a>
              ) : null}
              <button type="button" onClick={dismissBottom} className="rounded border px-2 py-1 text-xs" style={closeButtonStyle}>
                Kapat
              </button>
            </div>
          </div>
        );
      })() : null}

      {modalVisible && currentModalPopup ? (() => {
        const { containerStyle, buttonStyle, closeButtonStyle } = buildStyles(currentModalPopup);
        return (
          <Dialog open={modalVisible} onOpenChange={(next) => (!next ? dismissModal() : setModalVisible(true))}>
            <DialogContent className="max-w-md" style={containerStyle}>
              {currentModalPopup.imageUrl ? (
                <div className="relative h-44 w-full overflow-hidden rounded-lg">
                  <Image
                    src={currentModalPopup.imageUrl}
                    alt={currentModalPopup.title || "popup"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : null}
              <DialogTitle className="text-xl font-bold">{currentModalPopup.title}</DialogTitle>
              {currentModalPopup.subtitle ? (
                <DialogDescription className="text-sm" style={{ color: currentModalPopup.popupTextColor || undefined }}>
                  {currentModalPopup.subtitle}
                </DialogDescription>
              ) : null}
              {currentModalPopup.couponCode ? (
                <div className="rounded-md border p-3">
                  <p className="mb-1 text-xs">Kupon Kodu</p>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-sm font-semibold">{currentModalPopup.couponCode}</code>
                    <button
                      type="button"
                      onClick={() => handleCopyCoupon(currentModalPopup)}
                      className="rounded-md border px-2 py-1 text-xs font-medium"
                      style={closeButtonStyle}
                    >
                      {copiedPopupId === currentModalPopup.id ? "Kopyalandı" : "Kopyala"}
                    </button>
                  </div>
                </div>
              ) : null}
              <div className="mt-2 flex items-center gap-2">
                {currentModalPopup.buttonText && currentModalPopup.buttonUrl ? (
                  <a
                    href={currentModalPopup.buttonUrl}
                    className="rounded-md border bg-white px-4 py-2 text-sm font-semibold text-primary"
                    style={buttonStyle}
                    onClick={dismissModal}
                  >
                    {currentModalPopup.buttonText}
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={dismissModal}
                  className="rounded-md border px-4 py-2 text-sm font-medium"
                  style={closeButtonStyle}
                >
                  Kapat
                </button>
              </div>
            </DialogContent>
          </Dialog>
        );
      })() : null}
    </>
  );
}
