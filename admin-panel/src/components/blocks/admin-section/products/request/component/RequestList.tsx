"use client";

import { formatPrice } from "@/components/molecules/formatPrice";
import { Button, Card } from "@/components/ui";
import GlobalImageLoader from "@/lib/imageLoader";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { MinusSquareIcon, PlusSquareIcon, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";

interface Option {
  value: string;
  label: string;
}
const RequestList = ({
  originalData,
  selectedRows,
  setSelectedRows,
  selectedAction,
  setSelectedAction,
  handleApplyAction,
  handleRowDelete,
  confirmDelete,
  cancelDelete,
  isDeleteModalOpen,
}: any) => {
  const t = useTranslations();
  const modalRef = useRef(null);
  const data = originalData;
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const toggleRowExpansion = (key: string) => {
    setExpandedRow((prev) => (prev === key ? null : key));
  };

  const [combinations, setCombinations] = useState<Record<number, string[]>>(
    {}
  ); // Store combinations per item
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

  // const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const handleRowSelection = (rowId: string) => {
    setSelectedRows((prev: Iterable<unknown> | null | undefined) => {
      const updated = new Set(prev);
      if (updated.has(rowId)) {
        updated.delete(rowId);
      } else {
        updated.add(rowId);
      }
      return updated;
    });
  };

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedRows(new Set(data.map((row: any) => row.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const renderVariantsRow = (itemIndex: number, variants: any[]) => {
    if (!variants || variants?.length === 0) return null;

    const itemCombinations = combinations[itemIndex] || [];

    return (
      itemCombinations.length > 0 && (
        <Card>
          <div className="text-blue-500 bg-blue-50 py-2 px-4 grid grid-cols-4 gap-2">
            <p>{t("table_header.image")}</p>
            <p>{t("table_header.sku")}</p>
            <p>{t("table_header.price")}</p>
            <p>{t("table_header.stock")}</p>
          </div>
          <div className="relative p-1">
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
          </div>
        </Card>
      )
    );
  };

  return (
    <div className="shadow rounded-xl mt-4 max-h-[600px] overflow-y-auto custom-scrollbar">
      <div className="w-full bg-white flex items-center gap-4 p-3 sticky top-0 z-50">
        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="border px-4 py-2 rounded app-input"
        >
          <option value="">Select Action</option>
          <option value="delete">{t("button.delete")}</option>
        </select>
        <Button
          variant="outline"
          className="app-button"
          disabled={selectedRows.size === 0 || !selectedAction}
          onClick={handleApplyAction}
        >
          {t("button.apply")}
        </Button>
      </div>

      <table className="min-w-full table-auto overflow-x-auto">
        <thead className="sticky top-[65px] z-30">
          <tr className="bg-gray-50 dark:bg-[#374151] text-[#54697D] dark:text-white text-[14px] font-sm text-start px-4 py-2">
            <th className="text-start p-4">
              <input
                type="checkbox"
                onChange={(e) => handleSelectAll(e.target.checked)}
                checked={selectedRows.size === data.length && data.length > 0}
              />
            </th>
            <th className="text-start p-4"></th>
            <th className="text-start p-4">{t("table_header.name")}</th>
            <th className="text-start p-4">{t("table_header.store")} </th>
            <th className="text-start p-4">{t("table_header.type")}</th>
            <th className="text-start p-4">{t("table_header.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row: any, index: number) => {
            const rowClass =
              index % 2 !== 0
                ? "bg-white dark:bg-[#1f2937] dark:hover:bg-[#2d3748]"
                : "bg-white dark:bg-[#1f2937] dark:hover:bg-[#2d3748]";
            return (
              <React.Fragment key={row.id}>
                <tr
                  className={`shadow px-4 py-2 border-b dark:border-[#374151] hover:bg-gray-50 ${rowClass}`}
                >
                  <td className="text-start p-4">
                    <input
                      type="checkbox"
                      onChange={() => handleRowSelection(row.id)}
                      checked={selectedRows.has(row.id)}
                    />
                  </td>
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
                  <td className="text-start p-4">{row.product_name}</td>
                  <td className="text-start p-4 ">{row.store_name}</td>
                  <td className="text-start p-4 ">{row.type}</td>
                  <td className="text-start p-4 ">
                    <div className="flex items-center gap-2 ">
                      <button onClick={() => handleRowDelete(row.id)}>
                        <div className="bg-red-100 p-2 rounded-lg ">
                          <Trash2
                            width={16}
                            height={16}
                            className="text-red-500"
                          />
                        </div>
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedRow === row.id && row?.variants && (
                  <tr>
                    <td colSpan={5} className="p-2">
                      {renderVariantsRow(index, row?.variants)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {isDeleteModalOpen && (
        <div
          ref={modalRef}
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50"
        >
          <div className="w-[350px] h-[200px] flex flex-col items-center justify-center bg-white p-2 md:p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-4">Are you sure you ?</h3>
            <p className=" mb-4">You want to delete inventory!!</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="app-delete-button"
                onClick={confirmDelete}
              >
                {t("button.delete")}
              </Button>
              <Button
                variant="outline"
                className="app-button"
                onClick={cancelDelete}
              >
                {t("button.cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestList;
