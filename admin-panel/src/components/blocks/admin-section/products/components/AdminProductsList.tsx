"use client";
import NoDataFoundIcon from "@/assets/icons/NoDataFoundIcon";
import { formatPrice } from "@/components/molecules/formatPrice";
import { CustomViewIcon } from "@/components/blocks/custom-icons";
import CustomFeatureIcon from "@/components/blocks/custom-icons/CustomFeatureIcon";
import Delete from "@/components/blocks/custom-icons/Delete";
import TableEdit from "@/components/blocks/custom-icons/TableEdit";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import { Badge, Card } from "@/components/ui";
import { Routes } from "@/config/routes";
import GlobalImageLoader from "@/lib/imageLoader";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { MinusSquareIcon, PlusSquareIcon, Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import StatusUpdateModal from "../modal/StatusUpdateModal";
interface Option {
  value: string;
  label: string;
}
const AdminProductsList = ({
  originalData,
  handleDelete,
  handleMakeFeature,
  refetch,
  loading,
}: any) => {
  const t = useTranslations();
  const data = originalData;
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const toggleRowExpansion = (key: string) => {
    setExpandedRow((prev) => (prev === key ? null : key));
  };

  const [combinations, setCombinations] = useState<Record<number, string[]>>(
    {}
  );
  const { currency, refetch: refetchCurrency } = useCurrencyQuery({});
  const currencyData = useMemo(() => {
    const data = (currency as any) || {};
    return data;
  }, [currency]);
  const CurrencyData = currencyData.currencies_info;
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [SpPrices, setSpPrices] = useState<Record<string, number>>({});
  const [stocks, setStocks] = useState<Record<string, number>>({});
  const [sku, setSku] = useState<Record<string, string>>({});
  const [imageUrl, setImageUrl] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!data) return;

    const newCombinations: Record<number, string[]> = {};
    const tempPrices: Record<any, any> = {};
    const tempSpPrices: Record<any, any> = {};
    const tempStocks: Record<any, any> = {};
    const tempSku: Record<any, any> = {};
    const tempImageUrl: Record<any, any> = {};

    data.forEach((x: { children: any }, i: number) => {
      const apiData = x?.children;
      if (!apiData || apiData.length === 0) return;

      const newSelectedAttributes: Option[] = [];
      const newSelectedValues: Record<string, Option[]> = {};

      apiData.forEach(
        (
          variant: {
            attributes: any;
            price: any;
            special_price: any;
            stock_quantity: any;
            sku: any;
            image_url: any;
          },
          index: number
        ) => {
          const parsedAttributes = variant.attributes;

          Object.keys(parsedAttributes).forEach((key) => {
            if (!newSelectedAttributes.some((attr) => attr.value === key)) {
              newSelectedAttributes.push({
                value: key,
                label: key,
              });
            }
          });

          Object.entries(parsedAttributes).forEach(([key, value]) => {
            if (!newSelectedValues[key]) {
              newSelectedValues[key] = [];
            }

            if (Array.isArray(value)) {
              value.forEach((val: string) => {
                if (
                  !newSelectedValues[key].some((item) => item.value === val)
                ) {
                  newSelectedValues[key].push({
                    value: val,
                    label: val,
                  });
                }
              });
            } else {
              if (
                !newSelectedValues[key].some((item) => item.value === value)
              ) {
                newSelectedValues[key].push({
                  //@ts-ignore
                  value,
                  //@ts-ignore
                  label: value,
                });
              }
            }
          });
          const uniqueKey = `${i}-${index}`;

          tempPrices[uniqueKey] = Number(variant.price);
          tempSpPrices[uniqueKey] = Number(variant.special_price);
          tempStocks[uniqueKey] = Number(variant.stock_quantity);
          tempSku[uniqueKey] = variant.sku;
          tempImageUrl[uniqueKey] = variant.image_url;
        }
      );

      const attributeValues = newSelectedAttributes.map(
        (attribute) =>
          newSelectedValues[attribute.value]?.map((option) => option.label) || [
            "",
          ]
      );

      const generateCombinations = (arrays: string[][]): string[][] => {
        if (arrays.length === 0) return [[]];
        const [first, ...rest] = arrays;
        const combinations = generateCombinations(rest);
        return first.flatMap((value) =>
          combinations.map((combination) => [value, ...combination])
        );
      };

      const itemCombinations = generateCombinations(attributeValues).map(
        (combination) => combination.join("-").replace(/^-|-$/, "")
      );
      newCombinations[i] = itemCombinations;
    });
    setPrices(tempPrices);
    setSpPrices(tempSpPrices);
    setStocks(tempStocks);
    setSku(tempSku);
    setImageUrl(tempImageUrl);
    setCombinations(newCombinations);
  }, [data]);

  const renderVariantsRow = (itemIndex: number, variants: any[]) => {
    if (!variants || variants.length === 0) return null;

    const itemCombinations = combinations[itemIndex] || [];

    return (
      itemCombinations.length > 0 && (
        <Card className="relative shadow p-1 rounded">
          <div className="text-blue-500 bg-blue-50 dark:bg-gray-900 py-2 px-4 grid grid-cols-7 gap-2">
            <p>{t("table_header.image")}</p>
            <p className="col-span-2">{t("table_header.variants")}</p>
            <p>{t("table_header.sku")}</p>
            <p>{t("table_header.price")}</p>
            <p>{t("table_header.special_price")}</p>
            <p>{t("table_header.stock")}</p>
          </div>
          <div className="relative p-1 rounded">
            {itemCombinations.map((combination, index) => {
              const uniqueKey = `${itemIndex}-${index}`;
              return (
                <div
                  key={index}
                  className="grid grid-cols-7 gap-2 items-center p-2 border-b"
                >
                  <div className="">
                    <div className="relative flex align-start gap-4">
                      <div className="relative w-12 h-12">
                        {imageUrl[uniqueKey] ? (
                          <Image
                            loader={GlobalImageLoader}
                            src={imageUrl[uniqueKey]}
                            alt="Brand Logo"
                            fill
                            sizes="48px"
                            className="w-full h-full"
                          />
                        ) : (
                          <Image
                            src="/images/no-image.png"
                            alt="No Image"
                            fill
                            sizes="48px"
                            className="w-full h-full"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p>{combination as any}</p>
                  </div>
                  <span className=" text-gray-500 dark:text-white">
                    {sku[uniqueKey] ?? ""}
                  </span>
                  <span className=" text-gray-500 dark:text-white">
                    {formatPrice(prices[uniqueKey], CurrencyData)}
                  </span>
                  <span className=" text-gray-500 dark:text-white">
                    {formatPrice(SpPrices[uniqueKey], CurrencyData) ?? ""}
                  </span>
                  <span className=" text-gray-500 dark:text-white">
                    {stocks[uniqueKey] ?? ""}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )
    );
  };

  const router = useRouter();
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [detailsRowId, setDetailsRowId] = useState<string | null>(null);

  const handleEdit = (e: React.MouseEvent, slug: string) => {
    const url = `${Routes.EditProduct}/${slug}`;
    if (e.ctrlKey || e.metaKey || e.button === 1) {
      window.open(url, "_blank");
    } else {
      setEditRowId(slug);
      router.push(url);
    }
  };

  const handleDetails = (e: React.MouseEvent, slug: string) => {
    const url = `${Routes.approvedProductDetails}/${slug}`;

    if (e.ctrlKey || e.metaKey || e.button === 1) {
      // Open in new tab
      window.open(url, "_blank");
    } else {
      // Same tab behavior
      setDetailsRowId(slug);
      router.push(url);
    }
  };

  return (
    <div className="shadow rounded mt-4 overflow-y-auto custom-scrollbar">
      <div className="overflow-x-auto sm:overflow-x-visible">
        <table className="min-w-full table-auto overflow-x-auto">
          <thead className=" ">
            <tr className="bg-gray-50 dark:bg-[#374151] text-[#54697D] dark:text-white text-[14px] font-sm text-start px-4 py-2">
              <th className="text-start p-4"></th>
              <th className="text-start p-4">{t("table_header.sl")}</th>
              <th className="text-start p-4">
                {t("table_header.product_info")}
              </th>
              <th className="text-start p-4">{t("table_header.store")}</th>
              <th className="text-start p-4">{t("table_header.status")}</th>
              <th className="text-start p-4">{t("table_header.actions")}</th>
            </tr>
          </thead>
          <tbody>
            <>
              {data?.length > 0 ? (
                data.map((row: any, index: number) => {
                  const rowClass =
                    index % 2 !== 0
                      ? "bg-white dark:bg-[#1f2937] dark:hover:bg-[#2d3748]"
                      : "bg-white dark:bg-[#1f2937] dark:hover:bg-[#2d3748]";
                  return (
                    <React.Fragment key={row.id}>
                      <tr
                        className={`shadow px-4 py-2 border-b dark:border-[#374151] hover:bg-gray-50 ${rowClass}`}
                      >
                        <td className="text-start p-4 ">
                          {row.children.length > 0 && (
                            <button
                              onClick={() => toggleRowExpansion(row.id)}
                              className="text-[#54697D] font-lg"
                            >
                              {expandedRow == row.id ? (
                                <span>
                                  {" "}
                                  <MinusSquareIcon />{" "}
                                </span>
                              ) : (
                                <span>
                                  {" "}
                                  <PlusSquareIcon />{" "}
                                </span>
                              )}
                            </button>
                          )}
                        </td>
                        <td className="text-start p-4 ">
                          <span>{row?.sl}</span>
                        </td>
                        <td className="text-start p-4">
                          <div className="flex flex-col md:flex-row items-center gap-1 ">
                            <div className="relative w-12 h-12">
                              {row?.image_url !== null ? (
                                <Image
                                  loader={GlobalImageLoader}
                                  src={row?.image_url}
                                  alt="product_image"
                                  fill
                                  sizes="48px"
                                  className="w-full h-full"
                                  loading="lazy"
                                  placeholder="blur"
                                  blurDataURL="/images/no-image.png"
                                />
                              ) : (
                                <Image
                                  src="/images/no-image.png"
                                  alt="No Image"
                                  fill
                                  sizes="48px"
                                  className="w-full h-full"
                                  loading="lazy"
                                />
                              )}
                            </div>
                            <Link
                              className="text-blue-500 hover:underline dark:text-[#93c5fd] dark:hover:text-white"
                              href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/product-details/${row.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <div>
                                <p className="text-blue-500 font-semibold text-md">
                                  {row.name}
                                </p>
                              </div>
                            </Link>
                          </div>
                        </td>
                        <td className="text-start p-4 ">
                          <div className="flex items-center gap-2">
                            <Link
                              className="text-blue-500 hover:underline dark:text-[#93c5fd] dark:hover:text-white"
                              href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/store/details/${row?.store?.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <p className="">{row?.store?.name}</p>
                            </Link>
                            <p className="text-black dark:text-white font-semibold text-sm capitalize">
                              ( {row?.store?.store_type} )
                            </p>
                          </div>
                        </td>
                        <td className="text-start p-4 ">
                          <div className="flex items-center gap-2">
                            <div className="w-24 capitalize">
                              <Badge
                                className={` ${
                                  row?.status === "approved"
                                    ? "bg-green-50 border border-green-500 text-green-500"
                                    : row?.status === "inactive"
                                    ? "bg-gray-50 border border-gray-500 text-gray-500"
                                    : row?.status === "draft"
                                    ? "bg-violet-50 border border-violet-500 text-violet-500"
                                    : row?.status === "pending"
                                    ? "bg-yellow-50 border border-yellow-500 text-yellow-500"
                                    : "bg-pink-50 border border-pink-500 text-pink-500"
                                } capitalize`}
                              >
                                {row?.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {row?.status !== "delivered" && (
                                <StatusUpdateModal
                                  trigger={
                                    <button>
                                      <div className="bg-blue-100 p-2 rounded-lg">
                                        <Settings2
                                          width={16}
                                          height={16}
                                          className="text-blue-500"
                                        />
                                      </div>
                                    </button>
                                  }
                                  refetch={refetch}
                                  row={row}
                                />
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-start p-4 ">
                          <div className="flex items-center gap-2 ">
                            <CustomViewIcon
                              isLoading={detailsRowId === row.slug}
                              onClick={(
                                e: React.MouseEvent<Element, MouseEvent>
                              ) => handleDetails(e, row.slug)}
                            />
                            <ConfirmationModal
                              trigger={
                                <CustomFeatureIcon
                                  isFeature={row?.is_featured}
                                />
                              }
                              onSave={() => handleMakeFeature(row.id)}
                              loading={loading}
                              title={
                                row.is_featured == 1
                                  ? t("title.remove_feature")
                                  : t("title.active_feature")
                              }
                              subTitle={
                                row.is_featured == 1
                                  ? t("sub_title.remove_feature")
                                  : t("sub_title.active_feature")
                              }
                            />
                            <TableEdit
                              isLoading={editRowId === row.slug}
                              onClick={(
                                e: React.MouseEvent<Element, MouseEvent>
                              ) => handleEdit(e, row.slug)}
                            />
                            <ConfirmationModal
                              trigger={<Delete />}
                              onSave={() => handleDelete(row.id)}
                              loading={loading}
                              title={t("title.delete_product")}
                              subTitle={t("sub_title.delete_product")}
                            />
                          </div>
                        </td>
                      </tr>

                      {expandedRow === row.id && row.children && (
                        <tr>
                          <td colSpan={6} className="p-2">
                            {renderVariantsRow(index, row.children)}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <React.Fragment>
                  <tr className="bg-white dark:bg-[#1e293b] shadow-custom  ">
                    <td className="text-start p-4 "></td>
                    <td className="text-start p-4"></td>
                    <td className="text-start p-4"></td>
                    <td className="py-4">
                      {" "}
                      <div className="flex flex-col items-center justify-center text-gray-500 dark:text-white py-10">
                        <NoDataFoundIcon />

                        <p className="mt-2 text-sm text-gray-500 dark:text-white font-bold">
                          {t("common.not_data_found")}
                        </p>
                      </div>
                    </td>
                    <td className="text-start p-4 "></td>
                    <td className="text-start p-4 "></td>
                  </tr>
                </React.Fragment>
              )}
            </>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProductsList;
