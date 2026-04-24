"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { ROUTES } from "@/config/routes";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useCartUnsubscribeMutation } from "@/modules/cart/abandoned-cart.service";

interface Props {
  token: string;
}

export function UnsubscribeClient({ token }: Props) {
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const unsubscribe = useCartUnsubscribeMutation();

  useEffect(() => {
    if (!token) {
      setState("error");
      return;
    }
    unsubscribe.mutate(
      { token },
      {
        onSuccess: () => setState("success"),
        onError: () => setState("error"),
      }
    );
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        {state === "loading" && (
          <>
            <Loader2 className="mx-auto mb-6 h-16 w-16 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">İşleminiz yapılıyor...</p>
          </>
        )}

        {state === "success" && (
          <>
            <CheckCircle className="mx-auto mb-6 h-20 w-20 text-green-500" />
            <h1 className="mb-3 text-2xl font-bold">Abonelikten çıkıldı</h1>
            <p className="mb-6 text-muted-foreground">
              Artık sepet hatırlatma e-postalarını almayacaksınız.
              Fikrinizi değiştirirseniz hesap ayarlarınızdan tekrar aktifleştirebilirsiniz.
            </p>
            <Link
              href={ROUTES.HOME}
              className="inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              Ana Sayfa
            </Link>
          </>
        )}

        {state === "error" && (
          <>
            <XCircle className="mx-auto mb-6 h-20 w-20 text-red-500" />
            <h1 className="mb-3 text-2xl font-bold">Geçersiz bağlantı</h1>
            <p className="mb-6 text-muted-foreground">
              Bu abonelikten çıkma bağlantısı geçersiz veya süresi dolmuş.
              Destek ekibimizle iletişime geçebilirsiniz.
            </p>
            <Link
              href={ROUTES.HOME}
              className="inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              Ana Sayfa
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
