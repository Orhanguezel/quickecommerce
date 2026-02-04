"use client";
import MuteVectorIcon from "@/assets/icons/MuteVectorIcon";
import VectorIcon from "@/assets/icons/VectorIcon";
import { formatPrice } from "@/components/molecules/formatPrice";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CountItems } from "@/config/helperJson";
import GlobalImageLoader from "@/lib/imageLoader";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { useBuyPackageMutation } from "@/modules/seller-section/financial/wallet/wallet.action";
import {
  useBusinessPlanHistoryQuery,
  useBusinessPlanQuery,
  useCommissionSettingsQuery,
  useGenerateBusinessPlanHMAQuery,
  usePaymentStatusMutation,
  useSubscriptionToCommissionMutation,
} from "@/modules/seller-section/settings/business-plan/business-plan.action";
import { useSubscriptionPackagesStoreQuery } from "@/modules/seller-section/store/store.action";
import { useGetPermissionsQuery } from "@/modules/users/users.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { ChevronsLeftIcon, ChevronsRightIcon, RocketIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import CommissionConfirmModal from "./modals/CommissionConfirmModal";
import PaymentMethodModal from "./modals/PaymentMethodModal";
interface RecordType {
  id: string;
  slug: string;
  serial: string;
  name: string;
  logo?: string;
  logo_url?: string;
  banner?: string;
  payment_method?: string;
  banner_url?: string;
  payment_status?: string;
  payment_gateway?: string;
  transaction_ref?: string;
  price?: string;
  actions?: any;
  status?: boolean;
  key: React.Key;
  children?: RecordType[];
}
interface ColumnType<RecordType> {
  title: string;
  dataIndex?: keyof RecordType;
  key?: string;
  width?: number | string;
  fixed?: "left" | "right" | undefined;
  ellipsis?: boolean;
  children?: ColumnType<RecordType>[];
}
type ColumnsType<RecordType> = ColumnType<RecordType>[];

