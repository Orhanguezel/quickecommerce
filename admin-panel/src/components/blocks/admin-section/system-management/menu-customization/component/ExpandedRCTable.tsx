"use client";
import { ColumnInsert, CsvFile, ExcelFile } from "@/assets/icons";
import NoDataFoundIcon from "@/assets/icons/NoDataFoundIcon";
import { useCheckbox } from "@/components/blocks/common/useInput";
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  ChevronLeft,
  ChevronRight,
  DownloadIcon,
  MinusSquareIcon,
  PlusSquareIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Table from "rc-table";
import React, { useEffect, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface RecordType {
  id: number;
  [key: string]: any;
}

type Props = {
  originData: RecordType[];
  useColumn: any;
  sortedInfo: any;
  handleSort: (columnKey: string) => void;
  IsRtl?: string;
  AutoWidth?: number;
  FixHeader?: string;
  FixLeft?: string;
  FixRight?: string;
  Ellipsis?: string;
  PerWidth?: string;
  Empty?: string;
  maxWidth?: any;
};

const ExpandedRCTable = ({
  originData,
  useColumn,
  sortedInfo,
  handleSort,
  IsRtl,
  AutoWidth,
  FixHeader,
  FixLeft,
  FixRight,
  Ellipsis,
  Empty,
  PerWidth,
  maxWidth = 1800,
}: Props) => {
  const locale = useLocale();
  const t = useTranslations();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [autoWidth, autoWidthProps] = useCheckbox(false);
  const [isRtl, isRtlProps] = useCheckbox(locale == "ar" ? true : false);
  const [fixHeader, fixHeaderProps] = useCheckbox(true);
  const [fixLeft, fixLeftProps] = useCheckbox(true);
  const [fixRight, fixRightProps] = useCheckbox(true);
  const [ellipsis, ellipsisProps] = useCheckbox(false);
  const [percentage, percentageProps] = useCheckbox(false);
  const [empty, emptyProps] = useCheckbox(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const [expandedRowKey, setExpandedRowKey] = useState<number | null>(null);

  const expandable = {
    expandIcon: ({ expanded, onExpand, record }: any) => {
      if (Array.isArray(record.children) && record.children.length > 0) {
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpandedRowKey(expanded ? null : record.id); // track expanded parent
              onExpand(record, e);
            }}
            className="mx-4 text-[#54697D] transition-transform duration-200 bg-none border-none cursor-pointer"
          >
            {expanded ? (
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
        );
      }
      return <span className="indicator-spacer" />;
    },

    indentSize: 24,
    rowExpandable: (record: any) => !!record.hasChildren,
  };

  const getPaddingClass = (level: number) => {
    const px = level * 24;
    switch (px) {
      case 0:
        return "pl-[0px]";
      case 24:
        return "pl-[24px]";
      case 48:
        return "pl-[48px]";
      case 72:
        return "pl-[72px]";
      case 96:
        return "pl-[96px]";
      case 120:
        return "pl-[120px]";
      default:
        return "pl-[0px]";
    }
  };

  const columns = useColumn(fixLeft, fixRight).map((col: any) => {
    if (col.dataIndex === "name" || col.dataIndex === "category_name") {
      return {
        ...col,
        render: (text: string, record: any) => {
          return (
            <div
              className={`flex items-center ${getPaddingClass(
                record.menu_level
              )}`}
            >
              {text}
            </div>
          );
        },
      };
    }
    return col;
  });

  const [columnVisibility, setColumnVisibility] = useState(() => {
    const initialVisibility: { [key: string]: boolean } = {};
    columns.forEach((col: any) => {
      initialVisibility[col.dataIndex] = true;
    });
    return initialVisibility;
  });

  const filteredColumns = columns.filter(
    (col: any) => columnVisibility[col.dataIndex]
  );

  const columnsDropdown = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <span className="bg-gray-200 hover:bg-gray-300 p-2 rounded-lg">
          <ColumnInsert />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="" align="start">
        {Object.keys(columnVisibility).map((columnKey) => (
          <DropdownMenuCheckboxItem
            key={columnKey}
            checked={columnVisibility[columnKey]}
            onCheckedChange={(checked) =>
              setColumnVisibility((prev) => ({
                ...prev,
                [columnKey]: checked,
              }))
            }
          >
            {columnKey}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const downloadCSV = (data: RecordType[], filename: string) => {
    const csvRows: string[] = [];
    const filteredDownloadColumns = filteredColumns.filter(
      (col: any) => col.dataIndex !== "actions"
    );
    const headers = filteredDownloadColumns.map((col: any) => col.dataIndex);
    csvRows.push(headers.join(","));
    data.forEach((row) => {
      const values = filteredDownloadColumns.map(
        (col: { dataIndex: string | number }) => `"${row[col.dataIndex]}"`
      );
      csvRows.push(values.join(","));
    });
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadExcel = async (data: RecordType[], filename: string) => {
    const filteredDownloadColumns = filteredColumns.filter(
      (col: any) => col.dataIndex !== "actions"
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data");

    // Define headers
    const headers = filteredDownloadColumns.map((col: any) => ({
      header: col.dataIndex,
      key: col.dataIndex,
      width: 20,
    }));

    worksheet.columns = headers;

    // Add rows
    data.forEach((row) => {
      const rowData: Record<string, any> = {};
      filteredDownloadColumns.forEach((col: any) => {
        rowData[col.dataIndex] = row[col.dataIndex];
      });
      worksheet.addRow(rowData);
    });

    // Optional: style header
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2563EB" }, // blue
      };
    });

    // Write to buffer and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${filename}.xlsx`);
  };

  let mergedData: RecordType[] =
    originData.length > 0 ? originData : empty ? [] : originData;

  useEffect(() => {
    const tableBody = document.querySelector(".rc-table-body") as HTMLElement;
    if (tableBody) {
      const updateScrollButtons = () => {
        setCanScrollLeft(tableBody.scrollLeft > 0);
        setCanScrollRight(
          tableBody.scrollLeft < tableBody.scrollWidth - tableBody.clientWidth
        );
      };
      updateScrollButtons();
      tableBody.addEventListener("scroll", updateScrollButtons);
      return () => {
        tableBody.removeEventListener("scroll", updateScrollButtons);
      };
    }
  }, []);

  const modifiedColumns = filteredColumns.map((col: any) => ({
    ...col,
    render: (text: any, record: RecordType) => {
      let tdClass = "";

      if (record.id === expandedRowKey) tdClass = "!text-blue-600";
      else if (record.menu_level && record.menu_level > 0)
        tdClass = "!text-blue-400";

      return (
        <div className={`${tdClass} w-full h-full`}>
          {col.render ? col.render(text, record) : text}
        </div>
      );
    },
  }));

  return (
    <React.StrictMode>
      <div className="shadow-xl rounded-xl mt-4">
        <div className="py-2 px-4 flex items-center justify-end gap-4 bg-zinc-50 dark:bg-[#1f2937]">
          {IsRtl && (
            <label className="shadow p-2 flex items-center gap-2">
              <input {...isRtlProps} />
              IsRtl
            </label>
          )}
          {AutoWidth && (
            <label className="shadow p-2 flex items-center gap-2">
              <input {...autoWidthProps} />
              Auto Width
            </label>
          )}
          {FixHeader && (
            <label className="shadow p-2 flex items-center gap-2">
              <input {...fixHeaderProps} />
              Fix Header
            </label>
          )}
          {FixLeft && (
            <label className="shadow p-2 flex items-center gap-2">
              <input {...fixLeftProps} />
              Fix Left
            </label>
          )}
          {FixRight && (
            <label className="shadow p-2 flex items-center gap-2">
              <input {...fixRightProps} />
              Fix Right
            </label>
          )}

          {Ellipsis && (
            <label className="shadow p-2 flex items-center gap-2">
              <input {...ellipsisProps} />
              Ellipsis First Column
            </label>
          )}
          {PerWidth && (
            <label className="shadow p-2 flex items-center gap-2">
              <input {...percentageProps} />
              Percentage Width
            </label>
          )}
          {Empty && (
            <label className="shadow p-2 flex items-center gap-2">
              <input {...emptyProps} />
              Empty
            </label>
          )}
          <div className="flex items-center gap-2">{columnsDropdown}</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="bg-gray-200 hover:bg-gray-300 text-gray-500 dark:text-white p-2 rounded-lg">
                <DownloadIcon width={20} height={20} />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => downloadCSV(mergedData, "CSV-data")}
              >
                <CsvFile /> <span className="ml-4"> CSV</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => downloadExcel(mergedData, "Excel-data")}
              >
                <ExcelFile /> <span className="ml-4"> Excel</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            className={`bg-gray-200 hover:bg-gray-300 text-gray-500 dark:text-white p-2 rounded-lg ${
              !canScrollLeft ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!canScrollLeft}
            onClick={() => {
              const tableBody = document.querySelector(
                ".rc-table-body"
              ) as HTMLElement;
              if (tableBody) {
                tableBody.scrollLeft -= 50;
              }
            }}
          >
            <ChevronLeft width={20} height={20} />
          </Button>
          <Button
            className={`bg-gray-200 hover:bg-gray-300 text-gray-500 dark:text-white p-2 rounded-lg ${
              !canScrollRight ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!canScrollRight}
            onClick={() => {
              const tableBody = document.querySelector(
                ".rc-table-body"
              ) as HTMLElement;
              if (tableBody) {
                tableBody.scrollLeft += 50;
              }
            }}
          >
            <ChevronRight width={20} height={20} />
          </Button>
        </div>

        <Table<any>
          data={mergedData}
          columns={modifiedColumns}
          direction={isRtl ? "rtl" : "ltr"}
          scroll={{
            x: maxWidth,
            y: mergedData.length > 0 ? (fixHeader ? 500 : "") : "",
          }}
          rowKey={(record) => record.id}
          rowClassName={(record) => {
            if (record.id === expandedRowKey) return "!text-blue-600";
            if (record.menu_level && record.menu_level > 0)
              return "!text-blue-400";
            return "";
          }}
          expandable={expandable}
          emptyText={
            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-white py-10">
              <NoDataFoundIcon />
              <p className="mt-2 text-sm text-gray-500 dark:text-white font-bold">
                {t("common.not_data_found")}
              </p>
            </div>
          }
        />
      </div>
    </React.StrictMode>
  );
};

export default ExpandedRCTable;
