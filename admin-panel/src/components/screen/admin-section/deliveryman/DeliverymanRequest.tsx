"use client";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import DeliverymanRequestTable from "@/components/blocks/admin-section/deliveryman/DeliverymanRequestTable";
import { Card, CardContent } from "@/components/ui";
import { Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const DeliverymanRequest = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLoading]);

  return (
    <>
      <LoaderOverlay isLoading={isLoading} />
      <Card>
        <CardContent className="flex items-center justify-between p-2 lg:p-4">
          <div className="">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <Users /> {t("label.deliveryman_request")}{" "}
            </h1>
          </div>
        </CardContent>
      </Card>
      <DeliverymanRequestTable />
    </>
  );
};

export default DeliverymanRequest;