const BusinessPlanDetails = ({ searchValue }: any) => {
  const locale = useLocale();
  const t = useTranslations();
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const storedSlug = selectedStore?.slug;
  const storeId = selectedStore?.id;
  const [shouldRefetch, setShouldRefetch] = useState(false);
  const [activeTab, setActiveTab] = useState("subscription_details");
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    return parseInt(localStorage.getItem("itemsPerPage") || "10");
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortedInfo, setSortedInfo] = useState<{
    columnKey: string;
    order: string;
  }>({
    columnKey: "",
    order: "",
  });
  const savedStoreId = localStorage.getItem("store_id") || "";
  const dispatch = useAppDispatch();
  const [showPackages, setShowPackages] = useState(false);
  const [selectedCard, setSelectedCard] = useState("");
  const [paymentFor, setPaymentFor] = useState("");
  const [subscription, setSubscription] = useState<any>(null);

  const { refetch: permissionRefetch } = useGetPermissionsQuery({
    store_slug: storedSlug ?? "",
  });

  const { PackageList } = useSubscriptionPackagesStoreQuery({
    store_id: storeId,
  });
  let SubscriptionList = (PackageList as any)?.packages || [];

  const { CommissionSettings } = useCommissionSettingsQuery({});
  let CommissionSettingsData = (CommissionSettings as any) || [];

  const {
    BusinessPlanDetails,
    refetch: detailsRefetch,
    isPending: isDetailsPending,
  } = useBusinessPlanQuery(
    savedStoreId !== "" ? { store_id: savedStoreId } : {}
  );

  let originalData = (BusinessPlanDetails as any)?.store_subscription || {};
  let SubscriptionTypeData = (BusinessPlanDetails as any)?.store || {};
  const sortField = sortedInfo.order == "ascend" ? "asc" : "desc";
  const { BusinessPlanHistory, refetch, isPending, isFetching, error } =
    useBusinessPlanHistoryQuery({
      per_page: itemsPerPage,
      language: locale,
      page: currentPage,
      sort: sortField,
      sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
      store_id: savedStoreId,
    });
  let totalDataLength = (BusinessPlanHistory as any)?.meta?.total;
  const startIndex = (BusinessPlanHistory as any)?.meta?.from;
  const LastPage = (BusinessPlanHistory as any)?.meta?.last_page;
  const HistoryData = useMemo(() => {
    const data = (BusinessPlanHistory as any)?.subscription_history || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [BusinessPlanHistory, startIndex]);

  const { currency, refetch: refetchCurrency } = useCurrencyQuery({});
  const currencyData = useMemo(() => {
    const data = (currency as any) || {};
    return data;
  }, [currency]);
  const CurrencyData = currencyData.currencies_info;

  useEffect(() => {
    if (Number(currentPage) > Number(LastPage)) {
      setCurrentPage(LastPage);
    } else {
      setCurrentPage(currentPage);
    }
  }, [LastPage, currentPage]);

  const [transactionNo, setTransactionNo] = useState("");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "subscription_history") {
      refetch();
    } else if (tab === "subscription_details") {
      detailsRefetch();
    }
  };
  const updatePage = (p: any) => {
    setCurrentPage(p);
  };
  useEffect(() => {
    if (shouldRefetch) {
      refetch();
      setShouldRefetch(false);
      localStorage.setItem("store_id", String(storeId));
    }
  }, [shouldRefetch, refetch, storeId]);

  const handleSelectItemsPerPage = (value: string) => {
    const newItemsPerPage = parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    localStorage.setItem("itemsPerPage", value);
  };
  const handleSort = (columnKey: string) => {
    setSortedInfo((prev) => {
      const isSameColumn = prev.columnKey === columnKey;
      const newOrder =
        isSameColumn && prev.order === "ascend" ? "descend" : "ascend";
      return { columnKey, order: newOrder };
    });
  };

  const { generateHMAC } = useGenerateBusinessPlanHMAQuery({
    store_id: savedStoreId,
  });

  const hmac = (generateHMAC as any)?.hmac;
  const timestamp = (generateHMAC as any)?.timestamp;

  const { mutate: paymentStatus } = usePaymentStatusMutation(hmac);

  const UserEmail = localStorage.getItem("user_email") || "";
  const subscriptionId = localStorage.getItem("subscription_id") || "";
  const subscriptionHistoryId =
    localStorage.getItem("subscription_history_id") || "";

  const onSubmit = useCallback(
    async (StoreId: string, transaction_id: string) => {
      const defaultData = {
        store_id: StoreId,
        transaction_ref: transaction_id,
        timestamp,
        subscription_id: subscriptionId,
        subscription_history_id: subscriptionHistoryId,
      };

      if (!UserEmail || !timestamp) {
        return null;
      }

      return paymentStatus(
        { ...(defaultData as any) },
        {
          onSuccess: () => {
            detailsRefetch();
            localStorage.setItem("subscription_id", "");
            localStorage.setItem("subscription_history_id", "");
          },
        }
      );
    },
    [
      paymentStatus,
      UserEmail,
      detailsRefetch,
      subscriptionId,
      subscriptionHistoryId,
      timestamp,
    ]
  );

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id"
    );
    if (sessionId) {
      fetch(`/api/stripe-webhook?session_id=${sessionId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.transaction_id) {
            dispatch(setRefetch(true));
            onSubmit(savedStoreId, data.transaction_id);

            setTransactionNo(data.transaction_id);
            localStorage.setItem("transaction_id", data.transaction_id);
          } else {
            toast.error("No transaction_id found in response");
          }
        })
        .catch((error) =>
          toast.error(
            error instanceof Error
              ? `Error refetching data: ${error.message}`
              : "An unknown error occurred while refetching data"
          )
        );
    }
  }, [savedStoreId, onSubmit, dispatch]);

  const useColumn = (fixLeft: boolean): ColumnsType<RecordType> => {
    const columns: ColumnsType<RecordType> = useMemo(
      () => [
        {
          title: t("table_header.sl"),
          dataIndex: "serial",
          fixed: fixLeft ? "left" : undefined,
          width: "5%",
        },
        {
          title: t("table_header.package_name"),
          dataIndex: "name",
          width: "10%",
        },
        {
          title: t("table_header.transaction_ref"),
          dataIndex: "transaction_ref",
          width: "10%",
        },
        { title: t("table_header.price"), dataIndex: "price", width: "10%" },
        {
          title: t("table_header.payment_method"),
          width: "10%",
          dataIndex: "payment_method",
          render: (_:any , row: any) => (
            <div className="flex items-center capitalize gap-2">
              <div>
                <p className="">{row?.payment_gateway}</p>
              </div>
            </div>
          ),
        },
        {
          title: t("table_header.payment_status"),
          dataIndex: "payment_status",
          width: "10%",
          render: (payment_status: string, row: RecordType) => (
            <div>
              <Badge
                className={` ${
                  payment_status === "paid"
                    ? "bg-green-50 border border-green-500 text-green-500"
                    : payment_status === "pending"
                    ? "bg-yellow-50 border border-yellow-500 text-yellow-500"
                    : "bg-red-50 border border-red-500 text-red-500"
                } capitalize`}
              >
                {payment_status || "N/A"}
              </Badge>
            </div>
          ),
        },
      ],
      [fixLeft]
    );
    const renderColumns = columns.map((col: any) => {
      if (col.dataIndex === "price") {
        return {
          ...col,
          render: (price: any, row: RecordType) => (
            <span className="text-right">
              {CurrencyData ? formatPrice(price, CurrencyData) : price}
            </span>
          ),
        };
      }
      return col;
    });
    return renderColumns;
  };
  const { mutate: SubscriptionToCommission, isPending: isConfirm } =
    useSubscriptionToCommissionMutation();
  const handleSubscriptionToCommission = async () => {
    const defaultData = {
      store_id: savedStoreId,
      subscription_type: "subscription",
    };
    return SubscriptionToCommission(
      { ...(defaultData as any) },
      {
        onSuccess: () => {
          setActiveTab("subscription_details");
          detailsRefetch();
          setSubscription({});
          setShowPackages(false);
        },
      }
    );
  };
  const handleConfirm = () => {
    handleSubscriptionToCommission();
  };
  const handleCardSelect = (item: any) => {
    const { id, price } = item;
    setSelectedCard(id);
    setSubscription(item);
  };
  const handleChoosePackage = (e: any, item: any) => {
    e.stopPropagation();
    const { id, price } = item;
    setSelectedCard(id);
    setSubscription(item);
    setPaymentFor("subscription");
  };

  const handleRenewPackage = () => {
    const defaultData = {
      id: originalData?.subscription_id,
      name: originalData?.name,
      price: originalData?.price,
    };

    setSubscription(defaultData);
    setPaymentFor("renew");
  };
  const { mutate: BuyPackage, isPending: isBuying } = useBuyPackageMutation();

  const handleBuyPackage = async (e: any, item: any) => {
    const id = selectedStore?.id || "";
    const defaultData = {
      store_id: id,
      subscription_id: item?.id,
      payment_gateway: "",
    };

    return BuyPackage(
      { ...(defaultData as any) },
      {
        onSuccess: (data) => {
          detailsRefetch();
          toast.success((data as any)?.data?.message);
        },
        onError: (data) => {
          detailsRefetch();
          toast.error((data as any)?.data?.message);
        },
      }
    );
  };

  useEffect(() => {
    if (isRefetch) {
      permissionRefetch();
      dispatch(setRefetch(false));
    }
  }, [isRefetch, dispatch, permissionRefetch]);

  const handleSwitchButton = (
    <div className="hover:cursor-pointer">
      <Button variant="outline" className="app-button">
        {t("button.switch_subscription_to_commission")}
      </Button>
    </div>
  );

  const [slidesToScroll, setSlidesToScroll] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 640) {
        setSlidesToScroll(1);
      } else if (width >= 640 && width < 1440) {
        setSlidesToScroll(2);
      } else {
        setSlidesToScroll(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isPending && !error) {
      refetch();
    }
  }, [
    searchValue,
    sortField,
    itemsPerPage,
    currentPage,
    isPending,
    refetch,
    error,
  ]);

  return (
    <>
      <div>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mt-2">
            <TabsList className="flex items-center justify-start gap-2 bg-white dark:bg-gray-900 my-4">
              {SubscriptionTypeData?.subscription_type == "subscription" ? (
                <>
                  <TabsTrigger
                    className={`${
                      isFetching ? "pointer-events-none opacity-50" : ""
                    }`}
                    value="subscription_details"
                  >
                    <div className="text-start">
                      <h1 className="flex items-center gap-1">
                        <span className="text-start text-sm md:text-lg font-semibold">
                          Plan Details
                        </span>
                      </h1>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    className={`${
                      isFetching
                        ? "pointer-events-none opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    value="subscription_history"
                  >
                    <div className="text-start">
                      <h1 className="flex items-center gap-1">
                        <span className="text-start text-sm md:text-lg font-semibold">
                          {t("button.subscription_history")}
                        </span>
                      </h1>
                    </div>
                  </TabsTrigger>{" "}
                </>
              ) : (
                <TabsTrigger
                  className={`${
                    isFetching ? "pointer-events-none opacity-50" : ""
                  }`}
                  value="subscription_details"
                >
                  <div className="text-start">
                    <h1 className="flex items-center gap-1">
                      <span className="text-start text-sm md:text-lg font-semibold">
                        Plan Details
                      </span>
                    </h1>
                  </div>
                </TabsTrigger>
              )}
            </TabsList>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-end gap-2">
              {SubscriptionTypeData?.subscription_type === "subscription" ? (
                <>
                  {CommissionSettingsData?.commission_enabled && (
                    <CommissionConfirmModal
                      trigger={handleSwitchButton}
                      onSave={handleConfirm}
                      isConfirm={isConfirm}
                    />
                  )}
                  {CommissionSettingsData?.subscription_enabled &&
                    Number(originalData?.price) > 0 && (
                      <PaymentMethodModal
                        trigger={
                          <Button
                            onClick={handleRenewPackage}
                            variant="outline"
                            className=" bg-yellow-500 text-white border-0 hover:bg-yellow-600 hover:text-white"
                          >
                            {t("button.renew_subscription")}
                          </Button>
                        }
                        subscription={subscription}
                        paymentFor={paymentFor}
                        detailsRefetch={detailsRefetch}
                      />
                    )}
                </>
              ) : (
                <>
                  {CommissionSettingsData?.subscription_enabled && (
                    <Button
                      onClick={() => setShowPackages(!showPackages)}
                      variant="outline"
                      className="app-button"
                    >
                      {t("button.switch_commission_to_subscription")}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          <TabsContent className="rounded-xl" value="subscription_details">
            <div className="">
              {isDetailsPending ? (
                <div>
                  <Loader customClass="mt-32" size="large" />
                </div>
              ) : (
                <>
                  {SubscriptionTypeData?.subscription_type == "subscription" ? (
                    <>
                      <Card className="p-2 md:p-6">
                        <p className="flex items-center gap-2 text-lg font-semibold pb-4 mt-4 mb-8 border-b border-slate-300 ">
                          <span>Package Overview</span>
                        </p>

                        <div className="w-auto space-y-2 text-black dark:text-white">
                          <div className="flex items-center">
                            <div className="min-w-[120px]">Package Title </div>
                            <div className="flex items-center justify-start">
                              <h1 className="text-xl font-semibold text-gray-500 dark:text-white">
                                : {originalData?.name}
                              </h1>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="min-w-[120px]">Price </div>
                            <div className=" flex items-center justify-start">
                              <h1 className="text-xl font-semibold text-gray-500 dark:text-white ">
                                :{" "}
                                {originalData?.price
                                  ? formatPrice(
                                      originalData?.price,
                                      CurrencyData
                                    )
                                  : originalData?.price}
                              </h1>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="min-w-[120px]"> POS System </div>
                            <div className=" flex items-center justify-start ">
                              <div className="text-xl font-semibold flex items-center  gap-2 ">
                                <span className="text-gray-500 dark:text-white">
                                  :{" "}
                                </span>
                                <div className="mt-1">
                                  {originalData.pos_system == 1 ? (
                                    <VectorIcon />
                                  ) : (
                                    <MuteVectorIcon />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="min-w-[120px]"> Live Chat </div>
                            <div className=" flex items-center justify-start ">
                              <div className="text-xl font-semibold flex items-center  gap-2 ">
                                <span className="text-gray-500 dark:text-white">
                                  :{" "}
                                </span>
                                <div className="mt-1">
                                  {originalData.live_chat == 1 ? (
                                    <VectorIcon />
                                  ) : (
                                    <MuteVectorIcon />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="min-w-[120px]">Order Limit </div>
                            <div className="flex items-center justify-start">
                              <h1 className="text-xl font-semibold text-gray-500 dark:text-white ">
                                : {originalData?.order_limit}
                              </h1>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="min-w-[120px]">Product Limit </div>
                            <div className="flex items-center justify-start">
                              <h1 className="text-xl font-semibold text-gray-500 dark:text-white ">
                                : {originalData?.product_limit}
                              </h1>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="min-w-[120px]">Featured Limit </div>
                            <div className="flex items-center justify-start">
                              <h1 className="text-xl font-semibold text-gray-500 dark:text-white ">
                                : {originalData?.product_featured_limit}
                              </h1>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="min-w-[120px]">Validity </div>
                            <div className="flex items-center justify-start">
                              <h1 className="text-xl font-semibold text-yellow-500">
                                : {originalData?.validity} days
                              </h1>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="min-w-[120px]">Expire Date </div>
                            <div className=" flex items-center justify-start">
                              <h1 className="text-xl font-semibold text-red-500 ">
                                :{" "}
                                {originalData?.expire_date
                                  ? new Date(
                                      originalData.expire_date
                                    ).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "2-digit",
                                    })
                                  : ""}
                              </h1>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="min-w-[120px]">Status </div>
                            <div className="flex items-center justify-start">
                              <h1 className="text-xl font-semibold text-gray-500 dark:text-white ">
                                :{" "}
                                <span
                                  className={`text-sm font-semibold capitalize px-4 py-1 rounded ${
                                    originalData?.payment_status == "paid"
                                      ? "bg-green-100  text-green-500"
                                      : originalData?.payment_status ==
                                        "pending"
                                      ? "bg-yellow-100 text-yellow-500"
                                      : "bg-red-100  text-red-500"
                                  } `}
                                >
                                  {originalData?.payment_status}
                                </span>
                              </h1>
                            </div>
                          </div>
                        </div>
                      </Card>
                      {Number(originalData?.price) == 0 &&
                        originalData?.expire_date &&
                        new Date(originalData.expire_date).getTime() -
                          Date.now() <=
                          7 * 24 * 60 * 60 * 1000 && (
                          <Card className="p-2 md:p-6 mt-4">
                            <Carousel
                              opts={{
                                align: "start",
                                slidesToScroll: slidesToScroll,
                                containScroll: "trimSnaps",
                              }}
                              className="w-full lg:w-2/3 mx-auto p-4"
                            >
                              <CarouselContent className="ml-0 mr-4 gap-4 p-4">
                                {SubscriptionList.map((card: any) => (
                                  <CarouselItem
                                    key={card.id}
                                    className={`basis md:basis-1/2 xl:basis-1/3 shadow-custom hover:bg-blue-50 dark:hover:bg-[#162b4c] cursor-pointer rounded-xl ${
                                      selectedCard === card.id
                                        ? "bg-blue-50 dark:bg-[#162b4c] border-2 border-blue-500"
                                        : "bg-white dark:bg-[#162b4c]"
                                    }`}
                                    onClick={() => handleCardSelect(card)}
                                  >
                                    <CardHeader className="p-0 md:p-6">
                                      <div className="pt-6 md:pt-0 text-2xl font-bold flex flex-col items-center justify-center ">
                                        {card.image ? (
                                          <Card className="relative w-12 md:w-16 h-12 md:h-16 cursor-pointer mb-2 bg-white p-2 rounded-full">
                                            <Image
                                              loader={GlobalImageLoader}
                                              src={card.image_url}
                                              alt="image"
                                              fill
                                              sizes="48px"
                                              className="w-full h-full rounded-full"
                                            />
                                          </Card>
                                        ) : (
                                          <Card className="h-12 md:h-16 rounded-full text-white">
                                            <div className="p-2 md:p-6 bg-blue-400 rounded-full text-white mb-2">
                                              <RocketIcon
                                                width={20}
                                                height={20}
                                              />
                                            </div>
                                          </Card>
                                        )}

                                        <div className="w-full flex items-start text-blue-500 my-4">
                                          <span>
                                            {card.price
                                              ? formatPrice(
                                                  card.price,
                                                  CurrencyData
                                                )
                                              : card.price}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="">
                                        {" "}
                                        <span className="rounded-xl bg-[#113659] text-white px-2 py-0.5">
                                          {card?.type}
                                        </span>{" "}
                                      </div>
                                    </CardHeader>
                                    <CardContent className="mt-2 md:-mt-8 p-0 md:p-6 space-y-2 min-h-[200px] mr-4">
                                      <div className="space-y-2 min-h-[70px]">
                                        <div className="text-lg md:text-xl font-semibold">
                                          {card?.name}
                                        </div>

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
                                    <CardFooter className="p-2 md:p-6 mr-4">
                                      {Number(card.price) == 0 ? (
                                        <Button
                                          disabled={isBuying}
                                          onClick={(e) =>
                                            handleBuyPackage(e, card)
                                          }
                                          className="w-full py-2 text-center rounded-lg bg-blue-600 text-white font-500 hover:bg-blue-700"
                                        >
                                          {isBuying ? (
                                            <Loader
                                              size="small"
                                              color="text-white"
                                            />
                                          ) : (
                                            <span>Get Started</span>
                                          )}
                                        </Button>
                                      ) : (
                                        <PaymentMethodModal
                                          trigger={
                                            <Button
                                              disabled={isBuying}
                                              onClick={(e) =>
                                                handleChoosePackage(e, card)
                                              }
                                              className="w-full py-2 text-center rounded-lg bg-blue-600 text-white font-500 hover:bg-blue-700"
                                            >
                                              Buy Now
                                            </Button>
                                          }
                                          subscription={subscription}
                                          paymentFor={paymentFor}
                                          detailsRefetch={detailsRefetch}
                                        />
                                      )}
                                    </CardFooter>
                                  </CarouselItem>
                                ))}
                              </CarouselContent>
                              <CarouselPrevious />
                              <CarouselNext />
                            </Carousel>
                          </Card>
                        )}
                    </>
                  ) : (
                    <>
                      <Card className="p-2 md:p-6">
                        <p className="text-lg font-semibold mb-4 pb-4 border-b border-slate-300">
                          Commission Overview
                        </p>

                        <div className="">
                          <div className="p-2">
                            <div className="flex  flex-col  items-start justify-between">
                              <div>
                                <div className="flex items-center justify-center">
                                  <h1 className="text-base md:text-2xl font-bold text-blue-500 mb-2">
                                    Commission Base Plan
                                  </h1>
                                </div>
                              </div>
                              <p className="text-lg font-bold text-gray-500 dark:text-white">
                                <span className="text-base md:text-2xl font-bold text-gray-500 dark:text-white">
                                  {SubscriptionTypeData?.admin_commission_type ==
                                  "percentage"
                                    ? `${SubscriptionTypeData?.admin_commission_amount}%`
                                    : formatPrice(
                                        SubscriptionTypeData?.admin_commission_amount,
                                        CurrencyData
                                      )}
                                </span>{" "}
                                Commission per order
                              </p>
                            </div>
                            <div className="mt-4">
                              <p className="text-sm text-gray-500 dark:text-white leading-none mt-1">
                                {`Store will pay ${
                                  SubscriptionTypeData?.admin_commission_type ==
                                  "percentage"
                                    ? `${SubscriptionTypeData?.admin_commission_amount}%`
                                    : formatPrice(
                                        SubscriptionTypeData?.admin_commission_amount,
                                        CurrencyData
                                      )
                                } Commission to Admin From
                                  each order. You will get access of all the
                                  features and options in store panel , app and
                                  interaction with user.`}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                      {showPackages && (
                        <Card className="p-2 md:p-6 mt-4">
                          <Carousel
                            opts={{
                              align: "start",
                              slidesToScroll: slidesToScroll,
                              containScroll: "trimSnaps",
                            }}
                            className="w-full lg:w-2/3 mx-auto p-4"
                          >
                            <CarouselContent className="ml-0 mr-4 gap-4 p-4">
                              {SubscriptionList.map((card: any) => (
                                <CarouselItem
                                  key={card.id}
                                  className={`basis md:basis-1/2 xl:basis-1/3 shadow-custom hover:bg-blue-50 dark:hover:bg-[#162b4c] cursor-pointer rounded-xl ${
                                    selectedCard === card.id
                                      ? "bg-blue-50 dark:bg-[#162b4c] border-2 border-blue-500"
                                      : "bg-white dark:bg-[#162b4c]"
                                  }`}
                                  onClick={() => handleCardSelect(card)}
                                >
                                  <CardHeader className="p-0 md:p-6 space-y-0">
                                    <div className="pt-6 md:pt-0 text-2xl font-bold flex flex-col items-center justify-center ">
                                      {card.image ? (
                                        <Card className="relative w-12 md:w-16 h-12 md:h-16 cursor-pointer mb-2 bg-white p-2 rounded-full">
                                          <Image
                                            loader={GlobalImageLoader}
                                            src={card.image_url}
                                            alt="image"
                                            fill
                                            sizes="48px"
                                            className="w-full h-full rounded-full"
                                          />
                                        </Card>
                                      ) : (
                                        <Card className="h-12 md:h-16 rounded-full text-white">
                                          <div className="p-2 md:p-6 bg-blue-400 rounded-full text-white mb-2">
                                            <RocketIcon
                                              width={20}
                                              height={20}
                                            />
                                          </div>
                                        </Card>
                                      )}

                                      <div className="w-full flex items-start text-blue-500 my-4">
                                        <span>
                                          {card.price
                                            ? formatPrice(
                                                card.price,
                                                CurrencyData
                                              )
                                            : card.price}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="">
                                      {" "}
                                      <span className="rounded-xl bg-[#113659] text-white px-2 py-0.5">
                                        {card?.type}
                                      </span>{" "}
                                    </div>
                                  </CardHeader>
                                  <CardContent className="mt-2 md:-mt-8 p-0 md:p-6 space-y-2 min-h-[200px] mr-4">
                                    <div className="space-y-2 min-h-[70px]">
                                      <div className="text-lg md:text-xl font-semibold">
                                        {card?.name}
                                      </div>

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
                                  <CardFooter className="p-2 md:p-6 mr-4">
                                    {Number(card.price) == 0 ? (
                                      <Button
                                        disabled={isBuying}
                                        onClick={(e) =>
                                          handleBuyPackage(e, card)
                                        }
                                        className="w-full py-2 text-center rounded-lg bg-blue-600 text-white font-500 hover:bg-blue-700"
                                      >
                                        {isBuying ? (
                                          <Loader
                                            size="small"
                                            color="text-white"
                                          />
                                        ) : (
                                          <span>Get Started</span>
                                        )}
                                      </Button>
                                    ) : (
                                      <PaymentMethodModal
                                        trigger={
                                          <Button
                                            disabled={isBuying}
                                            onClick={(e) =>
                                              handleChoosePackage(e, card)
                                            }
                                            className="w-full py-2 text-center rounded-lg bg-blue-600 text-white font-500 hover:bg-blue-700"
                                          >
                                            Buy Now
                                          </Button>
                                        }
                                        subscription={subscription}
                                        paymentFor={paymentFor}
                                        detailsRefetch={detailsRefetch}
                                      />
                                    )}
                                  </CardFooter>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                          </Carousel>
                        </Card>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </TabsContent>
          <TabsContent className="rounded-xl" value="subscription_history">
            <>
              <RCTable
                originData={HistoryData}
                useColumn={useColumn}
                sortedInfo={sortedInfo}
                handleSort={handleSort}
                maxWidth={1000}
              />

              <div className="mt-4 flex justify-between">
                <div>
                  <AppSelect
                    value={String(itemsPerPage)}
                    onSelect={handleSelectItemsPerPage}
                    groups={CountItems}
                    customClass="w-[80px] h-8 "
                    hideNone
                  />
                </div>
                <Pagination
                  pageSize={itemsPerPage}
                  outline
                  onChange={updatePage}
                  current={currentPage}
                  total={totalDataLength}
                  defaultCurrent={1}
                  jumpPrevIcon={<ChevronsLeftIcon className="h-4 w-4" />}
                  jumpNextIcon={<ChevronsRightIcon className="h-4 w-4" />}
                />
              </div>
            </>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default BusinessPlanDetails;
