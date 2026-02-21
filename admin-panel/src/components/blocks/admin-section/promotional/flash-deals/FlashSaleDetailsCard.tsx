"use client";
import RCTable from "@/components/molecules/RCTable";
import { Card, CardContent } from "@/components/ui";
import GlobalImageLoader from "@/lib/imageLoader";
import { useAppDispatch } from "@/redux/hooks";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
interface RecordType {
  id: string;
  serial: string;
  label: string;
  image?: string;
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

const FlashSaleDetailsCard = ({ data }: any) => {
  const t = useTranslations();
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const editData = data;

  // Pick locale-aware title/description from related_translations
  // Backend returns an object keyed by language (groupBy result), so convert to array
  const translations: any[] = editData?.related_translations
    ? Object.values(editData.related_translations)
    : [];
  const localeTrans = translations.find(
    (tr: any) => tr.language_code === locale
  );
  const displayTitle = localeTrans?.title || editData?.title || "";
  const displayDescription = localeTrans?.description || editData?.description || "";
  const displayButtonText = localeTrans?.button_text || editData?.button_text || "";

  const [sortedInfo, setSortedInfo] = useState<{
    columnKey: string;
    order: string;
  }>({
    columnKey: "",
    order: "",
  });

  const [start_date, startTime] = (data?.start_time ?? " ").split(" ");
  const [end_date, end_time] = (data?.end_time ?? " ").split(" ");

  const formattedStartDate = start_date
    ? new Date(start_date).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";
  const formattedEndDate = end_date
    ? new Date(end_date).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

  const originalData = useMemo(() => {
    const data = (editData?.products as any) || [];
    return data?.map((item: any, index: number) => ({
      ...item,
      serial: index + 1,
    }));
  }, [editData?.products]);

  const handleSort = (columnKey: string) => {
    setSortedInfo((prev) => {
      const isSameColumn = prev.columnKey === columnKey;
      const newOrder =
        isSameColumn && prev.order === "ascend" ? "descend" : "ascend";
      return { columnKey, order: newOrder };
    });
  };

  const useColumn = (
    fixLeft: boolean,
    fixRight: boolean
  ): ColumnsType<RecordType> => {
    const columns: ColumnsType<RecordType> = useMemo(
      () => [
        {
          title: t("table_header.sl"),
          dataIndex: "serial",
          fixed: fixLeft ? "left" : undefined,
          width: 100,
        },

        {
          title: t("table_header.image"),
          dataIndex: "image",
          width: 100,
          render: (image: string) =>
            image && image !== "" ? (
              <div className="relative w-12 h-12">
                <Image
                  loader={GlobalImageLoader}
                  src={image}
                  alt="product image"
                  fill
                  sizes="48px"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="relative w-12 h-12">
                <Image
                  src="/images/no-image.png"
                  alt="No Image"
                  fill
                  sizes="48px"
                  className="w-full h-full"
                />
              </div>
            ),
        },
        {
          title: t("table_header.name"),
          dataIndex: "label",
          width: 100,
        },
      ],
      [fixLeft]
    );
    const renderColumns = columns.map((col) => {
      return col;
    });
    return renderColumns;
  };

  return (
    <div>
      <>
        <Card className="mt-4 shadow-xl">
          <div className="relative max-h-[200px] md:max-h-[500px] overflow-hidden">
            <Image
              loader={GlobalImageLoader}
              src={
                editData?.image_url
                  ? editData.image_url
                  : "/images/no-image.png"
              }
              alt="Image"
              width={0}
              height={0}
              className="h-auto w-auto"
              sizes="auto"
              priority
            />
          </div>

          <CardContent className="p-2 md:p-6">
            <p className="text-lg md:text-2xl font-medium text-blue-500 mb-4">
              {displayTitle}
            </p>

            <div className="flex items-center justify-start gap-4">
              <div className="space-y-2">
                <div className="text-md font-medium text-gray-500 dark:text-white mb-2">
                  <span>{displayDescription}</span>
                </div>
                {displayButtonText ? (
                  <div className="flex items-center justify-start gap-2 text-black dark:text-white text-md font-semibold">
                    <span>{t("label.button_title")}:</span>
                    <span className="text-gray-500 dark:text-white">{displayButtonText}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-start gap-2 text-black dark:text-white text-md font-semibold">
                  <span>{t("label.active_date")}:</span>
                  <span className="text-gray-500 dark:text-white">
                    {formattedStartDate}
                  </span>
                </div>
                <div className="flex items-center justify-start gap-2 text-black dark:text-white text-md font-semibold">
                  <span>{t("label.expire_date")}:</span>
                  <span className="text-gray-500 dark:text-white">
                    {formattedEndDate}
                  </span>
                </div>
                <div className="flex items-center justify-start gap-2 text-black dark:text-white text-sm font-semibold">
                  <span>{t("label.discount_type")}:</span>
                  <span className="text-gray-500 dark:text-white">
                    {editData?.discount_type}
                  </span>
                </div>
                <div className="flex items-center justify-start gap-2 text-black dark:text-white text-sm font-semibold">
                  <span>{t("label.amount")}:</span>
                  <span className="text-gray-500 dark:text-white capitalize">
                    {editData?.discount_type === "amount"
                      ? `$${editData?.discount_amount}`
                      : `${editData?.discount_amount}%`}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <RCTable
            originData={originalData}
            useColumn={useColumn}
            sortedInfo={sortedInfo}
            handleSort={handleSort}
            maxWidth={800}
          />
        </div>
      </>
    </div>
  );
};
export default FlashSaleDetailsCard;
