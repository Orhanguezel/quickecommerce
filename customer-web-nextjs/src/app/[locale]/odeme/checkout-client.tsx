"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { useCartStore } from "@/stores/cart-store";
import { useCurrencyStore } from "@/stores/currency-store";
import {
  useAddressListQuery,
  useAddAddressMutation,
  useCheckCouponMutation,
  useCheckoutExtraInfoQuery,
  useCreateIyzicoSessionMutation,
  useCreatePaytrSessionMutation,
  usePlaceOrderMutation,
  usePaymentGatewaysQuery,
  useVerifyStockMutation,
} from "@/modules/checkout/checkout.service";
import { useWalletInfoQuery } from "@/modules/wallet/wallet.service";
import { useProfileQuery } from "@/modules/profile/profile.service";
import { useBaseService } from "@/lib/base-service";
import { useSiteInfoQuery } from "@/modules/site/site.action";
import { getCartSessionId } from "@/hooks/use-cart-snapshot-sync";
import type {
  CustomerAddress,
  PlaceOrderInput,
  CheckoutPackage,
  PaymentGateway,
} from "@/modules/checkout/checkout.type";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { trackBeginCheckout, trackAddPaymentInfo, trackAddShippingInfo } from "@/lib/gtm";
import { getFunnelAttributionContext, trackFunnelEvent } from "@/lib/funnel-tracker";
import {
  MapPin,
  Plus,
  CreditCard,
  Banknote,
  Wallet,
  ShoppingBag,
  Loader2,
  Check,
  Tag,
  XCircle,
  ShieldCheck,
  RotateCcw,
  Truck,
} from "lucide-react";

const gatewayIconMap: Record<string, typeof CreditCard> = {
  cash_on_delivery: Banknote,
  paytr: CreditCard,
  iyzico: CreditCard,
  moka: CreditCard,
  ziraatpay: CreditCard,
  wallet: Wallet,
};

const SUPPORTED_CHECKOUT_GATEWAYS = new Set([
  "cash_on_delivery",
  "iyzico",
  "paytr",
  "wallet",
]);

interface Props {
  translations: Record<string, string>;
}

