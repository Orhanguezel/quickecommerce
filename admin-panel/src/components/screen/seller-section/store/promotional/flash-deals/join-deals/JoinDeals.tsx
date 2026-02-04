"use client";
import AddToCardIcon from "@/assets/icons/AddToCardIcon";
import CreateOrUpdateJoinDealsForm from "@/components/blocks/seller-section/store/promotional/flash-deals/join-deals/CreateOrUpdateJoinDealsForm";
import { Card, CardContent } from "@/components/ui";
import { SellerRoutes } from "@/config/sellerRoutes";
import { useTranslations } from "next-intl";
import Link from "next/link";

const JoinDeals = ({ ID }: any) => {
  const t = useTranslations();
  if (!ID) {
    return (
      <div className="mt-10">
        <h1 className="text-xl text-red-500">{t("common.invalid_id")}</h1>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div className="flex items-center justify-start md:justify-center gap-2">
            <AddToCardIcon />
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("common.join_deals")}
            </h1>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white  bg-blue-100 hover:bg-blue-500 py-2 px-4 rounded flex items-center gap-2">
              <Link className="" href={SellerRoutes.MyDealsList}>
                {t("common.my_deals")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <>
        <CreateOrUpdateJoinDealsForm ID={ID} />
      </>
    </div>
  );
};

export default JoinDeals;
