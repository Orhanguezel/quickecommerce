"use client";

import { Link } from "@/i18n/routing";
import { ROUTES } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface Props {
  orderId: string;
  translations: {
    order_success: string;
    order_success_message: string;
    order_number: string;
    continue_shopping: string;
    view_orders: string;
    home: string;
  };
}

export function OrderSuccessClient({ orderId, translations: t }: Props) {
  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <CheckCircle className="mx-auto mb-6 h-20 w-20 text-green-500" />
        <h1 className="mb-3 text-2xl font-bold">{t.order_success}</h1>
        <p className="mb-4 text-muted-foreground">{t.order_success_message}</p>

        {orderId && (
          <div className="mb-6 rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">{t.order_number}</p>
            <p className="text-lg font-bold">#{orderId}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href={ROUTES.ORDERS}>{t.view_orders}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={ROUTES.HOME}>{t.continue_shopping}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