export function CheckoutClient({ translations: t }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("payment");
  const failedOrderId = searchParams.get("order");
  const failReason = searchParams.get("reason");
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const clearCart = useCartStore((s) => s.clearCart);
  const selectedCurrencyCode = useCurrencyStore((s) => s.getSelectedCurrencyCode());
  const productIds = items.map((item) => item.product_id).filter(Boolean) as number[];
  const { data: checkoutExtraInfo } = useCheckoutExtraInfoQuery(productIds);
  const isCashOnDeliveryAllowed = checkoutExtraInfo?.cash_on_delivery_allowed ?? false;

  // State
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const [showAddressForm, setShowAddressForm] = useState(false);
  /**
   * Odeme durdurulunca gosterilen uyari.
   *
   * Native `alert()` KULLANILMIYOR: tarayicinin kendi kutusu, adresi ve
   * "su siteden mesaj var" basligini TARAYICI DILINDE gosteriyor (Almanca
   * Chrome'da "Auf sportoonline.com wird Folgendes angezeigt"), sayfa
   * temasindan kopuk duruyor ve odeme adiminda dolandiricilik uyarisi gibi
   * algilaniyor. Ustelik metin bicimlendirilemiyor.
   */
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);

  const showNotice = (title: string, message: string) => setNotice({ title, message });
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    title: string;
  } | null>(null);
  const [orderNotes, setOrderNotes] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [addressSearchError, setAddressSearchError] = useState<string | null>(null);

  // Address form state
  const [addressForm, setAddressForm] = useState({
    type: "home" as "home" | "office" | "others",
    title: "",
    email: "",
    contact_number: "",
    address: "",
    city_name: "",
    district_name: "",
    road: "",
    house: "",
    floor: "",
    postal_code: "",
  });

  // Queries & Mutations
  const { data: profile } = useProfileQuery();
  const { siteInfo } = useSiteInfoQuery();
  const googleMapsApiKey = (siteInfo?.com_google_map_api_key as string) || "";
  const { data: addresses, isLoading: addressesLoading, isError: addressesError, refetch: refetchAddresses } =
    useAddressListQuery();
  const addAddressMutation = useAddAddressMutation();
  const couponMutation = useCheckCouponMutation();
  const placeOrderMutation = usePlaceOrderMutation();
  const createIyzicoSessionMutation = useCreateIyzicoSessionMutation();
  const verifyStockMutation = useVerifyStockMutation();
  const createPaytrSessionMutation = useCreatePaytrSessionMutation();
  const { data: paymentGateways, isLoading: gatewaysLoading } =
    usePaymentGatewaysQuery();
  const { data: walletData } = useWalletInfoQuery();
  const { getAxiosInstance } = useBaseService("/product");

  const checkoutPaymentGateways = useMemo(
    () =>
      (paymentGateways ?? []).filter((gw) => {
        if (!SUPPORTED_CHECKOUT_GATEWAYS.has(gw.slug)) return false;
        if (gw.slug === "cash_on_delivery" && !isCashOnDeliveryAllowed) return false;
        return true;
      }),
    [paymentGateways, isCashOnDeliveryAllowed]
  );

  useEffect(() => {
    if (!checkoutPaymentGateways.length) {
      if (paymentMethod) setPaymentMethod("");
      return;
    }
    if (!paymentMethod || !SUPPORTED_CHECKOUT_GATEWAYS.has(paymentMethod)) {
      setPaymentMethod(checkoutPaymentGateways[0].slug);
    }
  }, [checkoutPaymentGateways, paymentMethod]);

  useEffect(() => {
    if (!addresses || addresses.length === 0 || selectedAddressId !== null) return;
    const defaultAddr = addresses.find((a) => a.is_default);
    if (defaultAddr) setSelectedAddressId(defaultAddr.id);
    else setSelectedAddressId(addresses[0].id);
  }, [addresses, selectedAddressId]);

  // Pre-fill address form with profile info when the form is opened
  useEffect(() => {
    if (!showAddressForm || !profile) return;
    setAddressForm((prev) => ({
      ...prev,
      email: prev.email || profile.email || "",
      contact_number: prev.contact_number || profile.phone || "",
    }));
  }, [showAddressForm, profile]);

  // Calculations
  const subtotal = totalPrice();
  const couponDiscount = appliedCoupon?.discount ?? 0;
  const payableSubtotal = Math.max(0, subtotal - couponDiscount);
  const freeShippingThreshold = Number(
    checkoutExtraInfo?.shipping_campaign?.free_shipping_min_order_value ?? 0
  );
  const minimumShippingCharge = Number(
    checkoutExtraInfo?.shipping_campaign?.minimum_shipping_charge ?? 0
  );
  const shippingAmount =
    freeShippingThreshold > 0 && payableSubtotal >= freeShippingThreshold
      ? 0
      : minimumShippingCharge;
  const total = payableSubtotal + shippingAmount;
  const selectedAddress = addresses?.find((addr) => addr.id === selectedAddressId) ?? null;
  const selectedAddressMissingLocation = !!selectedAddress && (
    !selectedAddress.city_name?.trim() || !selectedAddress.district_name?.trim()
  );
  const isAddressFormComplete = !!addressForm.email.trim()
    && !!addressForm.contact_number.trim()
    && !!addressForm.address.trim()
    && !!addressForm.city_name.trim()
    && !!addressForm.district_name.trim();

  // GA4: begin_checkout (once per page load)
  const checkoutTrackedRef = useRef(false);
  useEffect(() => {
    if (items.length === 0 || checkoutTrackedRef.current) return;
    checkoutTrackedRef.current = true;
    trackBeginCheckout(
      items.map((i) => ({
        item_id: String(i.product_id),
        item_name: i.name,
        item_variant: i.variant_label,
        price: i.price,
        quantity: i.quantity,
      })),
      subtotal,
      selectedCurrencyCode || 'TRY',
      appliedCoupon?.code,
    );
    trackFunnelEvent({
      event: "checkout_start",
      amount: subtotal,
      meta: {
        item_count: items.reduce((sum, item) => sum + item.quantity, 0),
        product_ids: items.map((item) => item.product_id),
        coupon: appliedCoupon?.code,
      },
    });
  }, [items.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const shippingInfoSentRef = useRef(false);
  useEffect(() => {
    const hasShippingAddress = selectedAddress
      ? !selectedAddressMissingLocation
      : showAddressForm && isAddressFormComplete;
    if (!hasShippingAddress || shippingInfoSentRef.current || items.length === 0) return;
    shippingInfoSentRef.current = true;
    const analyticsItems = items.map((item) => ({
      item_id: String(item.product_id),
      item_name: item.name,
      item_variant: item.variant_label,
      price: item.price,
      quantity: item.quantity,
    }));
    trackAddShippingInfo(analyticsItems, total, selectedCurrencyCode || 'TRY', 'home_delivery');
    trackFunnelEvent({
      event: "shipping_selected",
      amount: shippingAmount,
      meta: { shipping_tier: "home_delivery", city: selectedAddress?.city_name || addressForm.city_name },
    });
  }, [selectedAddressId, selectedAddressMissingLocation, showAddressForm, isAddressFormComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  const paymentInfoSentRef = useRef(false);
  useEffect(() => {
    if (!paymentMethod) return;
    trackFunnelEvent({
      event: "payment_selected",
      meta: { payment_method: paymentMethod },
    });
    // GA4 add_payment_info — funnel'da begin_checkout -> add_payment_info ->
    // purchase basamagi tam olsun. items/value begin_checkout ile ayni kaynak
    // (sepet). Tek sefer (ref guard): yontem degistirilse de tekrar atilmaz.
    if (!paymentInfoSentRef.current && items.length > 0) {
      paymentInfoSentRef.current = true;
      trackAddPaymentInfo(
        items.map((i) => ({
          item_id: String(i.product_id),
          item_name: i.name,
          item_variant: i.variant_label,
          price: i.price,
          quantity: i.quantity,
        })),
        subtotal,
        selectedCurrencyCode || 'TRY',
        paymentMethod,
      );
    }
  }, [paymentMethod]); // eslint-disable-line react-hooks/exhaustive-deps

  // Payment failed redirect
  if (paymentStatus === "failed") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <XCircle className="mx-auto mb-4 h-16 w-16 text-destructive" />
        <h1 className="mb-2 text-2xl font-bold">Ödeme Başarısız</h1>
        <p className="mb-2 text-muted-foreground">
          Ödeme işlemi tamamlanamadı. Lütfen kart bilgilerinizi kontrol edip tekrar deneyin.
        </p>
        {failReason && (
          <p className="mx-auto mb-2 max-w-md rounded-md bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive">
            {failReason}
          </p>
        )}
        {failedOrderId && (
          <p className="mb-6 text-sm text-muted-foreground">
            Sipariş No: #{failedOrderId}
          </p>
        )}
        <div className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link href={ROUTES.HOME}>{t.home}</Link>
          </Button>
          {failedOrderId && (
            <Button asChild>
              <Link href={`/siparis/${failedOrderId}`}>Siparişi Görüntüle</Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Empty cart check (skip if redirecting to payment)
  if (items.length === 0 && !isRedirecting) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold">{t.title}</h1>
        <p className="mb-6 text-muted-foreground">{t.empty_cart}</p>
        <Button asChild>
          <Link href={ROUTES.HOME}>{t.home}</Link>
        </Button>
      </div>
    );
  }

  const handleAddAddress = () => {
    if (!isAddressFormComplete) {
      setAddressSearchError("Adres, il ve ilçe alanları zorunludur.");
      return;
    }

    addAddressMutation.mutate(
      {
        ...addressForm,
        status: 1,
        is_default: !addresses || addresses.length === 0,
      },
      {
        onSuccess: (data) => {
          setShowAddressForm(false);
          setAddressForm({
            type: "home",
            title: "",
            email: "",
            contact_number: "",
            address: "",
            city_name: "",
            district_name: "",
            road: "",
            house: "",
            floor: "",
            postal_code: "",
          });
          // Auto-select the newly created address
          const newId = data?.data?.id ?? data?.id;
          if (newId) setSelectedAddressId(newId);
        },
      }
    );
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    couponMutation.mutate(
      {
        coupon_code: couponCode.trim(),
        currency_code: selectedCurrencyCode || "TRY",
        sub_total: subtotal,
      },
      {
        onSuccess: (data) => {
          setAppliedCoupon({
            code: data.coupon.code,
            discount: data.coupon.discounted_amount,
            title: data.coupon.title,
          });
          trackFunnelEvent({
            event: "coupon_apply",
            amount: data.coupon.discounted_amount,
            meta: {
              coupon_code: data.coupon.code,
              coupon_title: data.coupon.title,
              subtotal,
            },
          });
        },
      }
    );
  };

  const handlePlaceOrder = async () => {
    // Auto-resolve items missing variant_id or store_id (stale localStorage data)
    if (!selectedAddressId) {
      // Onceden sessizce return ediyordu -> kullanici "Odemeye Gec"e basip hicbir
      // sey olmayinca terk ediyordu. Artik net uyari + adres bolumune kaydir.
      setAddressSearchError(
        "Devam etmek için lütfen bir teslimat adresi seçin veya yeni adres ekleyin."
      );
      if (typeof window !== "undefined") {
        requestAnimationFrame(() =>
          window.scrollTo({ top: 0, behavior: "smooth" })
        );
      }
      return;
    }

    if (selectedAddressMissingLocation) {
      setAddressSearchError("Seçili adresin il ve ilçe bilgisi eksik. Lütfen adresi güncelleyin veya yeni adres ekleyin.");
      return;
    }

    const needsResolve = items.filter((i) => !i.variant_id || !i.store_id);
    let resolvedItems = [...items];

    if (needsResolve.length > 0) {
      const axios = getAxiosInstance();
      for (const item of needsResolve) {
        try {
          const res = await axios.get(`/product/${item.slug}`);
          const pd = res.data?.data;
          const firstVariant = pd?.variants?.[0];
          if (firstVariant || pd?.store?.id) {
            resolvedItems = resolvedItems.map((i) =>
              i.id === item.id
                ? {
                    ...i,
                    variant_id: i.variant_id ?? firstVariant?.id,
                    store_id: i.store_id ?? pd?.store?.id,
                  }
                : i
            );
          }
        } catch {
          // keep item as-is, will fail validation below
        }
      }
    }

    // Final validation after resolution
    const stillMissing = resolvedItems.filter((i) => !i.variant_id || !i.store_id);
    if (stillMissing.length > 0) {
      showNotice(
        "Sepetiniz güncellenemedi",
        `Şu ürünler için güncel bilgi alınamadı: ${stillMissing
          .map((i) => i.name)
          .join(", ")}. Lütfen bu ürünleri sepetten kaldırıp tekrar ekleyin.`
      );
      return;
    }

    // Checkout-oncesi canli stok kontrolu: tukenmis veya tedarikci kaynaginda
    // dogrulanamayan urun varsa siparis OLUSTURMA.
    try {
      const stockCheck = await verifyStockMutation.mutateAsync(
        resolvedItems.map((i) => ({
          product_id: i.product_id,
          variant_id: i.variant_id ?? null,
          name: i.name,
        }))
      );
      if (stockCheck && !stockCheck.ok && stockCheck.out_of_stock.length > 0) {
        const names = stockCheck.out_of_stock
          .map((o) => o.name)
          .filter(Boolean)
          .join(", ");
        const verificationSignals = new Set([
          "no_signal",
          "pool_error",
          "verification_unavailable",
          "verification_uncertain",
          "source_url_missing",
          "scraper_failure",
          "exception",
        ]);
        const onlyVerificationProblem = stockCheck.out_of_stock.every((item) =>
          verificationSignals.has(item.signal) || item.signal.startsWith("http_")
        );
        if (onlyVerificationProblem) {
          showNotice(
            "Stok bilgisi doğrulanamadı",
            `${names} için tedarikçi stoğu şu anda teyit edilemedi. ` +
              "Kartınızdan herhangi bir çekim yapılmadı. Birkaç dakika sonra tekrar deneyin."
          );
        } else {
          showNotice(
            "Ürün tedarikçide tükenmiş",
            `${names} şu anda temin edilemiyor. Kartınızdan herhangi bir çekim ` +
              "yapılmadı. Ürünü sepetinizden çıkarıp siparişinizi tamamlayabilirsiniz."
          );
        }
        return;
      }
    } catch {
      showNotice(
        "Stok kontrolü yapılamadı",
        "Stok doğrulama servisine şu anda ulaşılamıyor. Kartınızdan herhangi bir " +
          "çekim yapılmadı; lütfen birkaç dakika sonra tekrar deneyin."
      );
      return;
    }

    // Group items by store
    const storeMap = new Map<number, typeof resolvedItems>();
    for (const item of resolvedItems) {
      if (!storeMap.has(item.store_id!)) storeMap.set(item.store_id!, []);
      storeMap.get(item.store_id!)!.push(item);
    }

    const packages: CheckoutPackage[] = [];
    for (const [storeId, storeItems] of storeMap) {
      packages.push({
        store_id: storeId,
        delivery_option: "home_delivery",
        items: storeItems.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id!,
          quantity: item.quantity,
          line_total_price: item.price * item.quantity,
        })),
      });
    }

    const orderData: PlaceOrderInput = {
      shipping_address_id: selectedAddressId ?? undefined,
      currency_code: selectedCurrencyCode || "TRY",
      payment_gateway: paymentMethod,
      order_notes: orderNotes || undefined,
      order_amount: total,
      coupon_code: appliedCoupon?.code,
      coupon_title: appliedCoupon?.title,
      coupon_discount_amount_admin: appliedCoupon?.discount,
      packages,
      attribution: {
        ...getFunnelAttributionContext(),
        cart_session_id: getCartSessionId() ?? undefined,
      },
    };

    placeOrderMutation.mutate(orderData, {
      onSuccess: (data) => {
        const orderId = data.order_master?.id ?? data.orders?.[0]?.order_id;
        if (!orderId) {
          return;
        }

        trackFunnelEvent({
          event: "order_created",
          order_id: Number(orderId),
          amount: total,
          meta: {
            payment_method: paymentMethod,
            shipping_amount: shippingAmount,
            coupon: appliedCoupon?.code,
            item_count: items.reduce((sum, item) => sum + item.quantity, 0),
            product_ids: items.map((item) => item.product_id),
          },
        });

        if (paymentMethod === "iyzico") {
          createIyzicoSessionMutation.mutate(orderId, {
            onSuccess: (session) => {
              const checkoutUrl = session?.data?.checkout_url;
              if (!checkoutUrl) {
                return;
              }

              setIsRedirecting(true);
              clearCart();
              window.location.href = checkoutUrl;
            },
          });
          return;
        }

        if (paymentMethod === "paytr") {
          createPaytrSessionMutation.mutate(orderId, {
            onSuccess: (session) => {
              const iframeUrl = (session?.data as any)?.iframe_url;
              if (!iframeUrl) {
                return;
              }

              setIsRedirecting(true);
              clearCart();
              window.location.href = iframeUrl;
            },
          });
          return;
        }

        clearCart();
        router.push(`/${locale}/siparis-basarili?order=${orderId}`);
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Odeme durduruldu uyarisi — native alert() yerine site temasinda */}
      <AlertDialog
        open={notice !== null}
        onOpenChange={(open) => !open && setNotice(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{notice?.title}</AlertDialogTitle>
            <AlertDialogDescription>{notice?.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setNotice(null)}>
              Tamam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href={ROUTES.HOME} className="hover:text-foreground">
          {t.home}
        </Link>
        <span className="mx-2">/</span>
        <Link href={ROUTES.CART} className="hover:text-foreground">
          {t.subtotal}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{t.title}</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold">{t.title}</h1>

      {placeOrderMutation.isError && (
        <div className="mb-6 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {(placeOrderMutation.error as any)?.response?.data?.message ||
            t.error}
        </div>
      )}
      {createIyzicoSessionMutation.isError && (
        <div className="mb-6 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {(createIyzicoSessionMutation.error as any)?.response?.data?.message ||
            t.error}
        </div>
      )}
      {createPaytrSessionMutation.isError && (
        <div className="mb-6 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {(createPaytrSessionMutation.error as any)?.response?.data?.message ||
            t.error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Address + Payment */}
        <div className="space-y-6 lg:col-span-2">
          {/* Shipping Address */}
          <section className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <MapPin className="h-5 w-5" />
              {t.shipping_address}
            </h2>

            {addressesLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.loading}
              </div>
            ) : addressesError ? (
              <div className="flex items-center gap-3 text-sm text-destructive">
                <span>{t.error}</span>
                <button
                  type="button"
                  onClick={() => refetchAddresses()}
                  className="underline hover:no-underline"
                >
                  {t.loading}
                </button>
              </div>
            ) : !addresses || addresses.length === 0 ? (
              <p className="text-muted-foreground">{t.no_addresses}</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {addresses.map((addr: CustomerAddress) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`rounded-lg border p-4 text-left transition-colors ${
                      selectedAddressId === addr.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:border-primary/50"
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium uppercase">
                        {addr.type}
                      </span>
                      {addr.is_default && (
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      )}
                    </div>
                    {addr.title && (
                      <p className="text-sm font-medium">{addr.title}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {addr.address}
                    </p>
                    {(addr.city_name || addr.district_name) && (
                      <p className="text-xs text-muted-foreground">
                        {[addr.district_name, addr.city_name].filter(Boolean).join(" / ")}
                      </p>
                    )}
                    {(!addr.city_name || !addr.district_name) && (
                      <p className="mt-1 text-xs text-destructive">
                        İl ve ilçe bilgisi eksik
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {addr.contact_number}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Add Address */}
            {!showAddressForm ? (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setShowAddressForm(true)}
              >
                <Plus className="mr-1 h-4 w-4" />
                {t.add_address}
              </Button>
            ) : (
              <div className="mt-4 space-y-4 rounded-lg border p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t.address_type}</Label>
                    <Select
                      value={addressForm.type}
                      onValueChange={(v: any) =>
                        setAddressForm({ ...addressForm, type: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">
                          {t.address_type_home}
                        </SelectItem>
                        <SelectItem value="office">
                          {t.address_type_office}
                        </SelectItem>
                        <SelectItem value="others">
                          {t.address_type_others}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t.address_title}</Label>
                    <Input
                      value={addressForm.title}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, title: e.target.value })
                      }
                      placeholder={t.address_title}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t.address_email}</Label>
                    <Input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={addressForm.email}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.address_phone}</Label>
                    <Input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={addressForm.contact_number}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          contact_number: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {googleMapsApiKey && (
                  <div className="space-y-2">
                    <Label>Adres Ara</Label>
                    <AddressAutocomplete
                      apiKey={googleMapsApiKey}
                      defaultValue={addressForm.address}
                      onError={setAddressSearchError}
                      onSelect={(selected) => {
                        setAddressSearchError(null);
                        setAddressForm((prev) => ({
                          ...prev,
                          address: selected.formattedAddress,
                          city_name: selected.city || prev.city_name,
                          district_name: selected.district || prev.district_name,
                          postal_code: selected.postalCode || prev.postal_code,
                        }));
                      }}
                    />
                  </div>
                )}

                {addressSearchError && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {addressSearchError}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>{t.address_field}</Label>
                  <Textarea
                    value={addressForm.address}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        address: e.target.value,
                      })
                    }
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>İl *</Label>
                    <Input
                      value={addressForm.city_name}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, city_name: e.target.value })
                      }
                      placeholder="İstanbul"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>İlçe *</Label>
                    <Input
                      value={addressForm.district_name}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, district_name: e.target.value })
                      }
                      placeholder="Şişli"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="space-y-2">
                    <Label>{t.address_road}</Label>
                    <Input
                      value={addressForm.road}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, road: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.address_house}</Label>
                    <Input
                      value={addressForm.house}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, house: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.address_floor}</Label>
                    <Input
                      value={addressForm.floor}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, floor: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.address_postal}</Label>
                    <Input
                      value={addressForm.postal_code}
                      inputMode="numeric"
                      autoComplete="postal-code"
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          postal_code: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleAddAddress}
                    disabled={
                      addAddressMutation.isPending ||
                      !isAddressFormComplete
                    }
                  >
                    {addAddressMutation.isPending ? t.loading : t.save}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddressForm(false)}
                  >
                    {t.cancel}
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* Payment Method */}
          <section className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <CreditCard className="h-5 w-5" />
              {t.payment_method}
            </h2>

            {gatewaysLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.loading}
              </div>
            ) : !checkoutPaymentGateways || checkoutPaymentGateways.length === 0 ? (
              <p className="text-muted-foreground">
                {t.unsupported_payment_methods_for_checkout}
              </p>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  {checkoutPaymentGateways.map((gw: PaymentGateway) => {
                    const IconComponent = gatewayIconMap[gw.slug] ?? CreditCard;
                    const walletBalance = walletData?.wallets?.total_balance ?? 0;
                    const isWallet = gw.slug === "wallet";
                    const hasInsufficientBalance = isWallet && walletBalance < total;
                    return (
                      <button
                        key={gw.slug}
                        type="button"
                        onClick={() => setPaymentMethod(gw.slug)}
                        className={`flex flex-col items-start gap-1 rounded-lg border p-4 transition-colors ${
                          paymentMethod === gw.slug
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {gw.image_url ? (
                            <Image
                              src={gw.image_url}
                              alt={gw.name}
                              width={24}
                              height={24}
                              className="h-6 w-6 object-contain"
                            />
                          ) : (
                            <IconComponent className="h-5 w-5" />
                          )}
                          <span className="text-sm font-medium">{gw.name}</span>
                        </div>
                        {isWallet && (
                          <span className={`text-xs ${hasInsufficientBalance ? "text-destructive" : "text-muted-foreground"}`}>
                            {t.currency}{walletBalance.toFixed(2)}
                            {hasInsufficientBalance ? " (Yetersiz)" : ""}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {paymentMethod === "wallet" && (walletData?.wallets?.total_balance ?? 0) < total && (
                  <div className="mt-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {"Cüzdan bakiyeniz ("}{t.currency}{(walletData?.wallets?.total_balance ?? 0).toFixed(2)}
                    {") sipariş tutarından ("}{t.currency}{total.toFixed(2)}
                    {") düşük. Lütfen önce cüzdanınıza para yükleyin."}
                  </div>
                )}
              </>
            )}
          </section>

          {/* Order Notes */}
          <section className="rounded-lg border bg-card p-6">
            <Label className="mb-2 block text-base font-bold">
              {t.order_notes}
            </Label>
            <Textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder={t.order_notes_placeholder}
              rows={3}
            />
          </section>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-lg font-bold">{t.order_summary}</h2>

              {/* Items */}
              <div className="max-h-64 space-y-3 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="line-clamp-1 font-medium">{item.name}</p>
                      <p className="text-muted-foreground">
                        {item.quantity} x {t.currency}
                        {item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {t.currency}
                      {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <hr className="my-4" />

              {/* Coupon */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder={t.coupon_code}
                      className="pl-10"
                      disabled={!!appliedCoupon}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleApplyCoupon}
                    disabled={couponMutation.isPending || !!appliedCoupon}
                  >
                    {couponMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t.apply
                    )}
                  </Button>
                </div>
                {couponMutation.isError && (
                  <p className="mt-1 text-xs text-destructive">
                    {(couponMutation.error as any)?.response?.data?.message ||
                      t.error}
                  </p>
                )}
                {appliedCoupon && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <Check className="h-4 w-4" />
                    {t.coupon_applied}: {appliedCoupon.title}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.subtotal}</span>
                  <span>
                    {t.currency}
                    {subtotal.toFixed(2)}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>{t.coupon_discount}</span>
                    <span>
                      -{t.currency}
                      {couponDiscount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.shipping}</span>
                  <span>
                    {t.currency}
                    {shippingAmount.toFixed(2)}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>{t.total}</span>
                  <span>
                    {t.currency}
                    {total.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                className="mt-6 w-full"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={
                  placeOrderMutation.isPending ||
                  createIyzicoSessionMutation.isPending ||
                  createPaytrSessionMutation.isPending ||
                  !paymentMethod ||
                  (!selectedAddressId && paymentMethod !== "takeaway") ||
                  selectedAddressMissingLocation ||
                  (paymentMethod === "wallet" && (walletData?.wallets?.total_balance ?? 0) < total)
                }
              >
                {placeOrderMutation.isPending ||
                createIyzicoSessionMutation.isPending ||
                createPaytrSessionMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.placing_order}
                  </>
                ) : (
                  t.place_order
                )}
              </Button>

              <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
                <p className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                  Ödeme bilgileriniz güvenli ödeme kuruluşu üzerinden işlenir.
                </p>
                <p className="flex items-center gap-2">
                  <Truck className="h-4 w-4 shrink-0 text-primary" />
                  Kargo ücreti ve sipariş toplamı ödeme öncesinde yukarıda gösterilir.
                </p>
                <p className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 shrink-0 text-primary" />
                  İade ve değişim koşullarını inceleyebilirsiniz.
                  <Link href="/iade-degisim" className="font-medium text-primary underline">
                    Koşullar
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
