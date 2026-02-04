"use client";

import NoDataFoundIcon from "@/assets/icons/NoDataFoundIcon";
import { formatPrice } from "@/components/molecules/formatPrice";
import Loader from "@/components/molecules/Loader";
import { Card } from "@/components/ui";
import GlobalImageLoader from "@/lib/imageLoader";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { MinusSquareIcon, PlusSquareIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";

interface Option {
  value: string;
  label: string;
}
const StockReport = ({ originalData, handleDelete, isPending }: any) => {
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
  const [stocks, setStocks] = useState<Record<string, number>>({});
  const [sku, setSku] = useState<Record<string, string>>({});
  const [imageUrl, setImageUrl] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!data) return;

    const newCombinations: Record<number, string[]> = {};
    const tempPrices: Record<any, any> = {};
    const tempStocks: Record<any, any> = {};
    const tempSku: Record<any, any> = {};
    const tempImageUrl: Record<any, any> = {};

    data.forEach((x: { variants: any }, i: number) => {
      const apiData = x?.variants;
      if (!apiData || apiData.length === 0) return;

      const newSelectedAttributes: Option[] = [];
      const newSelectedValues: Record<string, Option[]> = {};

      apiData.forEach(
        (
          variant: {
            attributes: any;
            price: any;
            stock_quantity: any;
            sku: any;
            image_url: any;
          },
          index: number
        ) => {
          const parsedAttributes = variant.attributes;

          // Process attributes
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
        <Card className="">
          <div className="text-blue-500 bg-blue-50 dark:bg-gray-900 py-2 px-4 grid grid-cols-4 gap-2">
            <p>{t("table_header.image")}</p>
            <p>{t("table_header.sku")}</p>
            <p>{t("table_header.price")}</p>
            <p>{t("table_header.stock")}</p>
          </div>

          <Card className="relative p-1">
            {itemCombinations.map((combination, index) => {
              const uniqueKey = `${itemIndex}-${index}`;
              return (
                <div
                  key={index}
                  className="grid grid-cols-4 gap-2 items-center p-2"
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

                  <div className=" text-gray-500 dark:text-white">
                    {sku[uniqueKey] ?? ""}
                  </div>
                  <div className=" text-gray-500 dark:text-white">
                    {formatPrice(prices[uniqueKey], CurrencyData)}
                  </div>
                  <div className=" text-gray-500 dark:text-white">
                    {stocks[uniqueKey] ?? ""}
                  </div>
                </div>
              );
            })}
          </Card>
        </Card>
      )
    );
  };

  return (
    <div className="shadow rounded mt-4 max-h-[600px] overflow-y-auto custom-scrollbar overflow-x-auto sm:overflow-x-visible">
      <table className="min-w-full table-auto overflow-x-auto">
        <thead>
          <tr className="bg-gray-50 dark:bg-[#374151] text-[#54697D] dark:text-white text-[14px] font-sm px-4 py-2">
            <th className="text-start  p-4"></th>
            <th className="text-start p-4">{t("table_header.image")}</th>
            <th className="text-start p-4">{t("table_header.name")}</th>
            <th className="text-start p-4">{t("table_header.store")}</th>
            <th className="text-start p-4">{t("table_header.store_type")}</th>
          </tr>
        </thead>
        <tbody className="w-full">
          {isPending ? (
            <React.Fragment>
              <tr className=" bg-gray-100 dark:bg-[#374151] shadow px-4 py-2">
                <td className="text-start p-4 "></td>
                <td className="text-start p-4"></td>
                <td className="text-start p-4 h-[230px]">
                  {" "}
                  <Loader customClass="" size="medium" />{" "}
                </td>
                <td className="text-start p-4 "></td>
                <td className="text-start p-4 "></td>
              </tr>
            </React.Fragment>
          ) : (
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
                          {row.variants.length > 0 && (
                            <button
                              onClick={() => toggleRowExpansion(row.id)}
                              className="text-[#54697D] font-lg"
                            >
                              {expandedRow === row.id ? (
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
                        <td className="text-start p-2">
                          <div className="relative w-12 h-12">
                            {row?.image_url ? (
                              <Image
                                loader={GlobalImageLoader}
                                src={row?.image_url}
                                alt="product_image"
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
                        </td>
                        <td className="text-start p-4">{row.name}</td>
                        <td className="text-start p-4 ">{row.store}</td>
                        <td className="text-start p-4 ">{row.type}</td>
                      </tr>

                      {expandedRow === row.id && row.variants && (
                        <tr>
                          <td colSpan={5} className="p-2">
                            {renderVariantsRow(index, row.variants)}
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
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StockReport;
