"use client";
import DwonIcon from "@/assets/icons/DwonIcon";
import UpIcon from "@/assets/icons/UpIcon";
import Delete from "@/components/blocks/custom-icons/Delete";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import { formatNumberOnly } from "@/components/molecules/formatNumberOnly";
import { formatPrice } from "@/components/molecules/formatPrice";
import { Button, Card, CardContent } from "@/components/ui";
import GlobalImageLoader from "@/lib/imageLoader";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import {
  useCouponMutation,
  usePlaceOrderMutation,
  usePosInvoiceMutation,
  usePosSettingsQuery,
} from "@/modules/seller-section/pos/Pos.action";
import { useAppSelector } from "@/redux/hooks";
import {
  clearCart,
  removeFromCart,
  updateQuantity,
} from "@/redux/slices/cartSlice";
import { RootState } from "@/redux/store";
import { Minus, Plus, TicketPercent } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import OrderConfirmModal from "../modals/OrderConfirmModal";
import NoDataFoundIcon from "@/assets/icons/NoDataFoundIcon";
import OrderCancel from "@/components/blocks/custom-icons/OrderCancel";

interface Coupon {
  discounted_amount: any;
  title: string;
  code: string;
  discount_amount: number;
  discount_type: "amount" | "percent";
}

const PlaceOrder = ({ customerDetails }: any) => {
  const t = useTranslations();
  const [showCouponField, setShowCouponField] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [coupon, setCoupon] = useState("");
  const [tota_tax, setTota_tax] = useState(0);
  const [taxType, setTaxType] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [dis, setDis] = useState(0);
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const store_id = selectedStore?.id;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const PaymentType = [
    { label: "Cash", value: "cash" },
    { label: "Card", value: "card" },
    { label: "Wallet", value: "wallet" },
  ];
  const [selectedPayment, setSelectedPayment] = useState("cash");

  const cart = useSelector((state: RootState) => state.cart.cart);
  const SubTotalPrice = useSelector(
    (state: RootState) => state.cart.totalPrice
  );
  const dispatch = useDispatch();
  const itemCount = cart.length;

  const { PosSettings } = usePosSettingsQuery({});
  const QueryCommissionSettingsData = useMemo(
    () => (PosSettings as any) || [],
    [PosSettings]
  );

  const message = QueryCommissionSettingsData?.data;

  const { currency, refetch: refetchCurrency } = useCurrencyQuery({});
  const currencyData = useMemo(() => {
    const data = (currency as any) || {};
    return data;
  }, [currency]);
  const CurrencyData = currencyData.currencies_info;

  const { mutate: couponStore, isPending: isPendingCreateData } =
    useCouponMutation();

  const handleCouponApply = () => {
    const submissionData = {
      coupon_code: inputValue,
      sub_total: SubTotalPrice,
    };
    return couponStore(
      { ...(submissionData as any) },
      {
        onSuccess: (data) => {
          setInputValue("");
          setAppliedCoupon((data as any).data.coupon);
          setCoupon((data as any).data.coupon.code);
          setDis((data as any).data.coupon.discounted_amount);
        },
      }
    );
  };

  useEffect(() => {
    if (appliedCoupon) {
      setAppliedCoupon(null);
      setCoupon("");
      setDis(0);
    }
  }, [SubTotalPrice, appliedCoupon]);

  const formatOrderData = (cart: any[]) => {
    const groupedPackages = cart.reduce((acc, item) => {
      const storeId = item.store_id;
      let finalQuantity = item.quantity;
      if (!acc[storeId]) {
        acc[storeId] = {
          items: [],
        };
      }
      acc[storeId].items.push({
        product_id: item.id,
        quantity: finalQuantity,
        variant_id: item.variantDetails?.id || null,
      });
      return acc;
    }, {} as Record<number, any>);

    return { package: Object.values(groupedPackages) };
  };

  const cartData = formatOrderData(cart);

  const selectedData = cart.map((store: any) => {
    const itemTaxAmount =
      store.price * (Number(store.store_tax) / 100) * store.quantity;
    const TaxAmount: any = CurrencyData
      ? formatNumberOnly(Number(store.store_tax), CurrencyData)
      : Number(store.store_tax);
    return {
      ...store,
      item_tax: CurrencyData
        ? formatNumberOnly(Number(itemTaxAmount), CurrencyData)
        : Number(itemTaxAmount),
    };
  });

  useEffect(() => {
    if (!Array.isArray(selectedData) || selectedData.length === 0) return;

    const totalTax = selectedData.reduce(
      (sum, item) => sum + Number(item.item_tax ?? 0),
      0
    );

    if (totalTax !== tota_tax) {
      setTota_tax(totalTax);
    }
  }, [selectedData, tota_tax]);

  const handleRemove = (id: number) => {
    dispatch(removeFromCart(id));
  };

  const total = Number(SubTotalPrice) - Number(dis) + Number(tota_tax);

  const orderData = {
    store_id: store_id,
    customer_id: customerDetails?.id,
    payment_gateway: selectedPayment,
    ...(coupon && { coupon_code: coupon }),
    ...cartData,
  };

  const { mutate: PosInvoice } = usePosInvoiceMutation();
  const { mutate: placeOrder, isPending } = usePlaceOrderMutation();

  const handlePlaceOrder = () => {
    return placeOrder(
      { ...(orderData as any) },
      {
        onSuccess: (data: any) => {
          setIsModalOpen(false);
          let OrderID = data?.data?.order_id;
          PosInvoice(
            {
              store_id: store_id,
              order_id: OrderID,
            },
            {
              onSuccess: (invoiceRes: any) => {
                dispatch(clearCart());
                setTota_tax(0);
                setSelectedPayment("cash");

                // generate the HTML
                const printContent = generateInvoiceHTML(invoiceRes?.data);
                const printWindow = window.open("", "_blank");
                if (printWindow) {
                  printWindow.document.write(printContent);
                  printWindow.document.close();
                  printWindow.focus();

                  // wait for image to load
                  const img = printWindow.document.querySelector("img");
                  if (img) {
                    img.onload = () => {
                      printWindow.print();
                      printWindow.close();
                    };
                  } else {
                    printWindow.print();
                    printWindow.close();
                  }
                }
              },
              onError: (err: any) => {
                console.error("Invoice error:", err);
              },
            }
          );
        },
      }
    );
  };

  const generateInvoiceHTML = (invoiceData: any) => {
    const invoice = invoiceData?.invoice;
    const storeDetails = invoiceData?.store_details;
    const qrCode = invoiceData?.qr_code;
    const cleanQRCode = qrCode.replace(/\n/g, "").replace(/\r/g, "");

    //Select style based on page type
    const isThermal = message?.com_pos_settings_print_invoice === "thermal";

    return `
  <html>
    <head>
      <title>Invoice ${invoice.invoice_number}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          ${isThermal ? "max-width: 80mm;" : "width: 210mm;"} 
          margin: 0 auto;
          ${isThermal ? "padding: 10px;" : "padding: 20mm 15mm;"}
          font-size: ${isThermal ? "13px" : "14px"};
          color: #000;
        }
          @page {
          size: ${isThermal ? "80mm auto" : "A4"}; 
          margin: ${isThermal ? "5mm" : "15mm"}; /* printing margins */
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 8px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 5px; }
        th, td { padding: 4px; text-align: left; font-size: ${
          isThermal ? "12px" : "14px"
        }; }
        td { vertical-align: top; }
        .right { text-align: right; }
        .totals { margin-top: 10px; }
        .qr-code { margin-top: 10px; text-align: center; }
        .qr-code img { width: 80px; height: 80px; }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="center">
        <img
          src="${storeDetails?.logo}"
          alt="Store Logo"
          style="width: ${isThermal ? "50px" : "80px"}; height: ${
      isThermal ? "50px" : "80px"
    }; border-radius: 50%; object-fit: cover; margin: 0 auto 5px auto;"
        />
        <h2 style="margin: 0; font-size: ${isThermal ? "16px" : "22px"};">${
      storeDetails?.name || "STORE NAME"
    }</h2>
        <p style="margin: 0; font-size: 12px;">${
          storeDetails?.address || ""
        }</p>
        <p style="margin: 0; font-size: 12px;"><b>Contact:</b> ${
          storeDetails?.phone
        }, ${storeDetails?.email}</p>
        <h3 style="margin: 5px 0; font-size: ${
          isThermal ? "14px" : "18px"
        };">INVOICE PAID</h3>
      </div>

      <!-- Invoice Details -->
      <p><b>Invoice:</b> ${invoice.invoice_number}</p>
      <p><b>Customer:</b> ${invoice.customer?.name}</p>
      <p><b>Date:</b> ${invoice.invoice_date}</p>
      <div class="line"></div>

      <!-- Items Table -->
      <table>
        <thead>
          <tr>
            <th>PRODUCT</th>
            <th class="center">QTY</th>
            <th class="right">PRICE</th>
            <th class="right">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items
            .map(
              (item: any) => `
              <tr>
                <td>${item.name}<br/>
                  <small>${Object.entries(item.variant)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(", ")}</small>
                </td>
                <td class="center">${item.quantity}</td>
                <td class="right">${
                  CurrencyData
                    ? formatPrice(item.price, CurrencyData)
                    : item.price
                }</td>
                <td class="right">${
                  CurrencyData
                    ? formatPrice(item.amount, CurrencyData)
                    : item.amount
                }</td>
              </tr>
            `
            )
            .join("")}
        </tbody>
      </table>

      <div class="line"></div>

      <!-- Totals -->
      <div class="totals">
        <p><b>Sub Total:</b> ${
          CurrencyData
            ? formatPrice(invoice.subtotal, CurrencyData)
            : invoice.subtotal
        }</p>
        <p><b>Tax ${
          cart[0]?.store_tax
            ? `(${formatNumberOnly(Number(cart[0].store_tax), CurrencyData)}%)`
            : ""
        }:</b> ${
      CurrencyData
        ? formatPrice(invoice.total_tax_amount, CurrencyData)
        : invoice.total_tax_amount
    }</p>
        <p><b>Coupon Discount:</b> ${
          CurrencyData
            ? formatPrice(invoice.coupon_discount, CurrencyData)
            : invoice.coupon_discount
        }</p>
        <div class="line"></div>
        <p><b>Total:</b> ${
          CurrencyData
            ? formatPrice(invoice.total_amount, CurrencyData)
            : invoice.total_amount
        }</p>
      </div>

      <div class="line"></div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div class="center">
          <p>Thank you for shopping!</p>
          <small>Powered by POS System</small>
        </div>
        <div class="qr-code">
          <img src="${cleanQRCode}" alt="QR Code" />
        </div>
      </div>
    </body>
  </html>`;
  };

  const handleQuantityChange = (id: number, quantity: number) => {
    dispatch(updateQuantity({ id, quantity }));
  };
  return (
    <>
      <Card className="sticky top-[90px]">
        <CardContent className="space-y-4 p-2 md:p-4">
          <>
            <div className="w-full rounded-lg  cart-icon">
              <>
                <div className="border-b pb-4 border-slate-300 grid grid-cols-7 text-sm font-semibold sm:font-bold">
                  <h2 className="col-span-3">Item</h2>
                  <h2 className="text-center">Price</h2>
                  <h2 className="text-center">Qty</h2>
                  <h2 className="text-end">Sub Total</h2>
                  <h2 className="text-end">Actions</h2>
                </div>

                <div className=" max-h-[350px] min-h-[200px] overflow-y-auto custom-scrollbar">
                  {Array.isArray(cart) && cart.length > 0 ? (
                    cart.map((item: any, index: number) => {
                      const itemPrice =
                        (item.specialPrice || item.price) * item.quantity;
                      const validImage =
                        typeof item.image === "string" &&
                        item.image.trim() !== ""
                          ? item.image
                          : "/images/no-image.png";
                      const isMinReached = item.quantity === 1;
                      const isStockLimit = item.quantity >= item.stock;
                      const isCartLimit = item.quantity >= item.max_cart_qty;
                      const isMaxReached = isStockLimit || isCartLimit;

                      let maxTooltip = "";
                      if (isCartLimit && item.max_cart_qty <= item.stock) {
                        maxTooltip = `Maximum ${item.max_cart_qty} allowed per cart`;
                      } else if (
                        isStockLimit &&
                        item.stock < item.max_cart_qty
                      ) {
                        maxTooltip = `Only ${item.stock} in stock`;
                      } else {
                        maxTooltip = "You have reached the limit";
                      }
                      return (
                        <div className="border-b border-slate-300" key={index}>
                          <div className="grid grid-cols-7 py-4">
                            <div className="col-span-3 flex items-center gap-1">
                              <div className="relative w-[50px] h-[50px]">
                                <Image
                                  src={validImage}
                                  alt="product_image_url"
                                  fill
                                  sizes="(max-width: 640px) 64px, 80px"
                                  className="object-contain rounded"
                                  loader={GlobalImageLoader}
                                />
                              </div>
                              <div>
                                <h1 className="text-sm font-semibold truncate line-clamp-1">
                                  {item.name}
                                </h1>
                                <div className="">
                                  {Object.entries(
                                    item?.variantDetails?.attributes
                                  ).map(([key, value]) => (
                                    <p
                                      key={key}
                                      className="flex items-start text-black dark:text-white text-xs"
                                    >
                                      <span>
                                        {key
                                          .replace(/_/g, " ")
                                          .replace(/\b\w/g, (char) =>
                                            char.toUpperCase()
                                          )}
                                        :
                                      </span>
                                      <span className="text-gray-500 dark:text-white text-xs ml-1">
                                        {String(value)}
                                      </span>
                                    </p>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-200 text-center flex items-center justify-center">
                              {CurrencyData
                                ? formatPrice(item.price, CurrencyData)
                                : item.price}
                            </p>
                            <div className="flex flex-col items-center justify-center gap-1">
                              <div className="flex items-center justify-center py-1 bg-white dark:bg-[#1F2937]">
                                <div className="relative">
                                  <button
                                    onClick={() =>
                                      handleQuantityChange(
                                        item.id,
                                        item.quantity - 1
                                      )
                                    }
                                    className={`px-1 py-1 text-gray-700 border rounded ${
                                      isMinReached
                                        ? "bg-transparent dark:bg-gray-600 text-gray-700 dark:text-white cursor-not-allowed"
                                        : "bg-transparent dark:bg-gray-600 hover:bg-blue-500 text-gray-700 hover:text-white dark:text-white"
                                    }`}
                                    disabled={isMinReached}
                                  >
                                    <Minus size={14} />
                                  </button>
                                </div>

                                <div className="w-8 text-sm font-semibold text-gray-500 dark:text-gray-200 text-center">
                                  {item.quantity}
                                </div>
                                <div className="relative group/tooltip">
                                  <button
                                    onClick={() =>
                                      handleQuantityChange(
                                        item.id,
                                        item.quantity + 1
                                      )
                                    }
                                    className={`px-1 py-1 text-gray-700 bg-transparent border rounded dark:bg-gray-600 dark:text-white
                                    ${
                                      isMaxReached
                                        ? "cursor-not-allowed opacity-50"
                                        : "hover:bg-blue-500 hover:text-white"
                                    }`}
                                    disabled={isMaxReached}
                                  >
                                    <Plus size={14} />
                                  </button>
                                  {isMaxReached && (
                                    <div className="absolute bottom-[-35px] right-[-90px] -translate-x-1/2 mb-1 hidden group-hover/tooltip:block px-2 py-1 bg-black text-white text-xs rounded shadow-md whitespace-nowrap z-10">
                                      {maxTooltip}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-200 text-end flex items-center justify-end">
                              {CurrencyData
                                ? formatPrice(itemPrice, CurrencyData)
                                : itemPrice}
                            </p>

                            <div className="flex justify-end items-cneter">
                              <button
                                onClick={() => handleRemove(item.id)}
                                className=" text-red-500 hover:text-red-700 dark:text-red-400"
                              >
                                <OrderCancel />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500 py-10">
                      {/* <NoDataFoundIcon /> */}
                      <p className="mt-2 text-lg  text-gray-500 dark:text-white font-bold">
                        Empty Cart
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-blue-500 font-semibold text-[16px]">
                      Coupon
                    </label>
                    <button
                      onClick={() => setShowCouponField(!showCouponField)}
                      className="text-blue-500 font-semibold text-sm"
                    >
                      {showCouponField ? <UpIcon /> : <DwonIcon />}
                    </button>
                  </div>

                  {showCouponField && (
                    <>
                      <div className="flex items-center border rounded px-3 py-2 mt-2">
                        <TicketPercent className="text-gray-500 mr-3" />
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder={t("place_holder.enter_coupon_code")}
                          className="flex-1 outline-none text-sm min-h-[50px] rounded-lg disabled:cursor-not-allowed"
                          disabled={cart.length === 0}
                        />
                        <button
                          className="ml-2 text-blue-500 font-semibold disabled:cursor-not-allowed"
                          onClick={handleCouponApply}
                          disabled={cart.length === 0 || !inputValue}
                        >
                          Apply
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm ">
                    <span>Sub Total</span>
                    <span>
                      {CurrencyData
                        ? formatPrice(SubTotalPrice, CurrencyData)
                        : SubTotalPrice}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Coupon Discount</span>
                    <span>
                      (-){" "}
                      {CurrencyData
                        ? formatPrice(dis, CurrencyData)
                        : dis.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm pb-4">
                    <span>
                      {t("common.tax")}
                      {cart[0]?.store_tax
                        ? ` (${formatNumberOnly(
                            Number(cart[0].store_tax),
                            CurrencyData
                          )}%)`
                        : ""}
                    </span>

                    <span>
                      {CurrencyData
                        ? formatPrice(tota_tax, CurrencyData)
                        : Number(tota_tax).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-6 text-md font-semibold text-blue-600 border-t pt-2">
                    <span>Total Amount</span>
                    <span>
                      {CurrencyData
                        ? formatPrice(total, CurrencyData)
                        : total.toFixed(2)}
                    </span>
                  </div>
                  <div className="pt-8 pb-4 flex items-center gap-2 border-t border-slate-300 ">
                    <h2 className="text-lg font-semibold text-black dark:text-white">
                      Paid By:
                    </h2>
                    {PaymentType.map((payment, index) => {
                      const isSelected = selectedPayment === payment.value;
                      return (
                        <div
                          key={index}
                          onClick={() => setSelectedPayment(payment.value)}
                          className={`flex cursor-pointer  rounded px-4 py-1 text-sm font-semibold transition-colors duration-200 ${
                            isSelected
                              ? "bg-blue-500 text-white border border-blue-500"
                              : "text-gray-500 border border-slate-500"
                          }`}
                        >
                          {payment.label}
                        </div>
                      );
                    })}
                    {customerDetails?.wallet_balance !== undefined &&
                      selectedPayment === "wallet" && (
                        <div className="ml-auto flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                          <span>Available Balance:</span>
                          <span className="font-bold">
                            {CurrencyData
                              ? formatPrice(
                                  customerDetails.wallet_balance,
                                  CurrencyData
                                )
                              : customerDetails.wallet_balance.toFixed(2)}
                          </span>
                        </div>
                      )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <OrderConfirmModal
                    trigger={
                      <Button
                        disabled={!customerDetails || !customerDetails.id}
                        className={`w-full py-3 rounded mt-4 bg-blue-500 hover:bg-blue-600 text-white`}
                      >
                        Place Order
                      </Button>
                    }
                    total={
                      CurrencyData ? formatPrice(total, CurrencyData) : total
                    }
                    payemtMethod={selectedPayment}
                    handlePlaceOrder={handlePlaceOrder}
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    isPending={isPending}
                  />
                  <ConfirmationModal
                    trigger={
                      <Button
                        className={`w-full py-3 rounded mt-4 bg-red-500 hover:bg-red-600 text-white`}
                      >
                        Clear Cart
                      </Button>
                    }
                    onSave={() => {
                      dispatch(clearCart());
                      setTota_tax(0);
                      setSelectedPayment("cash");
                    }}
                    title="Clear Cart!"
                    subTitle="Are you sure you want to Clear Cart?"
                  />
                </div>
              </>
            </div>
          </>
        </CardContent>
      </Card>
    </>
  );
};

export default PlaceOrder;
