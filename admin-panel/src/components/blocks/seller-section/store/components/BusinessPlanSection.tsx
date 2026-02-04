"use client";
import MuteVectorIcon from "@/assets/icons/MuteVectorIcon";
import StepIcon from "@/assets/icons/StepIcon";
import VectorIcon from "@/assets/icons/VectorIcon";
import { formatPrice } from "@/components/molecules/formatPrice";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { useSubscriptionPackagesStoreQuery } from "@/modules/seller-section/store/store.action";
import { RocketIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useMemo } from "react";
import GlobalImageLoader from "@/lib/imageLoader";

export function BusinessPlanSection({
  register,
  selectedCard,
  setSelectedCard,
  setSubscription,
  activeTab,
  setActiveTab,
}: any) {
  const t = useTranslations();
  const { PackageList, refetch, isPending } = useSubscriptionPackagesStoreQuery(
    {}
  );
  let SubscriptionList = (PackageList as any)?.packages || [];
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "subscription") {
      refetch();
    }
  };
  const handleCardSelect = (item: any) => {
    const { id, price } = item;
    setSelectedCard(id);
    setSubscription(item);
  };
  const { currency, refetch: refetchCurrency } = useCurrencyQuery({});
  const currencyData = useMemo(() => {
    const data = (currency as any) || {};
    return data;
  }, [currency]);
  const CurrencyData = currencyData.currencies_info;
  return (
    <>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="bg-transparent">
          <Card className="w-full text-left whitespace-normal p-4 rounded">
            <p className="text-xl font-bold mb-4">
              {t("label.choose_your_business_plan")}
            </p>
            <div className="grid w-full grid-cols-1 md:grid-cols-2  gap-4">
              <TabsTrigger
                className={`${
                  activeTab === "commission"
                } ? "border-2 border-blue-500  shadow rounded " : "shadow rounded"`}
                value="commission"
              >
                <div
                  className={`${
                    activeTab === "commission"
                  } ? "text-start text-blue-500" : "text-start text-gray-500 dark:text-white"`}
                >
                  <div className="flex items-center gap-2">
                    {activeTab === "commission" ? (
                      <VectorIcon w="18" h="18" />
                    ) : (
                      <StepIcon w="18" h="18" />
                    )}

                    <span className="mt-[-2px] text-start  text-xl font-semibold">
                      {t("label.commission_base")}
                    </span>
                  </div>
                  <p className="text-start ml-6">
                    {t("label.commission_base_subtitle")}
                  </p>
                </div>
              </TabsTrigger>

              <TabsTrigger
                className={`rounded ${
                  activeTab === "subscription"
                } ? "border-2 border-blue-500 text-blue-500 shadow " : "shadow dark:text-white"`}
                value="subscription"
              >
                <div
                  className={`${
                    activeTab === "subscription"
                  } ? "text-start text-blue-500" : "text-start text-gray-500 dark:text-white"`}
                >
                  <div className="flex items-center gap-2">
                    {activeTab === "subscription" ? (
                      <VectorIcon w="18" h="18" />
                    ) : (
                      <StepIcon w="18" h="18" />
                    )}

                    <span className="mt-[-2px] text-start text-xl font-semibold ">
                      {t("label.subscription_base")}
                    </span>
                  </div>

                  <p className="text-start ml-6">
                    {t("label.subscription_base_subtitle")}
                  </p>
                </div>
              </TabsTrigger>
            </div>
          </Card>
        </TabsList>
        <TabsContent value="commission">
          <div></div>
        </TabsContent>
        {/* <Card className="p-4 mt-4"> */}
        <TabsContent value="subscription">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 py-4 mt-4">
            {SubscriptionList.map((card: any) => (
              <div
                key={card.id}
                className={`shadow-custom hover:bg-blue-50 dark:hover:bg-[#162b4c] cursor-pointer rounded-xl ${
                  selectedCard === card.id
                    ? "bg-blue-50 dark:bg-[#162b4c] border-2 border-blue-500"
                    : "bg-white dark:bg-[#1e293b]"
                }`}
                onClick={() => handleCardSelect(card)}
              >
                <CardHeader>
                  <div className="text-3xl font-bold flex flex-col items-center justify-center ">
                    {card.image ? (
                      <Card className="w-12 md:w-16 h-12 md:h-16 cursor-pointer mb-2 bg-white p-2 rounded-full">
                        <Image
                          loader={GlobalImageLoader}
                          src={card.image_url}
                          alt="image"
                          width={100}
                          height={100}
                          className="w-full h-full  rounded-full"
                        />
                      </Card>
                    ) : (
                      <Card className="h-12 md:h-16">
                        <div className="p-2 md:p-6 bg-blue-400 rounded-full text-white mb-2">
                          <RocketIcon width={24} height={24} />
                        </div>
                      </Card>
                    )}

                    <div className="w-full flex items-start text-blue-500 my-2">
                      <span>
                        {card.price
                          ? formatPrice(card.price, CurrencyData)
                          : card.price}
                      </span>
                    </div>
                  </div>
                  <div>
                    {" "}
                    <span className="rounded-xl bg-[#113659] text-white px-2 py-0.5">
                      {card?.type}
                    </span>{" "}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 min-h-[200px]">
                  <div className="space-y-2 min-h-[80px]">
                    <p className="text-lg md:text-2xl font-semibold">
                      {card?.name}
                    </p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-md truncate cursor-default max-w-[200px]">
                            {card?.description}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          className="max-w-[200px] break-words"
                          side="top"
                          sideOffset={4}
                        >
                          <p>{card?.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="grid grid-cols-2 items-center gap-2">
                    <div>
                      <p className="mt-1">POS System</p>
                    </div>
                    <div className="flex justify-end">
                      {card.pos_system == true ? (
                        <VectorIcon />
                      ) : (
                        <MuteVectorIcon />
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 items-center gap-2">
                    <div>
                      <p className="mt-1">Live Chat</p>
                    </div>
                    <div className="flex justify-end">
                      {card.live_chat == 1 ? (
                        <VectorIcon />
                      ) : (
                        <MuteVectorIcon />
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 items-center gap-2">
                    <div>Order Limit</div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-white font-semibold text-end leading-none mt-1">
                        {card?.order_limit}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 items-center gap-2">
                    <div>Product Limit</div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-white font-semibold text-end leading-none mt-1">
                        {card?.product_limit}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 items-center gap-2">
                    <div>Featured Limit</div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-white font-semibold text-end leading-none mt-1">
                        {card?.product_featured_limit}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
