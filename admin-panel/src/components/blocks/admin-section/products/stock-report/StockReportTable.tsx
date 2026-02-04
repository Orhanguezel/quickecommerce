"use client";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import { AppSelect } from "@/components/blocks/common";
import {
  Card,
  CardContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import { useStockReportQuery } from "@/modules/admin-section/stock-report/stock-report.action";
import {
  ChevronsLeftIcon,
  ChevronsRightIcon,
  LayoutGrid,
  List,
} from "lucide-react";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import StockReport from "./component/StockReport";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

const StockReportTable = ({ searchValue }: any) => {
  const locale = useLocale();
  const [shouldRefetch, setShouldRefetch] = useState(false);
  const [activeTab, setActiveTab] = useState("low_stock");
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

  const sortField = sortedInfo.order == "ascend" ? "asc" : "desc";
  const { StockReportList, refetch, isPending, isFetching } =
    useStockReportQuery({
      limit: itemsPerPage,
      language: locale,
      page: currentPage,
      sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
      sort: sortField,
      search: searchValue,
      stock_type: activeTab,
    });

  let totalDataLength = (StockReportList as any)?.meta?.total;
  const startIndex = (StockReportList as any)?.meta?.from;
  const originalData = useMemo(() => {
    const data = (StockReportList as any)?.data || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [StockReportList, startIndex]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setShouldRefetch(true);
  };

  const updatePage = (p: any) => {
    setCurrentPage(p);
    localStorage.setItem("currentPage", p);
    setShouldRefetch(true);
  };
  useEffect(() => {
    if (shouldRefetch) {
      refetch();
      setShouldRefetch(false);
    }
  }, [shouldRefetch, refetch]);

  const handleSelectItemsPerPage = (value: string) => {
    const newItemsPerPage = parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    localStorage.setItem("itemsPerPage", value);
  };

  return (
    <>
      {isPending ? (
        <TableSkeletonLoader />
      ) : (
        <div className="min-h-[calc(100vh-16.5rem)]">
          <Tabs
            defaultValue="low_stock"
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <Card className="mt-4">
              <CardContent className="p-2 lg:p-4">
                <TabsList className="flex items-center justify-start gap-2 bg-transparent">
                  <TabsTrigger
                    className={`${
                      isFetching ? "pointer-events-none opacity-50" : ""
                    }`}
                    value="low_stock"
                  >
                    <div className="text-start">
                      <h1 className="flex items-center gap-1">
                        <LayoutGrid className="w-5" />{" "}
                        <span className="text-start text-sm lg:text-lg font-semibold">
                          Low Stock
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
                    value="out_of_stock"
                  >
                    <div className="text-start">
                      <h1 className="flex items-center gap-1">
                        <List className="w-5" />{" "}
                        <span className="text-start text-sm lg:text-lg font-semibold">
                          Out of Stock
                        </span>
                      </h1>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </CardContent>
            </Card>
            <TabsContent className="rounded-xl" value="low_stock">
              <>
                <StockReport
                  originalData={originalData}
                  isPending={isFetching}
                />
              </>
            </TabsContent>
            <TabsContent className="rounded-xl" value="out_of_stock">
              <>
                <StockReport
                  originalData={originalData}
                  isPending={isFetching}
                />
              </>
            </TabsContent>
          </Tabs>
          <div className="mt-3 flex flex-col md:flex-row justify-between">
            <div>
              <AppSelect
                value={String(itemsPerPage)}
                onSelect={handleSelectItemsPerPage}
                groups={CountItems}
                customClass="w-[80px] h-8 mb-4 lg:mb-0"
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
        </div>
      )}
    </>
  );
};

export default StockReportTable;
