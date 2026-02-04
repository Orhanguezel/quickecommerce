"use client";
import { AppModal } from "@/components/blocks/common/AppModal";
import { Button } from "@/components/ui";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-toastify";

const InvoiceModal = ({
  trigger,
  isModalOpen,
  setIsModalOpen,
  orderDetails,
}: any) => {
  const printRef = useRef(null);
   const invoiceRef = useRef<HTMLDivElement>(null);
  
  const [isDownloading, setIsDownloading] = useState(false);

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

        pdf.save(`invoice.pdf`);
      } catch (error) {
        toast.error(
                  error instanceof Error
                    ? `Error refetching data: ${error.message}`
                    : "An unknown error occurred while refetching data"
                );
      } finally {
        setIsDownloading(false);
        setIsModalOpen(false);
      }
    }, 300);
  };

  //   const handlePrint = useReactToPrint({
  //     content: () => printRef.current,
  //     documentTitle: `Invoice-${orderDetails?.id || "Order"}`,
  //   });

  return (
    <AppModal
      trigger={trigger}
      hideX
      actionButtonLabel="Print Invoice"
      onSave={handleDownloadInvoice}
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      customClass="inset-x-0p md:inset-x-30p lg:inset-x-35p 2xl:inset-x-40p top-[100px] bg-white"
    >
      <div ref={invoiceRef} className="p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">Invoice</h1>

        {/* Order Info */}
        <div className="border-b pb-2 text-sm">
          <p>
            <strong>Order ID:</strong> {orderDetails?.id}
          </p>
          <p>
            <strong>Date:</strong> {new Date().toLocaleString()}
          </p>
          <p>
            <strong>Payment:</strong> {orderDetails?.payment_gateway}
          </p>
        </div>

        {/* Items */}
        <table className="w-full text-sm border mt-4">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Item</th>
              <th className="p-2 text-center">Qty</th>
              <th className="p-2 text-right">Price</th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orderDetails?.items?.map((item: any, idx: number) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{item.name}</td>
                <td className="p-2 text-center">{item.quantity}</td>
                <td className="p-2 text-right">{item.price}</td>
                <td className="p-2 text-right">
                  {(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="text-right mt-4 space-y-1">
          <p>
            <strong>Subtotal:</strong> {orderDetails?.subtotal}
          </p>
          {orderDetails?.discount ? (
            <p>
              <strong>Discount:</strong> -{orderDetails?.discount}
            </p>
          ) : null}
          <p>
            <strong>Tax:</strong> {orderDetails?.tax}
          </p>
          <p className="text-lg font-bold">Total: {orderDetails?.total}</p>
        </div>
      </div>
    </AppModal>
  );
};

export default InvoiceModal;
