'use client';

import { ColumnInsert, CsvFile, ExcelFile } from '@/assets/icons';
import NoDataFoundIcon from '@/assets/icons/NoDataFoundIcon';
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import {
  ChevronLeft,
  ChevronRight,
  DownloadIcon,
  MinusSquareIcon,
  PlusSquareIcon,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Table from 'rc-table';
import React, { useEffect, useMemo, useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useCheckbox } from '../blocks/common/useInput';

type RowId = string | number;

export interface RecordType<TId extends RowId = RowId> {
  id: TId;
  children?: RecordType<TId>[];
  menu_level?: number;
  [key: string]: any;
}

type Props<TId extends RowId = RowId> = {
  originData: RecordType<TId>[];
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

  selectedRows?: Set<TId>;
  handleRowSelection?: (id: TId) => void;
};

const ExpandedRCTable = <TId extends RowId = RowId>({
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
  selectedRows = new Set<TId>(),
  handleRowSelection = () => {},
}: Props<TId>) => {
  const locale = useLocale();
  const t = useTranslations();

  const [autoWidth, autoWidthProps] = useCheckbox(false);
  const [isRtl, isRtlProps] = useCheckbox(locale === 'ar');
  const [fixHeader, fixHeaderProps] = useCheckbox(true);
  const [fixLeft, fixLeftProps] = useCheckbox(true);
  const [fixRight, fixRightProps] = useCheckbox(true);
  const [ellipsis, ellipsisProps] = useCheckbox(false);
  const [percentage, percentageProps] = useCheckbox(false);
  const [empty, emptyProps] = useCheckbox(false);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const [expandedRowKey, setExpandedRowKey] = useState<TId | null>(null);

  const getPaddingClass = (level?: number) => {
    const px = (level ?? 0) * 20;
    if (px <= 0) return 'pl-0';
    if (px === 20) return 'pl-5';
    if (px === 40) return 'pl-10';
    if (px === 60) return 'pl-14';
    if (px === 80) return 'pl-20';
    return 'pl-0';
  };

  const columns = useMemo(() => {
    return useColumn(fixLeft, fixRight).map((col: any) => {
      if (col.dataIndex === 'name' || col.dataIndex === 'category_name') {
        return {
          ...col,
          render: (text: string, record: RecordType<TId>) => (
            <div className={`flex items-center min-w-0 ${getPaddingClass(record.menu_level)}`}>
              <span className="truncate">{text}</span>
            </div>
          ),
        };
      }
      return col;
    });
  }, [useColumn, fixLeft, fixRight]);

  const [columnVisibility, setColumnVisibility] = useState<{ [key: string]: boolean }>(() => {
    const initial: { [key: string]: boolean } = {};
    columns.forEach((col: any) => {
      initial[col.dataIndex] = true;
    });
    return initial;
  });

  useEffect(() => {
    setColumnVisibility((prev) => {
      const next = { ...prev };
      columns.forEach((col: any) => {
        if (!(col.dataIndex in next)) next[col.dataIndex] = true;
      });
      return next;
    });
  }, [columns]);

  const filteredColumns = useMemo(
    () => columns.filter((col: any) => columnVisibility[col.dataIndex]),
    [columns, columnVisibility],
  );

  const modifiedColumns = useMemo(() => {
    return filteredColumns.map((col: any) => ({
      ...col,
      // ✅ bütün hücreleri tek satır yüksekliğe sabitle, overlap biter
      render: (text: any, record: RecordType<TId>) => {
        let tdClass = '';
        if (record.id === expandedRowKey) tdClass = '!text-blue-600';
        else if ((record.menu_level ?? 0) > 0) tdClass = '!text-blue-400';

        return (
          <div className={`${tdClass} w-full min-h-[44px] flex items-center`}>
            {col.render ? col.render(text, record) : text}
          </div>
        );
      },
    }));
  }, [filteredColumns, expandedRowKey]);

  const mergedData: RecordType<TId>[] =
    originData.length > 0 ? originData : empty ? [] : originData;

  const expandable = useMemo(() => {
    return {
      childrenColumnName: 'children',
      indentSize: 20,

      expandedRowKeys: expandedRowKey ? [expandedRowKey] : [],

      onExpand: (expanded: boolean, record: RecordType<TId>) => {
        setExpandedRowKey(expanded ? record.id : null);
      },

      rowExpandable: (record: RecordType<TId>) =>
        Array.isArray(record.children) && record.children.length > 0,

      // ✅ SADECE ikon. Checkbox burada yok!
      expandIcon: ({ expanded, onExpand, record }: any) => {
        const r = record as RecordType<TId>;
        const hasChildren = Array.isArray(r.children) && r.children.length > 0;

        return (
          <div className="flex items-center justify-center w-8">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand(r, e);
                }}
                className="text-[#54697D] hover:opacity-80 transition"
                type="button"
              >
                {expanded ? <MinusSquareIcon size={18} /> : <PlusSquareIcon size={18} />}
              </button>
            ) : (
              <span className="w-[18px] h-[18px]" />
            )}
          </div>
        );
      },
    };
  }, [expandedRowKey]);

  const columnsDropdown = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <span className="bg-gray-200 hover:bg-gray-300 p-2 rounded-lg cursor-pointer">
          <ColumnInsert />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {Object.keys(columnVisibility).map((columnKey) => (
          <DropdownMenuCheckboxItem
            key={columnKey}
            checked={columnVisibility[columnKey]}
            onCheckedChange={(checked) =>
              setColumnVisibility((prev) => ({
                ...prev,
                [columnKey]: Boolean(checked),
              }))
            }
          >
            {columnKey}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const flat = (rows: RecordType<TId>[]): RecordType<TId>[] =>
    rows.flatMap((r) => [r, ...(r.children ? flat(r.children) : [])]);

  const downloadCSV = (data: RecordType<TId>[], filename: string) => {
    const csvRows: string[] = [];
    const filteredDownloadColumns = filteredColumns.filter(
      (col: any) => col.dataIndex !== 'actions',
    );
    const headers = filteredDownloadColumns.map((col: any) => col.dataIndex);
    csvRows.push(headers.join(','));

    flat(data).forEach((row) => {
      const values = filteredDownloadColumns.map(
        (col: { dataIndex: string | number }) => `"${row[col.dataIndex] ?? ''}"`,
      );
      csvRows.push(values.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadExcel = async (data: RecordType<TId>[], filename: string) => {
    const filteredDownloadColumns = filteredColumns.filter(
      (col: any) => col.dataIndex !== 'actions',
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    worksheet.columns = filteredDownloadColumns.map((col: any) => ({
      header: col.dataIndex,
      key: col.dataIndex,
      width: 20,
    }));

    flat(data).forEach((row) => {
      const rowData: Record<string, any> = {};
      filteredDownloadColumns.forEach((col: any) => {
        rowData[col.dataIndex] = row[col.dataIndex];
      });
      worksheet.addRow(rowData);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `${filename}.xlsx`);
  };

  useEffect(() => {
    const tableBody = document.querySelector('.rc-table-body') as HTMLElement | null;
    if (!tableBody) return;

    const updateScrollButtons = () => {
      setCanScrollLeft(tableBody.scrollLeft > 0);
      setCanScrollRight(tableBody.scrollLeft < tableBody.scrollWidth - tableBody.clientWidth);
    };

    updateScrollButtons();
    tableBody.addEventListener('scroll', updateScrollButtons);
    return () => tableBody.removeEventListener('scroll', updateScrollButtons);
  }, []);

  return (
    <div className="shadow-xl rounded-xl mt-4 overflow-hidden">
      <div className="py-2 px-4 flex items-center justify-end gap-3 bg-zinc-50 dark:bg-[#1f2937]">
        {IsRtl && (
          <label className="shadow p-2 flex items-center gap-2">
            <input {...isRtlProps} /> IsRtl
          </label>
        )}
        {AutoWidth && (
          <label className="shadow p-2 flex items-center gap-2">
            <input {...autoWidthProps} /> Auto Width
          </label>
        )}
        {FixHeader && (
          <label className="shadow p-2 flex items-center gap-2">
            <input {...fixHeaderProps} /> Fix Header
          </label>
        )}
        {FixLeft && (
          <label className="shadow p-2 flex items-center gap-2">
            <input {...fixLeftProps} /> Fix Left
          </label>
        )}
        {FixRight && (
          <label className="shadow p-2 flex items-center gap-2">
            <input {...fixRightProps} /> Fix Right
          </label>
        )}
        {Ellipsis && (
          <label className="shadow p-2 flex items-center gap-2">
            <input {...ellipsisProps} /> Ellipsis First Column
          </label>
        )}
        {PerWidth && (
          <label className="shadow p-2 flex items-center gap-2">
            <input {...percentageProps} /> Percentage Width
          </label>
        )}
        {Empty && (
          <label className="shadow p-2 flex items-center gap-2">
            <input {...emptyProps} /> Empty
          </label>
        )}

        <div className="flex items-center gap-2">{columnsDropdown}</div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="bg-gray-200 hover:bg-gray-300 text-gray-500 dark:text-white p-2 rounded-lg cursor-pointer">
              <DownloadIcon width={20} height={20} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => downloadCSV(mergedData, 'CSV-data')}>
              <CsvFile /> <span className="ml-4">CSV</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => downloadExcel(mergedData, 'Excel-data')}>
              <ExcelFile /> <span className="ml-4">Excel</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          className={`bg-gray-200 hover:bg-gray-300 text-gray-500 dark:text-white p-2 rounded-lg ${
            !canScrollLeft ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={!canScrollLeft}
          onClick={() => {
            const tableBody = document.querySelector('.rc-table-body') as HTMLElement | null;
            if (tableBody) tableBody.scrollLeft -= 120;
          }}
        >
          <ChevronLeft width={20} height={20} />
        </Button>

        <Button
          className={`bg-gray-200 hover:bg-gray-300 text-gray-500 dark:text-white p-2 rounded-lg ${
            !canScrollRight ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={!canScrollRight}
          onClick={() => {
            const tableBody = document.querySelector('.rc-table-body') as HTMLElement | null;
            if (tableBody) tableBody.scrollLeft += 120;
          }}
        >
          <ChevronRight width={20} height={20} />
        </Button>
      </div>

      {/* ✅ rc-table görünüm fixleri */}
      <div
        className="
          [&_.rc-table]:w-full
          [&_.rc-table-header]:bg-white
          [&_.rc-table-thead_th]:bg-white
          [&_.rc-table-thead_th]:text-xs
          [&_.rc-table-thead_th]:font-semibold
          [&_.rc-table-thead_th]:text-gray-600
          [&_.rc-table-thead_th]:px-3
          [&_.rc-table-thead_th]:py-3
          [&_.rc-table-tbody_td]:px-3
          [&_.rc-table-tbody_td]:py-2
          [&_.rc-table-tbody_td]:align-middle
          [&_.rc-table-row]:h-[48px]
        "
      >
        <Table<any>
          data={mergedData}
          columns={modifiedColumns}
          direction={isRtl ? 'rtl' : 'ltr'}
          scroll={{
            x: maxWidth,
            y: mergedData.length > 0 ? (fixHeader ? 520 : undefined) : undefined,
          }}
          rowKey={(record: RecordType<TId>) => record.id}
          rowClassName={(record: RecordType<TId>) => {
            if (record.id === expandedRowKey) return '!text-blue-600';
            if ((record.menu_level ?? 0) > 0) return '!text-blue-400';
            return '';
          }}
          expandable={expandable as any}
          emptyText={
            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-white py-10">
              <NoDataFoundIcon />
              <p className="mt-2 text-sm text-gray-500 dark:text-white font-bold">
                {t('common.not_data_found')}
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default ExpandedRCTable;
