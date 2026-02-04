"use client";
import BusinessPlanDetails from "@/components/blocks/seller-section/store/settings/business-plan/BusinessPlanDetails";
import { Card, CardContent } from "@/components/ui";
import { SquareActivity } from "lucide-react";
import { useTranslations } from "next-intl";

const BusinessPlan = () => {
  const t = useTranslations();
  return (
    <>
      <Card className="">
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <SquareActivity /> {t("common.business_plan")}{" "}
            </h1>
          </div>
        </CardContent>
      </Card>
      <div>
        <BusinessPlanDetails />
      </div>
    </>
  );
};

export default BusinessPlan;
