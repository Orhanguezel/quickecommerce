"use client";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import { CountItems } from "@/config/helperJson";
import GlobalImageLoader from "@/lib/imageLoader";
import {
  useDeliverymanApproveMutation,
  useDeliverymanRequestQuery,
} from "@/modules/admin-section/deliveryman/deliveryman.action";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import CustomApproveIcon from "../../custom-icons/CustomApproveIcon";
import CustomReviewRejectIcon from "../../custom-icons/CustomReviewRejectIcon";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  [x: string]: any;
  id: string;
  serial: string;
  title: string;
  discount_amount?: number;
  purchase_limit?: number;
  discount_type?: string;
  special_price?: string;
  start_time?: string;
  end_time?: string;
  identification_number?: string;
  vehicle_type?: string;
  identification_type?: any;
  thumbnail_image?: any;
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

const DeliverymanRequestTable = () => {
  const t = useTranslations();
  const locale = useLocale();
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
  const { DeliverymanRequest, refetch, isPending, error } =
    useDeliverymanRequestQuery({
      per_page: itemsPerPage,
      language: locale,
      page: currentPage,
      sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
      sort: sortField,
    });

  let totalDataLength = (DeliverymanRequest as any)?.meta?.total;
  const startIndex = (DeliverymanRequest as any)?.meta?.from;
  const originalData = useMemo(() => {
    const data = (DeliverymanRequest as any)?.data || [];
    return data?.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [DeliverymanRequest, startIndex]);

  const updatePage = (p: any) => {
    setCurrentPage(p);
  };

  const handleSort = (columnKey: string) => {
    setSortedInfo((prev) => {
      const isSameColumn = prev.columnKey === columnKey;
      const newOrder =
        isSameColumn && prev.order === "ascend" ? "descend" : "ascend";
      return { columnKey, order: newOrder };
    });
  };

  const handleSelectItemsPerPage = (value: string) => {
    const newItemsPerPage = parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    localStorage.setItem("itemsPerPage", value);
  };
  const [loading, setLoading] = useState(false);

  const { mutate: ApproveSingleRowId } = useDeliverymanApproveMutation();
  const handleSingleApprove = (id: string) => {
    const Ids = [id];
    setLoading(true);
    ApproveSingleRowId(
      { deliveryman_ids: Ids, status: "approved" },
      {
        onSuccess: () => {
          refetch();
          setLoading(false);
        },
        onError: () => {
          setLoading(false);
        },
      }
    );
  };

  const { mutate: RejectSingleRowId } = useDeliverymanApproveMutation();
  const handleSingleReject = (id: string) => {
    const Ids = [id];
    setLoading(true);
    RejectSingleRowId(
      { deliveryman_ids: Ids, status: "rejected" },
      {
        onSuccess: () => {
          refetch();
          setLoading(false);
        },
        onError: () => {
          setLoading(false);
        },
      }
    );
  };

  const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkIsMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkIsMobile();
      window.addEventListener("resize", checkIsMobile);
      return () => window.removeEventListener("resize", checkIsMobile);
    }, []);

    return isMobile;
  };
  const useColumn = (
    fixLeft: boolean,
    fixRight: boolean
  ): ColumnsType<RecordType> => {
    const isMobile = useIsMobile();
    const columns: ColumnsType<RecordType> = React.useMemo(
      () => [
        {
          title: t("table_header.sl"),
          dataIndex: "serial",
          fixed: fixLeft ? "left" : undefined,
          width: "6%",
        },
        {
          title: t("table_header.logo"),
          dataIndex: "brand_logo_url",
          width: 100,
          render: (image_url: string) =>
            image_url ? (
              <div className="relative w-12 h-12">
                <Image
                  loader={GlobalImageLoader}
                  src={image_url}
                  alt="Brand Logo"
                  fill
                  sizes="48px"
                  className="w-full h-full"
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
          width: 100,
          dataIndex: "name",
          render: (_: any, row: any) => (
            <div className="flex items-center capitalize gap-2">
              <div>
                <p className="">{row?.full_name}</p>
              </div>
            </div>
          ),
        },
        {
          title: t("table_header.email"),
          width: 100,
          dataIndex: "email",
          render: (_: any, row: any) => (
            <div className="flex items-center gap-2">
              <div>
                <span>{row?.email}</span>
              </div>
            </div>
          ),
        },
        {
          title: t("table_header.phone"),
          width: 100,
          dataIndex: "phone",
          render: (_: any, row: any) => (
            <div className="flex items-center gap-2">
              <div>
                <span>{row?.phone}</span>
              </div>
            </div>
          ),
        },
        {
          title: t("table_header.area"),
          width: 100,
          dataIndex: "area",
          render: (_: any, row: any) => (
            <div className="flex items-center gap-2">
              <div>
                <span>{row?.area}</span>
              </div>
            </div>
          ),
        },
        {
          title: t("table_header.identification_type"),
          width: 150,
          dataIndex: "identification_type",
          render: (_: any, row: any) => (
            <div className="flex items-center gap-2 capitalize">
              <div>
                <span>{row?.identification_type}</span>
              </div>
            </div>
          ),
        },
        {
          title: t("table_header.vehicle_type"),
          width: 150,
          dataIndex: "vehicle_type",
          render: (_: any, row: any) => (
            <div className="flex items-center gap-2">
              <div>
                <span>{row?.vehicle_type}</span>
              </div>
            </div>
          ),
        },

        {
          title: t("table_header.actions"),
          dataIndex: "actions",
          width: "10%",
          fixed: !isMobile && fixRight ? "right" : undefined,
        },
      ],
      [fixLeft, fixRight, isMobile]
    );
    const renderColumns = columns.map((col) => {
      if (col.dataIndex === "actions") {
        return {
          ...col,
          render: (o: any, row: RecordType) => (
            <div className="flex items-center gap-2 ">
              <ConfirmationModal
                trigger={<CustomApproveIcon />}
                onSave={() => handleSingleApprove(row.id)}
                loading={loading}
                title={t("title.approve_deliveryman")}
                subTitle={t("sub_title.approve_deliveryman")}
              />
              <ConfirmationModal
                trigger={<CustomReviewRejectIcon />}
                onSave={() => handleSingleReject(row.id)}
                loading={loading}
                title={t("title.reject_deliveryman")}
                subTitle={t("sub_title.reject_deliveryman")}
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
    if (!isPending && !error) {
      refetch();
    }
  }, [sortField, itemsPerPage, currentPage, isPending, refetch, error]);
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
            maxWidth={1100}
          />
          <div className="mt-3 flex flex-col md:flex-row justify-between">
            <div>
              <AppSelect
                value={String(itemsPerPage)}
                onSelect={handleSelectItemsPerPage}
                groups={CountItems}
                customClass="w-[80px] h-8 app-input mb-4 md:mb-0"
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
      )}
    </>
  );
};

export default DeliverymanRequestTable;
