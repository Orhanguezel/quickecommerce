"use client";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import Delete from "@/components/blocks/custom-icons/Delete";
import TableEdit from "@/components/blocks/custom-icons/TableEdit";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import { Badge } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import { Routes } from "@/config/routes";
import GlobalImageLoader from "@/lib/imageLoader";
import {
  useDeliverymanDelete,
  useDeliverymanQuery,
} from "@/modules/admin-section/deliveryman/deliveryman.action";
import { useAppDispatch } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { CustomViewIcon } from "../../custom-icons";
import ChangePasswordIcon from "../../custom-icons/ChangePassword";
import CustomApproveIcon from "../../custom-icons/CustomApproveIcon";
import CustomReviewRejectIcon from "../../custom-icons/CustomReviewRejectIcon";
import CustomStatusUpdateIcon from "../../custom-icons/CustomStatusUpdateIcon";
import ApproveModal from "./modals/ApproveModal";
import ChangePassword from "./modals/ChangePassword";
import RejectModal from "./modals/RejectModal";
import StatusUpdateModal from "./modals/StatusUpdateModal";
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

const DeliverymanTable = ({
  searchValue,
  selectStatus,
  selectIdentification,
  selectVehicleType,
  selectAreaId,
}: any) => {
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
  const { Deliveryman, refetch, isPending, error } = useDeliverymanQuery({
    per_page: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
    sort: sortField,
    search: searchValue,
    status: selectStatus,
    identification_type: selectIdentification,
    vehicle_type_id: selectVehicleType,
    area_id: selectAreaId,
  });

  let totalDataLength = (Deliveryman as any)?.meta?.total;
  const startIndex = (Deliveryman as any)?.meta?.from;
  const originalData = useMemo(() => {
    const data = (Deliveryman as any)?.data || [];
    return data?.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [Deliveryman, startIndex]);

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
  const { mutate: DeliverymanDelete } = useDeliverymanDelete();
  const handleDelete = (id: string) => {
    setLoading(true);
    DeliverymanDelete(id, {
      onSuccess: () => {
        refetch();
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      },
    });
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
          dataIndex: "image_url",
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
          width: 200,
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
          width: 150,
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
          width: 150,
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
          width: 200,
          dataIndex: "area",
          render: (_: any, row: any) => (
            <div className="flex items-center gap-2">
              <div>
                <span>{row?.area?.name}</span>
              </div>
            </div>
          ),
        },
        {
          title: t("table_header.status"),
          dataIndex: "status",
          width: 200,
        },
        {
          title: t("table_header.identification_type"),
          width: 200,
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
                <span>{row?.vehicle_type?.name}</span>
              </div>
            </div>
          ),
        },
        {
          title: t("table_header.verification"),
          dataIndex: "is_verified",
          width: 150,
        },
        {
          title: t("table_header.actions"),
          dataIndex: "actions",
          width: "18%",
          fixed: !isMobile && fixRight ? "right" : undefined,
        },
      ],
      [fixLeft, fixRight, isMobile]
    );
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [editRowId, setEditRowId] = useState<string | null>(null);
    const [viewRowId, setViewRowId] = useState<string | null>(null);

    const handleEdit = (e: React.MouseEvent, id: string) => {
      const url = `${Routes.editDeliveryman}/${id}`;

      if (e.ctrlKey || e.metaKey || e.button === 1) {
        window.open(url, "_blank");
      } else {
        setEditRowId(id);
        setViewRowId("");
        router.push(url);
        dispatch(setRefetch(true));
      }
    };
    const handleDashboard = (e: React.MouseEvent, id: string) => {
      const url = `${Routes.DeliverymanDashboard}/${id}`;

      if (e.ctrlKey || e.metaKey || e.button === 1) {
        window.open(url, "_blank");
      } else {
        setViewRowId(id);
        setEditRowId("");
        router.push(url);
        dispatch(setRefetch(true));
      }
    };

    const renderColumns = columns.map((col) => {
      if (col.dataIndex === "status") {
        return {
          ...col,
          render: (status: any, row: RecordType) => (
            <div className="flex items-center gap-2">
              <div className="w-24">
                <Badge
                  className={` ${
                    status === "approved"
                      ? "bg-green-50 border border-green-500 text-green-500"
                      : status === "inactive"
                      ? "bg-gray-50 border border-gray-500 text-gray-500"
                      : status === "pending"
                      ? "bg-yellow-50 border border-yellow-500 text-yellow-500"
                      : "bg-red-50 border border-red-500 text-red-500"
                  } capitalize`}
                >
                  {status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <StatusUpdateModal
                  trigger={<CustomStatusUpdateIcon />}
                  refetch={refetch}
                  row={row}
                />
              </div>
            </div>
          ),
        };
      }
      if (col.dataIndex === "is_verified") {
        return {
          ...col,
          render: (is_verified: any, row: RecordType) => (
            <div className="flex items-center gap-2">
              <div className="w-24">
                <Badge
                  className={` ${
                    is_verified == "1"
                      ? "bg-green-50 border border-green-500 text-green-500"
                      : is_verified == "0"
                      ? "bg-gray-50 border border-gray-500 text-gray-500"
                      : "bg-red-50 border border-red-500 text-red-500"
                  } capitalize`}
                >
                  {is_verified == "1"
                    ? "Verified"
                    : is_verified == "0"
                    ? "Pending"
                    : "Rejected"}
                </Badge>
              </div>
            </div>
          ),
        };
      }
      if (col.dataIndex === "actions") {
        return {
          ...col,
          render: (o: any, row: RecordType) => (
            <div className="flex items-center gap-2 ">
              <div>
                <CustomViewIcon
                  isLoading={viewRowId == row?.user_id}
                  onClick={(e: React.MouseEvent<Element, MouseEvent>) =>
                    handleDashboard(e, row?.user_id)
                  }
                />
              </div>
              <ApproveModal
                trigger={
                  <CustomApproveIcon disabled={row?.is_verified != "0"} />
                }
                refetch={refetch}
                row={row}
              />
              <RejectModal
                trigger={
                  <CustomReviewRejectIcon disabled={row?.is_verified != "0"} />
                }
                refetch={refetch}
                row={row}
              />
              <div>
                <TableEdit
                  isLoading={editRowId == row.id}
                  onClick={(e: React.MouseEvent<Element, MouseEvent>) =>
                    handleEdit(e, row.id)
                  }
                />
              </div>
              <ConfirmationModal
                trigger={<Delete />}
                onSave={() => handleDelete(row.user_id)}
                loading={loading}
                title="Delete Deliveryman!"
                subTitle="Are you sure you want to delete Deliveryman?"
              />
              <ChangePassword
                trigger={<ChangePasswordIcon />}
                refetch={refetch}
                row={row}
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
  }, [
    searchValue,
    sortField,
    itemsPerPage,
    currentPage,
    isPending,
    refetch,
    selectStatus,
    selectIdentification,
    selectVehicleType,
    selectAreaId,
    ,
    error,
  ]);
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
            maxWidth={1900}
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

export default DeliverymanTable;
