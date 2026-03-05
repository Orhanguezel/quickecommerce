"use client";
import { AppSelect } from "@/components/blocks/common";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { Badge } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import { Routes } from "@/config/routes";
import {
  useSellerApplicationListQuery,
  useSellerApplicationApprove,
  useSellerApplicationReject,
} from "@/modules/admin-section/seller/seller-application.action";
import {
  CheckCircle,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Eye,
  XCircle,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import ApplicationRejectModal from "./modal/ApplicationRejectModal";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  serial: number;
  user: any;
  company_name: string;
  sector: string;
  address: any;
  status: number;
  created_at: string;
  actions?: any;
  key: React.Key;
}

interface ColumnType<RecordType> {
  title: string;
  dataIndex?: keyof RecordType;
  key?: string;
  width?: number | string;
  fixed?: "left" | "right" | undefined;
  ellipsis?: boolean;
}
type ColumnsType<RecordType> = ColumnType<RecordType>[];

const SellerApplicationTable = ({
  searchValue,
  status,
}: {
  searchValue: string;
  status: string;
}) => {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    return parseInt(localStorage.getItem("itemsPerPage") || "10");
  });
  const [currentPage, setCurrentPage] = useState(1);

  const { applicationList, refetch, isPending, error } =
    useSellerApplicationListQuery({
      per_page: itemsPerPage,
      language: locale,
      page: currentPage,
      search: searchValue,
      status,
    });

  const { mutate: approveApplication, isPending: isApproving } =
    useSellerApplicationApprove();
  const { mutate: rejectApplication, isPending: isRejecting } =
    useSellerApplicationReject();

  const totalDataLength = (applicationList as any)?.meta?.total;
  const startIndex = (applicationList as any)?.meta?.from ?? 0;
  const LastPage = (applicationList as any)?.meta?.last_page;

  const originalData = useMemo(() => {
    const data = (applicationList as any)?.applications || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [applicationList, startIndex]);

  useEffect(() => {
    if (Number(currentPage) > Number(LastPage) && LastPage) {
      setCurrentPage(LastPage);
    }
  }, [LastPage, currentPage]);

  const updatePage = (p: any) => {
    setCurrentPage(p);
  };

  const handleSelectItemsPerPage = (value: any) => {
    const newItemsPerPage = parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    localStorage.setItem("itemsPerPage", value);
  };

  const handleApprove = (id: string) => {
    approveApplication(
      { id },
      {
        onSuccess: () => refetch(),
      }
    );
  };

  const handleReject = (id: string, admin_note: string) => {
    rejectApplication(
      { id, admin_note },
      {
        onSuccess: () => refetch(),
      }
    );
  };

  const handleViewDetails = (e: React.MouseEvent, id: string) => {
    const url = `${Routes.SellerApplicationDetails}/${id}`;
    if (e.ctrlKey || e.metaKey || e.button === 1) {
      window.open(url, "_blank");
    } else {
      router.push(url);
    }
  };

  const useColumn = (
    fixLeft: boolean,
    fixRight: boolean
  ): ColumnsType<RecordType> => {
    const useIsMobile = () => {
      const [isMobile, setIsMobile] = useState(false);
      useEffect(() => {
        const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
        checkIsMobile();
        window.addEventListener("resize", checkIsMobile);
        return () => window.removeEventListener("resize", checkIsMobile);
      }, []);
      return isMobile;
    };
    const isMobile = useIsMobile();

    const columns: ColumnsType<RecordType> = React.useMemo(
      () => [
        {
          title: t("table_header.sl"),
          dataIndex: "serial",
          fixed: fixLeft ? "left" : undefined,
          width: "5%",
        },
        {
          title: t("table_header.name"),
          dataIndex: "user",
          width: "15%",
        },
        {
          title: t("table_header.email"),
          dataIndex: "user",
          key: "email",
          width: "15%",
        },
        {
          title: "Şirket Adı",
          dataIndex: "company_name",
          width: "15%",
        },
        {
          title: "Sektör",
          dataIndex: "sector",
          width: "10%",
        },
        {
          title: "Şehir",
          dataIndex: "address",
          width: "10%",
        },
        {
          title: "Tarih",
          dataIndex: "created_at",
          width: "10%",
        },
        {
          title: t("table_header.status"),
          dataIndex: "status",
          width: "10%",
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
      if (col.dataIndex === "user" && col.key !== "email") {
        return {
          ...col,
          render: (_: any, row: RecordType) => (
            <span>
              {row.user?.first_name} {row.user?.last_name}
            </span>
          ),
        };
      }
      if (col.key === "email") {
        return {
          ...col,
          render: (_: any, row: RecordType) => (
            <span className="text-blue-500">{row.user?.email}</span>
          ),
        };
      }
      if (col.dataIndex === "address") {
        return {
          ...col,
          render: (_: any, row: RecordType) => (
            <span>{row.address?.city}</span>
          ),
        };
      }
      if (col.dataIndex === "created_at") {
        return {
          ...col,
          render: (date: string) => (
            <span>
              {date ? new Date(date).toLocaleDateString("tr-TR") : "-"}
            </span>
          ),
        };
      }
      if (col.dataIndex === "status") {
        return {
          ...col,
          render: (status: number) => (
            <Badge
              className={`capitalize ${
                status === 0
                  ? "bg-yellow-50 border border-yellow-500 text-yellow-600"
                  : status === 1
                  ? "bg-green-50 border border-green-500 text-green-500"
                  : "bg-red-50 border border-red-500 text-red-500"
              }`}
            >
              {status === 0
                ? "Beklemede"
                : status === 1
                ? "Onaylandı"
                : "Reddedildi"}
            </Badge>
          ),
        };
      }
      if (col.dataIndex === "actions") {
        return {
          ...col,
          render: (_: any, row: RecordType) => (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleViewDetails(e, row.id)}
                className="bg-blue-100 p-2 rounded-lg hover:bg-blue-200"
                title="Detay"
              >
                <Eye width={16} height={16} className="text-blue-500" />
              </button>
              {row.status === 0 && (
                <>
                  <ConfirmationModal
                    trigger={
                      <button
                        className="bg-green-100 p-2 rounded-lg hover:bg-green-200"
                        title="Onayla"
                      >
                        <CheckCircle
                          width={16}
                          height={16}
                          className="text-green-500"
                        />
                      </button>
                    }
                    onSave={() => handleApprove(row.id)}
                    loading={isApproving}
                    title="Başvuruyu Onayla"
                    subTitle="Bu satıcı başvurusunu onaylamak istediğinize emin misiniz?"
                  />
                  <ApplicationRejectModal
                    trigger={
                      <button
                        className="bg-red-100 p-2 rounded-lg hover:bg-red-200"
                        title="Reddet"
                      >
                        <XCircle
                          width={16}
                          height={16}
                          className="text-red-500"
                        />
                      </button>
                    }
                    onReject={(note) => handleReject(row.id, note)}
                    loading={isRejecting}
                  />
                </>
              )}
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
  }, [searchValue, status, itemsPerPage, currentPage]);

  return (
    <>
      {isPending ? (
        <TableSkeletonLoader />
      ) : (
        <>
          <div className="relative">
            <RCTable
              originData={originalData}
              useColumn={useColumn}
              sortedInfo={{ columnKey: "", order: "" }}
              handleSort={() => {}}
              maxWidth={1200}
            />
          </div>
          <div className="mt-3 flex flex-col md:flex-row justify-between">
            <div>
              <AppSelect
                value={String(itemsPerPage)}
                onSelect={handleSelectItemsPerPage}
                groups={CountItems}
                customClass="w-[80px] h-8 app-input mb-4 md:mb-0"
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

export default SellerApplicationTable;
