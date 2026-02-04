"use client";
import StepIcon from "@/assets/icons/StepIcon";
import VectorIcon from "@/assets/icons/VectorIcon";
import {
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
import { useSubscriptionPackagesStoreQuery } from "@/modules/seller-section/store/store.action";
import { RocketIcon } from "lucide-react";

export function BusinessPlanSection({
  selectedCard,
  setSelectedCard,
  setSubscription,
  activeTab,
  setActiveTab,
}: any) {
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
  return (
    <>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="bg-transparent">
          <Card className="w-full text-left whitespace-normal p-4 rounded">
            <p className="text-xl font-bold mb-4">Choose your Business Plan</p>
            <div className="grid w-full grid-cols-2  gap-4 text-gray-500 dark:text-white">
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
                      Commission Base
                    </span>
                  </div>
                  <p className="text-start ml-6">
                    Choose a commission-based plan to align with your business
                    growth. Pay only when you generate sales, making it ideal
                    for startups or businesses focused on minimizing upfront
                    costs. Enjoy key features like real-time sales tracking,
                    detailed analytics, and scalable opportunities to suit your
                    business needs.
                  </p>
                </div>
              </TabsTrigger>

              <TabsTrigger
                className={`rounded ${
                  activeTab === "subscription"
                } ? "border-2 border-blue-500 text-blue-500 shadow" : "shadow text-gray-500 dark:text-white"`}
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

                    <span className="mt-[-2px] text-start text-xl font-semibold">
                      Subscription Base
                    </span>
                  </div>

                  <p className="text-start ml-6">
                    Opt for a subscription-based plan to enjoy a fixed monthly
                    cost with access to premium features and support. This plan
                    is perfect for businesses looking to streamline operations
                    with tools like a POS system, self-delivery management,
                    mobile apps, and enhanced customer engagement tools. Unlock
                    predictable expenses with unlimited access to critical
                    features.
                  </p>
                </div>
              </TabsTrigger>
            </div>
          </Card>
        </TabsList>
        <TabsContent value="commission">
          <div></div>
        </TabsContent>
        <TabsContent value="subscription">
          <Card className="grid lg:grid-cols-4 gap-6 p-2 md:p-6 mt-4">
            {SubscriptionList.map((card: any) => (
              <div
                key={card.id}
                className={`shadow-lg cursor-pointer border border-white hover:border hover:border-blue-500 rounded ${
                  selectedCard === card.id ? "bg-blue-50 " : ""
                }`}
                onClick={() => handleCardSelect(card)}
              >
                <CardHeader>
                  <CardTitle className="text-4xl font-bold flex items-center justify-between">
                    <span>{card.price}</span>
                    <span className="p-2 rounded-full bg-blue-100 text-blue-500">
                      <RocketIcon />
                    </span>
                  </CardTitle>
                  <CardDescription>/ pre month</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 min-h-[200px]">
                  <div className="space-y-2">
                    <p className="text-lg md:text-2xl font-semibold">
                      {card.name}
                    </p>
                    <p className="text-md truncate">{card?.description}</p>
                  </div>

                  {card.pos_system && (
                    <div className="flex items-start gap-2">
                      <div>
                        <VectorIcon />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-white leading-none mt-1">
                          POS System
                        </p>
                      </div>
                    </div>
                  )}
                  {card.self_delivery && (
                    <div className="flex items-start gap-2 ">
                      <div>
                        <VectorIcon />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-white leading-none mt-1">
                          Self Delivery
                        </p>
                      </div>
                    </div>
                  )}
                  {card.mobile_app && (
                    <div className="flex items-start gap-2 ">
                      <div>
                        <VectorIcon />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-white leading-none mt-1">
                          Mobile App
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <span className="w-full py-2 text-center rounded-lg bg-blue-600 text-white font-500 hover:bg-blue-700">
                    Get Started
                  </span>
                </CardFooter>
              </div>
            ))}
          </Card>
        </TabsContent>
        {/* </Card> */}
      </Tabs>
    </>
  );
}
