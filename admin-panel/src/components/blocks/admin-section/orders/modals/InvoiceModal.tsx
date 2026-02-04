import { formatPrice } from "@/components/molecules/formatPrice";
import Loader from "@/components/molecules/Loader";
import { AppModal } from "@/components/blocks/common/AppModal";
import { useInvoiceQuery } from "@/modules/admin-section/orders/orders.action";
import {
  useCurrencyQuery,
  useGeneralQuery,
} from "@/modules/common/com/com.action";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
interface ConfirmationModalProps {
  trigger: any;
  loading?: boolean;
  title?: string;
  subTitle?: string;
  onSave?: () => void;
  InvoiceList?: any;
  RowId?: any;
}

const InvoiceModal: React.FC<ConfirmationModalProps> = ({
  onSave,
  trigger,
  loading,
  RowId,
}) => {
  const t = useTranslations();
  const pathname = usePathname();
  const localeMain = useLocale();

  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { InvoiceList, isPending } = useInvoiceQuery({
    order_id: RowId,
  });
  const InvoiceListData = InvoiceList as any;

  const {
    customer,
    invoice_date,
    invoice_number,
    additional_charge_name,
    total_amount,
    payment_status,
    packages,
  } = InvoiceListData;

  const { currency, refetch: refetchCurrency } = useCurrencyQuery({});
  const currencyData = useMemo(() => {
    const data = (currency as any) || {};
    return data;
  }, [currency]);
  const CurrencyData = currencyData.currencies_info;

  const { general, refetch: generalRefetch } = useGeneralQuery({
    language: localeMain,
  });

  const QueryGeneralSettingsData = useMemo(
    () => (general as any)?.site_settings || {},
    [general]
  );

  const [isDownloading, setIsDownloading] = useState(false);

  const invoiceRef = useRef<HTMLDivElement>(null);

  const convertImageToBase64 = async (url: string): Promise<string> => {
    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleDownloadInvoice = async () => {
    setIsDownloading(true);
    setIsModalOpen(false);

    setTimeout(async () => {
      if (!invoiceRef.current) return;
      try {
        const container = invoiceRef.current;
        const images = container.querySelectorAll("img");
        await Promise.all(
          Array.from(images).map(async (img) => {
            const src = img.getAttribute("src") || "";
            if (src && !src.startsWith("data:")) {
              try {
                const base64 = await convertImageToBase64(src);
                img.setAttribute("src", base64);
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? `Error refetching data: ${error.message}`
                    : "An unknown error occurred while refetching data"
                );
              }
            }
          })
        );

        const scrollContainer = container.querySelector(
          ".custom-scrollbar"
        ) as HTMLElement;

        const originalMaxHeight = scrollContainer?.style.maxHeight;
        const originalOverflow = scrollContainer?.style.overflow;

        if (scrollContainer) {
          scrollContainer.style.maxHeight = "none";
          scrollContainer.style.overflow = "visible";
        }

        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#fff",
        });

        if (scrollContainer) {
          scrollContainer.style.maxHeight = originalMaxHeight;
          scrollContainer.style.overflow = originalOverflow;
        }

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`invoice_${invoice_number}.pdf`);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? `Error refetching data: ${error.message}`
            : "An unknown error occurred while refetching data"
        );
      } finally {
        setIsDownloading(false);
      }
    }, 300);
  };

  return (
    <AppModal
      trigger={trigger}
      actionButtonLabel="Download Invoice"
      customClass="inset-x-25p top-[20px] bg-white"
      onSave={handleDownloadInvoice}
      disable={loading}
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      IsLoading={loading || isDownloading}
      hideX
    >
      {isPending ? (
        <Loader customClass="mt-10" size="large" />
      ) : (
        <div ref={invoiceRef} className="p-4">
          <div className="text-black dark:text-white text-base font-semibold flex items-center justify-between gap-2">
            <div className="flex items-center">
              <p className="">{t("orders.invoice_number")}:</p>
              <p className="mx-1 text-gray-500 dark:text-white">
                {invoice_number}
              </p>
            </div>
            <div className="flex items-center">
              <p className="">{t("orders.date")}:</p>
              <p className="mx-1 text-gray-500 dark:text-white">
                {invoice_date}
              </p>
            </div>
          </div>
          <div className="relative my-12">
            <div className="grid grid-cols-2 items-start justify-between my-4">
              <div className="flex items-center gap-2">
                <div>
                  <div className="text-2xl font-bold mb-2">
                    {QueryGeneralSettingsData?.com_site_logo ? (
                      <div className="relative w-20 h-8">
                        <img
                          src={QueryGeneralSettingsData?.com_site_logo}
                          alt="quick_ecommerce"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="relative w-12 h-12">
                        <img
                          src="/images/no-image.png"
                          alt="quick_ecommerce"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>

                  <p className="text-sm">
                    <span className="font-semibold mr-1">Email:</span>{" "}
                    {QueryGeneralSettingsData?.com_site_email}
                  </p>
                  <p className="text-sm ">
                    <span className="font-semibold mr-1">Phone:</span>{" "}
                    {QueryGeneralSettingsData?.com_site_contact_number}
                  </p>
                  <p className=" text-sm">
                    <span className="font-semibold mr-1">Address:</span>{" "}
                    {QueryGeneralSettingsData?.com_site_full_address}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold mr-1">Web:</span>{" "}
                    {QueryGeneralSettingsData?.com_site_website_url}
                  </p>
                </div>
              </div>
              <div className="space-y-1 text-right">
                <p className="font-semibold">{t("orders.billed_to")}</p>
                <p className="text-sm ">{customer?.phone}</p>
                <p className="text-sm ">{customer?.email}</p>
                <p className="text-sm">
                  {customer?.shipping_address?.house &&
                    `#H-${customer?.shipping_address?.house},`}
                  {customer?.shipping_address?.floor &&
                    `F-${customer?.shipping_address?.floor}, `}
                  {customer?.shipping_address?.road &&
                    `R-${customer?.shipping_address?.road},`}{" "}
                  {customer?.shipping_address?.address &&
                    `${customer?.shipping_address?.address},`}
                  {customer?.shipping_address?.postal_code &&
                    customer?.shipping_address?.postal_code}{" "}
                </p>
              </div>
            </div>

            <>
              <div className="w-full mt-12">
                <div className="grid grid-cols-5 border-t  bg-blue-500 text-white text-md font-bold rounded">
                  <h2 className="col-span-2 p-2 text-left uppercase">
                    {t("orders.item_detail")}
                  </h2>
                  <h2 className="p-2 uppercase text-right">
                    {t("common.price")}
                  </h2>
                  <h2 className="p-2 uppercase text-right">
                    {t("common.qty")}
                  </h2>
                  <h2 className="p-2 uppercase text-right">
                    {t("common.amount")}
                  </h2>
                </div>

                <div className="border-b border-gray-300 max-h-[250px] overflow-y-auto custom-scrollbar">
                  {Array.isArray(InvoiceListData?.items) &&
                  InvoiceListData?.items.length > 0
                    ? InvoiceListData?.items?.map(
                        (orderPackage: any, index: any) => {
                          const {
                            amount,
                            quantity,
                            name,
                            price,
                            order_amount,
                            variant = {},
                          } = orderPackage;
                          return (
                            <div
                              className="border-b border-slate-300 py-2"
                              key={index}
                            >
                              <div className="grid grid-cols-5 p-2">
                                <div className="col-span-2">
                                  <p className="font-semibold">{name}</p>{" "}
                                  <div className="grid grid-cols-2 gap-1">
                                    {Object.entries(variant).map(
                                      ([key, value]) => (
                                        <p
                                          key={key}
                                          className="text-black dark:text-white text-sm font-medium"
                                        >
                                          {key
                                            .replace(/_/g, " ")
                                            .replace(/\b\w/g, (char) =>
                                              char.toUpperCase()
                                            )}{" "}
                                          :{" "}
                                          <span className="text-gray-500 dark:text-white font-normal">
                                            {String(value)}
                                          </span>
                                        </p>
                                      )
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm font-semibold text-gray-500 dark:text-white text-end">
                                  {CurrencyData
                                    ? formatPrice(price, CurrencyData)
                                    : price}
                                </p>
                                <p className="text-sm font-semibold text-gray-500 dark:text-white text-end">
                                  {quantity}
                                </p>
                                <p className="text-sm font-semibold text-gray-500 dark:text-white text-end">
                                  {CurrencyData
                                    ? formatPrice(amount, CurrencyData)
                                    : amount}
                                </p>
                              </div>
                            </div>
                          );
                        }
                      )
                    : ""}
                </div>
              </div>

              <div className="grid grid-cols-3 ">
                <div />
                <div className="col-span-2 mx-6">
                  <div className="py-2 text-right border-b border-gray-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <p>{t("common.subtotal")} :</p>
                      <p>
                        {CurrencyData
                          ? formatPrice(InvoiceListData?.subtotal, CurrencyData)
                          : InvoiceListData?.subtotal}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p>
                        {t("common.tax")} ({InvoiceListData?.tax_rate_sum}%) :
                      </p>
                      <p>
                        {CurrencyData
                          ? formatPrice(
                              InvoiceListData?.total_tax_amount,
                              CurrencyData
                            )
                          : InvoiceListData?.total_tax_amount}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p>{t("orders.coupon_discount")} :</p>
                      <p>
                        {CurrencyData
                          ? formatPrice(
                              InvoiceListData?.coupon_discount,
                              CurrencyData
                            )
                          : InvoiceListData?.coupon_discount}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p>
                        {t("orders.additional_charge")}{" "}
                        <span className="px-1">({additional_charge_name})</span>{" "}
                        :
                      </p>
                      <p>
                        {CurrencyData
                          ? formatPrice(
                              InvoiceListData?.additional_charge,
                              CurrencyData
                            )
                          : InvoiceListData?.additional_charge}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p>{t("orders.delivery_fee")} :</p>
                      <p>
                        {CurrencyData
                          ? formatPrice(
                              InvoiceListData?.shipping_charge,
                              CurrencyData
                            )
                          : InvoiceListData?.shipping_charge}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-right">
                    <div className="flex items-center justify-between font-semibold">
                      <p>{t("common.total")} :</p>
                      <p>
                        {CurrencyData
                          ? formatPrice(
                              InvoiceListData?.total_amount,
                              CurrencyData
                            )
                          : InvoiceListData?.total_amount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          </div>
        </div>
      )}
    </AppModal>
  );
};

export default InvoiceModal;
