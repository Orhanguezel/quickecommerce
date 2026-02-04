// Invoice.tsx
import React, { forwardRef } from "react";

interface InvoiceProps {
  invoice: any;
}

export const InvoiceReceipt = forwardRef<HTMLDivElement, InvoiceProps>(
  ({ invoice }, ref) => {
    return (
      <div ref={ref} className="max-w-[320px] p-4 text-xs text-black">
        <div className="text-center">
          <h2 className="text-base font-bold">{invoice?.store_name || "STORE NAME"}</h2>
          <p>{invoice?.store_address || ""}</p>
          <p>Mobile: {invoice?.store_phone || ""}</p>
          <h3 className="mt-1 text-sm font-bold">INVOICE PAID</h3>
        </div>

        <p><b>Invoice:</b> {invoice.invoice_number}</p>
        <p><b>Customer:</b> {invoice.customer?.name}</p>
        <p><b>Date:</b> {invoice.invoice_date}</p>
        <hr className="border-dashed my-2" />

        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-dashed">
              <th className="text-left">PRODUCT</th>
              <th className="text-right">QNT.</th>
              <th className="text-right">PRICE</th>
              <th className="text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item: any, idx: number) => (
              <tr key={idx}>
                <td>
                  {item.name}
                  <br />
                  <small>
                    {Object.entries(item.variant)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ")}
                  </small>
                </td>
                <td className="text-right">{item.quantity}</td>
                <td className="text-right">{item.price}</td>
                <td className="text-right">{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr className="border-dashed my-2" />

        <div className="space-y-1">
          <p><b>Total:</b> {invoice.subtotal}</p>
          <p><b>Tax:</b> {invoice.total_tax_amount}</p>
          <p><b>Discount:</b> {invoice.product_discount_amount}</p>
          <p><b>Shipping:</b> {invoice.shipping_charge}</p>
          <p><b>Grand Total:</b> {invoice.total_amount}</p>
        </div>

        <hr className="border-dashed my-2" />
        <div className="text-center">
          <p>Thank you for shopping!</p>
          <small>Powered by POS System</small>
        </div>
      </div>
    );
  }
);

InvoiceReceipt.displayName = "InvoiceReceipt";
