"use client";
import AddToCardIcon from "@/assets/icons/AddToCardIcon";
import MethodTable from "@/components/blocks/admin-section/financial/withdraw/method/MethodTable";
import { Button, Card, CardContent } from "@/components/ui";
import { Routes } from "@/config/routes";
import { useAppDispatch } from "@/redux/hooks";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MethodList = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <>
      <Card>
        <CardContent dir={dir} className="grid grid-cols-2 p-2 md:p-4">
          <div className="col-span-1">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <AddToCardIcon /> {t("common.withdrawal_methods")}
            </h1>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Link href={Routes.addMethod}>
              <Button variant="outline" className="app-button">
                + {t("button.add_new_method")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <MethodTable />
    </>
  );
};

export default MethodList;
