"use client";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import Delete from "@/components/blocks/custom-icons/Delete";
import TableEdit from "@/components/blocks/custom-icons/TableEdit";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import { Badge, Switch } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import { Routes } from "@/config/routes";
import GlobalImageLoader from "@/lib/imageLoader";
import {
  useShippingCampaignDelete,
  useShippingCampaignQuery,
  useShippingCampaignStatusUpdate,
} from "@/modules/admin-section/promotional/shipping-campaign/shipping-campaign.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  serial: string;
  title: string;
  image_url?: string;
  min_order_value?: number;
  status?: boolean;
  actions?: any;
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

const ShippingCampaignTable = ({ searchValue }: any) => {
  const t = useTranslations();
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    return parseInt(localStorage.getItem("itemsPerPage") || "10");
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortedInfo, setSortedInfo] = useState<{ columnKey: string; order: string }>({
    columnKey: "",
    order: "",
  });
  const sortField = sortedInfo.order === "ascend" ? "asc" : "desc";
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { ShippingCampaigns, refetch, isPending } = useShippingCampaignQuery({
    ...searchValue,
    per_page: itemsPerPage,
    page: currentPage,
    sortField: sortedInfo.columnKey || "id",
    sort: sortField,
  });

  const { mutate: deleteItem } = useShippingCampaignDelete();
  const { mutate: updateStatus } = useShippingCampaignStatusUpdate();

  const ShippingCampaignsData = useMemo(() => ShippingCampaigns as any, [ShippingCampaigns]);
  const totalDataLength = ShippingCampaignsData?.meta?.total;
  const startIndex = ShippingCampaignsData?.meta?.from ?? 1;
  const LastPage = ShippingCampaignsData?.meta?.last_page;

  const originalData = useMemo(() => {
    const data = ShippingCampaignsData?.data ?? [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: (startIndex ?? 1) + index,
    }));
  }, [ShippingCampaignsData, startIndex]);

  useEffect(() => {
    if (Number(currentPage) > Number(LastPage) && LastPage) {
      setCurrentPage(LastPage);
    }
  }, [LastPage, currentPage]);

  useEffect(() => {
    if (isRefetch) {
      refetch();
      dispatch(setRefetch(false));
    }
  }, [isRefetch, refetch, dispatch]);

  const handleSelectItemsPerPage = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
    localStorage.setItem("itemsPerPage", value);
  };

  const handleSort = (columnKey: string) => {
    setSortedInfo((prev) => ({
      columnKey,
      order: prev.columnKey === columnKey && prev.order === "ascend" ? "descend" : "ascend",
    }));
  };

  const handleDelete = (id: string) => {
    deleteItem(id, {
      onSuccess: () => refetch(),
    });
  };

  const handleStatusChange = (id: string) => {
    updateStatus({ id }, { onSuccess: () => refetch() });
  };

  const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
      const check = () => setIsMobile(window.innerWidth < 768);
      check();
      window.addEventListener("resize", check);
      return () => window.removeEventListener("resize", check);
    }, []);
    return isMobile;
  };

  const useColumn = (fixLeft: boolean, fixRight: boolean): ColumnsType<RecordType> => {
    const isMobile = useIsMobile();
    const columns: ColumnsType<RecordType> = useMemo(
      () => [
        {
          title: t("table_header.sl"),
          dataIndex: "serial",
          fixed: fixLeft ? "left" : undefined,
          width: "5%",
        },
        {
          title: t("table_header.image"),
          dataIndex: "image_url",
          width: 80,
        },
        {
          title: t("table_header.title"),
          dataIndex: "title",
          width: 200,
        },
        {
          title: t("common.min_order_value") || "Min. Sipariş",
          dataIndex: "min_order_value",
          width: 130,
        },
        {
          title: t("table_header.status"),
          dataIndex: "status",
          width: 100,
        },
        {
          title: t("table_header.actions"),
          dataIndex: "actions",
          width: "8%",
          fixed: !isMobile && fixRight ? "right" : undefined,
        },
      ],
      [fixLeft, fixRight, isMobile]
    );

    const renderColumns = columns.map((col: any) => {
      if (col.dataIndex === "image_url") {
        return {
          ...col,
          render: (image_url: string) =>
            image_url ? (
              <Image
                src={image_url}
                alt="campaign"
                width={60}
                height={40}
                className="rounded object-cover"
                loader={GlobalImageLoader}
              />
            ) : (
              <div className="w-[60px] h-[40px] bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                -
              </div>
            ),
        };
      }
      if (col.dataIndex === "min_order_value") {
        return {
          ...col,
          render: (val: number) => (
            <span className="font-semibold text-blue-600">₺{val?.toFixed(2)}</span>
          ),
        };
      }
      if (col.dataIndex === "status") {
        return {
          ...col,
          render: (status: boolean, row: RecordType) => (
            <Switch
              checked={status}
              onCheckedChange={() => handleStatusChange(row.id)}
            />
          ),
        };
      }
      if (col.dataIndex === "actions") {
        return {
          ...col,
          render: (_: any, row: RecordType) => (
            <div className="flex items-center gap-2">
              <span
                className="cursor-pointer"
                onClick={() =>
                  router.push(`${Routes.editShippingCampaign}/${row.id}`)
                }
              >
                <TableEdit />
              </span>
              <ConfirmationModal
                trigger={<Delete />}
                onSave={() => handleDelete(row.id)}
                title={t("title.delete_confirmation") || "Delete Campaign"}
                subTitle={t("sub_title.delete_confirmation") || "This action cannot be undone."}
              />
            </div>
          ),
        };
      }
      return col;
    });
    return renderColumns;
  };

  useEffect(() => {
    refetch();
  }, [sortField, itemsPerPage, currentPage, refetch]);

  return (
    <>
      {isPending ? (
        <TableSkeletonLoader />
      ) : (
        <>
          <RCTable
            originData={originalData}
            useColumn={useColumn}
            sortedInfo={sortedInfo}
            handleSort={handleSort}
            maxWidth={900}
          />
          <div className="mt-3 flex flex-col md:flex-row justify-between">
            <div>
              <AppSelect
                value={String(itemsPerPage)}
                onSelect={handleSelectItemsPerPage}
                groups={CountItems}
                customClass="w-[80px] h-8 mb-4 md:mb-0"
              />
            </div>
            <Pagination
              pageSize={itemsPerPage}
              outline
              onChange={(p: any) => setCurrentPage(p)}
              current={currentPage}
              total={totalDataLength}
              defaultCurrent={1}
              jumpPrevIcon={<ChevronsLeftIcon className="h-4 w-4" />}
              jumpNextIcon={<ChevronsRightIcon className="h-4 w-4" />}
            />
          </div>
        </>
      )}
    </>
  );
};

export default ShippingCampaignTable;
