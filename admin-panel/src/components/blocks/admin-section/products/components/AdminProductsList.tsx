"use client";
import NoDataFoundIcon from "@/assets/icons/NoDataFoundIcon";
import { formatPrice } from "@/components/molecules/formatPrice";
import { CustomViewIcon } from "@/components/blocks/custom-icons";
import CustomFeatureIcon from "@/components/blocks/custom-icons/CustomFeatureIcon";
import Delete from "@/components/blocks/custom-icons/Delete";
import TableEdit from "@/components/blocks/custom-icons/TableEdit";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import { Badge, Button, Card, Checkbox, Input } from "@/components/ui";
import { Routes } from "@/config/routes";
import GlobalImageLoader from "@/lib/imageLoader";
import { useVariantPricesUpdate } from "@/modules/admin-section/products/product.action";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { MinusSquareIcon, PlusSquareIcon, Settings2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import StatusUpdateModal from "../modal/StatusUpdateModal";

type PriceField = { price: string; special: string };

const AdminProductsList = ({
  originalData,
  handleDelete,
  handleMakeFeature,
  refetch,
  loading,
  selectedProductIds,
  onToggleRow,
  onToggleAllOnPage,
  allSelectedOnPage,
}: {
  originalData: any[];
  handleDelete: (id: string) => void;
  handleMakeFeature: (id: string) => void;
  refetch: () => void;
  loading: boolean;
  selectedProductIds: string[];
  onToggleRow: (id: string, checked: boolean) => void;
  onToggleAllOnPage: (checked: boolean) => void;
  allSelectedOnPage: boolean;
}) => {
  const t = useTranslations();
  const locale = useLocale();
  const data = originalData;
  const websiteBase = (process.env.NEXT_PUBLIC_WEBSITE_URL || "").replace(
    /\/+$/,
    ""
  );
  const defaultLang = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || "tr";
  const activeLocale = locale || defaultLang;
  const buildWebsiteUrl = (path: string) => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return websiteBase ? `${websiteBase}${normalizedPath}` : normalizedPath;
  };
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const toggleRowExpansion = (key: string) => {
    setExpandedRow((prev) => (prev === key ? null : key));
  };

  const [combinations, setCombinations] = useState<Record<number, string[]>>(
    {}
  );
  const { currency } = useCurrencyQuery({});
  const currencyData = useMemo(() => {
    const c = (currency as any) || {};
    return c;
  }, [currency]);
  const CurrencyData = currencyData.currencies_info;
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [SpPrices, setSpPrices] = useState<Record<string, number>>({});
  const [stocks, setStocks] = useState<Record<string, number>>({});
  const [sku, setSku] = useState<Record<string, string>>({});
  const [imageUrl, setImageUrl] = useState<Record<string, string>>({});
  const [priceInputs, setPriceInputs] = useState<Record<string, PriceField>>(
    {}
  );
  const [savingVariantId, setSavingVariantId] = useState<string | null>(null);
  const { mutate: patchVariantPrices } = useVariantPricesUpdate();

  useEffect(() => {
    if (!data) return;

    const newCombinations: Record<number, string[]> = {};
    const tempPrices: Record<string, number> = {};
    const tempSpPrices: Record<string, number> = {};
    const tempStocks: Record<string, number> = {};
    const tempSku: Record<string, string> = {};
    const tempImageUrl: Record<string, string> = {};
    const nextInputs: Record<string, PriceField> = {};

    data.forEach((x: { children: any[] }, i: number) => {
      const apiData = x?.children;
      if (!apiData || apiData.length === 0) return;

      const itemCombinations: string[] = [];

      apiData.forEach(
        (
          variant: {
            id: string | number;
            attributes: any;
            price: any;
            special_price: any;
            stock_quantity: any;
            sku: any;
            image_url: any;
          },
          index: number
        ) => {
          const parsedAttributes = variant.attributes || {};
          const label = (Object.values(parsedAttributes) as any[])
            .flat()
            .filter(Boolean)
            .join("-")
            .replace(/^-|-$/g, "");
          itemCombinations.push(label || String(index + 1));

          const uniqueKey = `${i}-${index}`;
          const vid = String(variant.id);

          tempPrices[uniqueKey] = Number(variant.price);
          tempSpPrices[uniqueKey] = Number(variant.special_price);
          tempStocks[uniqueKey] = Number(variant.stock_quantity);
          tempSku[uniqueKey] = variant.sku;
          tempImageUrl[uniqueKey] = variant.image_url;

          nextInputs[vid] = {
            price:
              variant.price !== null && variant.price !== undefined
                ? String(variant.price)
                : "",
            special:
              variant.special_price !== null &&
              variant.special_price !== undefined &&
              variant.special_price !== ""
                ? String(variant.special_price)
                : "",
          };
        }
      );
      newCombinations[i] = itemCombinations;
    });
    setPrices(tempPrices);
    setSpPrices(tempSpPrices);
    setStocks(tempStocks);
    setSku(tempSku);
    setImageUrl(tempImageUrl);
    setCombinations(newCombinations);
    setPriceInputs(nextInputs);
  }, [data]);

  const parseMoney = (s: string): number | null => {
    const n = parseFloat(String(s).replace(",", ".").trim());
    return Number.isFinite(n) ? n : null;
  };

  const saveVariantPrices = useCallback(
    (variantId: string) => {
      const fields = priceInputs[variantId];
      if (!fields) return;
      const price = parseMoney(fields.price);
      if (price === null || price < 0) {
        return;
      }
      let special: number | null = null;
      if (fields.special.trim() !== "") {
        const sp = parseMoney(fields.special);
        if (sp === null || sp < 0) return;
        special = sp;
      }
      setSavingVariantId(variantId);
      patchVariantPrices(
        { variant_id: variantId, price, special_price: special },
        {
          onSettled: () => setSavingVariantId(null),
          onSuccess: () => refetch(),
        }
      );
    },
    [patchVariantPrices, priceInputs, refetch]
  );

  const renderVariantsRow = (itemIndex: number, row: any) => {
    const variants = row?.children;
    if (!variants || variants.length === 0) return null;

    const itemCombinations = combinations[itemIndex] || [];

    return (
      itemCombinations.length > 0 && (
        <Card className="relative shadow p-1 rounded">
          <div className="text-blue-500 bg-blue-50 dark:bg-gray-900 py-2 px-4 grid grid-cols-8 gap-2 items-center">
            <p>{t("table_header.image")}</p>
            <p className="col-span-2">{t("table_header.variants")}</p>
            <p>{t("table_header.sku")}</p>
            <p>{t("table_header.price")}</p>
            <p>{t("table_header.special_price")}</p>
            <p>{t("table_header.stock")}</p>
            <p className="text-end">{t("button.save_changes")}</p>
          </div>
          <div className="relative p-1 rounded">
            {variants.map(
              (
                variant: {
                  id: string | number;
                  attributes?: any;
                },
                index: number
              ) => {
                const uniqueKey = `${itemIndex}-${index}`;
                const vid = String(variant.id);
                const combination = itemCombinations[index] ?? String(index + 1);
                const fields = priceInputs[vid] ?? { price: "", special: "" };
                return (
                  <div
                    key={vid}
                    className="grid grid-cols-8 gap-2 items-center p-2 border-b"
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
                      <p>{combination}</p>
                    </div>
                    <span className=" text-gray-500 dark:text-white">
                      {sku[uniqueKey] ?? ""}
                    </span>
                    <Input
                      type="text"
                      inputMode="decimal"
                      className="h-9 w-full min-w-[4.5rem]"
                      value={fields.price}
                      onChange={(e) =>
                        setPriceInputs((prev) => ({
                          ...prev,
                          [vid]: {
                            ...prev[vid],
                            price: e.target.value,
                            special: prev[vid]?.special ?? "",
                          },
                        }))
                      }
                    />
                    <Input
                      type="text"
                      inputMode="decimal"
                      className="h-9 w-full min-w-[4.5rem]"
                      value={fields.special}
                      placeholder="—"
                      onChange={(e) =>
                        setPriceInputs((prev) => ({
                          ...prev,
                          [vid]: {
                            price: prev[vid]?.price ?? "",
                            special: e.target.value,
                          },
                        }))
                      }
                    />
                    <span className=" text-gray-500 dark:text-white">
                      {stocks[uniqueKey] ?? ""}
                    </span>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="app-button"
                        disabled={savingVariantId === vid}
                        onClick={() => saveVariantPrices(vid)}
                      >
                        {t("button.save_changes")}
                      </Button>
                    </div>
                  </div>
                );
              }
            )}
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
      window.open(url, "_blank");
    } else {
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
              <th className="text-start p-4 w-10">
                <Checkbox
                  checked={allSelectedOnPage && data?.length > 0}
                  onCheckedChange={(v) => onToggleAllOnPage(v === true)}
                  aria-label={t("table_header.select_all_page")}
                />
              </th>
              <th className="text-start p-4"></th>
              <th className="text-start p-4">{t("table_header.sl")}</th>
              <th className="text-start p-4">
                {t("table_header.product_info")}
              </th>
              <th className="text-start p-4">{t("table_header.store")}</th>
              <th className="text-start p-4">{t("table_header.price")}</th>
              <th className="text-start p-4">{t("table_header.special_price")}</th>
              <th className="text-start p-4 w-[1%] whitespace-nowrap">
                {t("button.save_changes")}
              </th>
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
                  const singleVariant =
                    row.children?.length === 1 ? row.children[0] : null;
                  return (
                    <React.Fragment key={row.id}>
                      <tr
                        className={`shadow px-4 py-2 border-b dark:border-[#374151] hover:bg-gray-50 ${rowClass}`}
                      >
                        <td className="text-start p-4 align-middle">
                          <Checkbox
                            checked={selectedProductIds.includes(String(row.id))}
                            onCheckedChange={(v) =>
                              onToggleRow(String(row.id), v === true)
                            }
                            aria-label={t("table_header.select_row")}
                          />
                        </td>
                        <td className="text-start p-4 ">
                          {row.children?.length > 0 && (
                            <button
                              type="button"
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
                              href={buildWebsiteUrl(
                                `/${activeLocale}/urun/${row.slug}`
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <div>
                                <p className="text-blue-500 font-semibold text-md">
                                  {row.name}
                                </p>
                                {row?.is_sellable === false && (
                                  <p className="text-xs font-medium text-red-500">
                                    Fiyat eksik, satışa kapalı
                                  </p>
                                )}
                              </div>
                            </Link>
                          </div>
                        </td>
                        <td className="text-start p-4 ">
                          <div className="flex items-center gap-2">
                            <Link
                              className="text-blue-500 hover:underline dark:text-[#93c5fd] dark:hover:text-white"
                              href={
                                row?.store?.slug
                                  ? buildWebsiteUrl(
                                      `/${activeLocale}/magaza/${row.store.slug}`
                                    )
                                  : "#"
                              }
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
                        {singleVariant ? (
                          <>
                            <td className="text-start p-4 align-top">
                              <Input
                                type="text"
                                inputMode="decimal"
                                className="h-9 w-full max-w-[7rem]"
                                value={
                                  priceInputs[String(singleVariant.id)]?.price ??
                                  ""
                                }
                                onChange={(e) =>
                                  setPriceInputs((prev) => ({
                                    ...prev,
                                    [String(singleVariant.id)]: {
                                      ...prev[String(singleVariant.id)],
                                      price: e.target.value,
                                      special:
                                        prev[String(singleVariant.id)]
                                          ?.special ?? "",
                                    },
                                  }))
                                }
                              />
                            </td>
                            <td className="text-start p-4 align-top">
                              <Input
                                type="text"
                                inputMode="decimal"
                                className="h-9 w-full max-w-[7rem]"
                                placeholder="—"
                                value={
                                  priceInputs[String(singleVariant.id)]
                                    ?.special ?? ""
                                }
                                onChange={(e) =>
                                  setPriceInputs((prev) => ({
                                    ...prev,
                                    [String(singleVariant.id)]: {
                                      price:
                                        prev[String(singleVariant.id)]?.price ??
                                        "",
                                      special: e.target.value,
                                    },
                                  }))
                                }
                              />
                            </td>
                            <td className="text-start p-4 align-top">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="app-button"
                                disabled={
                                  savingVariantId === String(singleVariant.id)
                                }
                                onClick={() =>
                                  saveVariantPrices(String(singleVariant.id))
                                }
                              >
                                {t("button.save_changes")}
                              </Button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="text-start p-4 text-gray-500 dark:text-gray-400 text-sm">
                              {row.children?.length > 1
                                ? t("product_list.multiple_variants_hint")
                                : "—"}
                            </td>
                            <td className="text-start p-4 text-gray-500 dark:text-gray-400 text-sm">
                              {row.children?.length > 1
                                ? t("product_list.multiple_variants_hint")
                                : "—"}
                            </td>
                            <td className="text-start p-4">—</td>
                          </>
                        )}
                        <td className="text-start p-4 ">
                          <div className="flex items-center gap-2 flex-wrap">
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
                            {row?.is_sellable === false && (
                              <Badge className="bg-red-50 border border-red-500 text-red-500">
                                price invalid
                              </Badge>
                            )}
                            <div className="flex items-center gap-2">
                              {row?.status !== "delivered" && (
                                <StatusUpdateModal
                                  trigger={
                                    <button type="button">
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
                          <td colSpan={10} className="p-2">
                            {renderVariantsRow(index, row)}
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
                    <td className="text-start p-4 "></td>
                    <td className="text-start p-4 "></td>
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
