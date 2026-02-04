"use client";
import { Button, Card, CardContent, Skeleton } from "@/components/ui";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import ProductFilter from "./components/ProductFilter";
import ProductViewCard from "./components/ProductViewCard";
import PlaceOrder from "./components/PlaceOrder";
import Billing from "./components/Billing";
import Loader from "@/components/molecules/Loader";
import { useProductListQuery } from "@/modules/seller-section/pos/Pos.action";
import { useAppSelector } from "@/redux/hooks";
import NoDataFoundIcon from "@/assets/icons/NoDataFoundIcon";

const PosDashboard = () => {
  const t = useTranslations();
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [storeData, setStoreData] = useState<any[]>([]);
  const [customerDetails, setCustomerDetails] = useState({});
  const [searchValue, setSearchValue] = useState("");
  const [finalSelectedID, setfinalSelectedID] = useState<any[] | "">("");
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const store_id = selectedStore?.id;

  const { product, refetch, isPending, isFetching } = useProductListQuery({
    page: currentPage,
    store_id: store_id,
    search: searchValue,
    category_id: finalSelectedID,
  });
  const originalData = useMemo(() => {
    const data = (product as any)?.data || [];
    return data?.map((item: any) => {
      const flashSale = item.flash_sale || null;

      return {
        id: item.id,
        title: item.name || "Unknown Product",
        imageSrc: item.image_url || "",
        price: item.price || 0,
        special_price: item.special_price || 0,
        effective_price: item.effective_price || 0,
        rating: item.rating,
        reviews: item.review_count,
        ifWishlist: item.wishlist,
        slug: item.slug,
        Stock: item.stock || 0,
        max_cart_qty: item.max_cart_qty || 1,
        status: item.is_featured ? "Featured" : "",
        discount: item.discount_percentage,
        variantsList: item.singleVariant,
        store_id: item.store_id,
        unit: item.unit,
        store: item.store?.name,
        store_tax: item.store?.tax,
        area_id: item.store?.area_id,
        store_delivery_time: item.store?.delivery_time,
        attributes: item.attributes,
        additional_charge_name: item.store?.additional_charge_name,
        additional_charge_amount: item.store?.additional_charge_amount,
        additional_charge_type: item.store?.additional_charge_type,
        flash_sale: flashSale
          ? {
              flash_sale_id: flashSale.flash_sale_id,
              discount_type: flashSale.discount_type,
              discount_amount: flashSale.discount_amount,
              purchase_limit: flashSale.purchase_limit,
            }
          : null,
      };
    });
  }, [product, t]);

  useEffect(() => {
    const currentPage = (product as any)?.meta?.current_page;

    if (originalData.length) {
      setStoreData((prev) => {
        if (currentPage === 1) {
          return originalData;
        } else {
          const updatedList = [...prev, ...originalData];
          const uniqueList = Array.from(
            new Map(updatedList.map((item) => [item.id, item])).values()
          );
          return uniqueList;
        }
      });
    } else if (currentPage === 1) {
      setStoreData([]);
    }

    setNextUrl((product as any)?.meta?.links?.next || null);
  }, [originalData, product]);

  const handleLoadMore = () => {
    if (nextUrl) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-0 xl:gap-4 ">
        <div className="space-y-4 col-span-3 mb-4 xl:mb-0 ">
          <ProductFilter
            finalSelectedID={finalSelectedID}
            setfinalSelectedID={setfinalSelectedID}
            setSearchValue={setSearchValue}
          />
          <Card>
            <CardContent className="space-y-4 p-2 md:p-4">
              {/* ✅ Show skeleton only on first load */}
              {isPending && currentPage === 1 ? (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                  {Array(15)
                    .fill(0)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="grid-item w-auto h-[300px] border p-2 rounded-md dark:border-[#374151]"
                      >
                        <Skeleton className="w-full h-[150px] rounded-lg mb-6 bg-gray-300 dark:bg-white" />
                        <div className="flex flex-col gap-2">
                          <Skeleton className="h-5 w-1/2 bg-gray-300 dark:bg-white" />
                          <Skeleton className="h-5 w-4/4 bg-gray-300 dark:bg-white" />
                          <Skeleton className="h-5 w-3/4 bg-gray-300 dark:bg-white" />
                          <Skeleton className="h-5 w-1/4 bg-gray-300 dark:bg-white" />
                        </div>
                      </div>
                    ))}
                </div>
              ) : storeData.length > 0 ? (
                <>
                  <div
                    className={`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}
                  >
                    {storeData.map((card: any, index) => (
                      <div
                        key={index}
                        className="grid-item flex items-center justify-center"
                      >
                        <ProductViewCard
                          key={`${card.id}-${index}`}
                          {...card}
                        />
                      </div>
                    ))}
                  </div>

                  {nextUrl && (
                    <div className="flex justify-center my-4">
                      <Button
                        disabled={isFetching}
                        onClick={handleLoadMore}
                        className="app-button px-6 py-2 w-[150px] "
                      >
                        {isFetching ? (
                          <>
                            <Loader size="small" />{" "}
                            <span className="px-2">Loading more...</span>
                          </>
                        ) : (
                          "Load More"
                        )}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full flex items-center justify-center mt-6">
                  <div className="flex flex-col items-center justify-center text-gray-500 dark:text-white py-10">
                    <NoDataFoundIcon />
                    <p className="mt-2 text-sm text-gray-500 dark:text-white font-bold">
                      {t("common.not_data_found")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="relative col-span-2 space-y-4">
          <Billing setCustomerDetails={setCustomerDetails} />
          <PlaceOrder customerDetails={customerDetails} />
        </div>
      </div>
    </>
  );
};

export default PosDashboard;
