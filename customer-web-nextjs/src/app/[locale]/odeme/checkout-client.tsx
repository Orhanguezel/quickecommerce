"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { useCartStore } from "@/stores/cart-store";
import {
  useAddressListQuery,
  useAddAddressMutation,
  useCheckCouponMutation,
  usePlaceOrderMutation,
  usePaymentGatewaysQuery,
} from "@/modules/checkout/checkout.service";
import type {
  CustomerAddress,
  PlaceOrderInput,
  CheckoutPackage,
  PaymentGateway,
} from "@/modules/checkout/checkout.type";
import { Button } from "@/components/ui/button";
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
  "wallet",
]);

interface Props {
  translations: Record<string, string>;
}

export function CheckoutClient({ translations: t }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const clearCart = useCartStore((s) => s.clearCart);

  // State
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    title: string;
  } | null>(null);
  const [orderNotes, setOrderNotes] = useState("");

  // Address form state
  const [addressForm, setAddressForm] = useState({
    type: "home" as "home" | "office" | "others",
    title: "",
    email: "",
    contact_number: "",
    address: "",
    road: "",
    house: "",
    floor: "",
    postal_code: "",
  });

  // Queries & Mutations
  const { data: addresses, isLoading: addressesLoading } =
    useAddressListQuery();
  const addAddressMutation = useAddAddressMutation();
  const couponMutation = useCheckCouponMutation();
  const placeOrderMutation = usePlaceOrderMutation();
  const { data: paymentGateways, isLoading: gatewaysLoading } =
    usePaymentGatewaysQuery();

  const checkoutPaymentGateways = useMemo(
    () =>
      (paymentGateways ?? []).filter((gw) =>
        SUPPORTED_CHECKOUT_GATEWAYS.has(gw.slug)
      ),
    [paymentGateways]
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

  // Calculations
  const subtotal = totalPrice();
  const couponDiscount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal - couponDiscount);

  // Empty cart check
  if (items.length === 0) {
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
    addAddressMutation.mutate(
      {
        ...addressForm,
        status: 1,
        is_default: !addresses || addresses.length === 0,
      },
      {
        onSuccess: () => {
          setShowAddressForm(false);
          setAddressForm({
            type: "home",
            title: "",
            email: "",
            contact_number: "",
            address: "",
            road: "",
            house: "",
            floor: "",
            postal_code: "",
          });
        },
      }
    );
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    couponMutation.mutate(
      {
        coupon_code: couponCode.trim(),
        currency_code: "TRY",
        sub_total: subtotal,
      },
      {
        onSuccess: (data) => {
          setAppliedCoupon({
            code: data.coupon.code,
            discount: data.coupon.discounted_amount,
            title: data.coupon.title,
          });
        },
      }
    );
  };

  const handlePlaceOrder = () => {
    // Validate cart items have required IDs
    const invalidItems = items.filter((i) => !i.store_id || !i.variant_id);
    if (invalidItems.length > 0) {
      alert(
        "Sepetinizdeki bazı ürünlerde eksik bilgi var. Lütfen ürünleri kaldırıp tekrar ekleyin."
      );
      return;
    }

    // Group items by store
    const storeMap = new Map<number, typeof items>();
    for (const item of items) {
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
      currency_code: "TRY",
      payment_gateway: paymentMethod,
      order_notes: orderNotes || undefined,
      order_amount: total,
      coupon_code: appliedCoupon?.code,
      coupon_title: appliedCoupon?.title,
      coupon_discount_amount_admin: appliedCoupon?.discount,
      packages,
    };

    placeOrderMutation.mutate(orderData, {
      onSuccess: (data) => {
        clearCart();
        const orderId = data.order_master?.id ?? data.orders?.[0]?.order_id;
        router.push(`/${locale}/siparis-basarili?order=${orderId}`);
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
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
                      !addressForm.email ||
                      !addressForm.contact_number ||
                      !addressForm.address
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
              <div className="grid gap-3 sm:grid-cols-3">
                {checkoutPaymentGateways.map((gw: PaymentGateway) => {
                  const IconComponent = gatewayIconMap[gw.slug] ?? CreditCard;
                  return (
                    <button
                      key={gw.slug}
                      type="button"
                      onClick={() => setPaymentMethod(gw.slug)}
                      className={`flex items-center gap-3 rounded-lg border p-4 transition-colors ${
                        paymentMethod === gw.slug
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "hover:border-primary/50"
                      }`}
                    >
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
                    </button>
                  );
                })}
              </div>
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
                  <span className="text-sm text-muted-foreground">-</span>
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
                  !paymentMethod ||
                  (!selectedAddressId && paymentMethod !== "takeaway")
                }
              >
                {placeOrderMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.placing_order}
                  </>
                ) : (
                  t.place_order
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
