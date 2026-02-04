// src/components/blocks/admin-section/category/CategoryTable.tsx
'use client';

import ExpandedRCTable from '@/components/molecules/ExpandedRCTable';
import Pagination from '@/components/molecules/Pagination';
import { AppSelect } from '@/components/blocks/common';
import Delete from '@/components/blocks/custom-icons/Delete';
import TableEdit from '@/components/blocks/custom-icons/TableEdit';
import ConfirmationModal from '@/components/blocks/shared/ConfirmationModal';
import { BulkActionBar } from '@/components/blocks/shared';
import { Badge, Switch } from '@/components/ui';
import { CountItems } from '@/config/helperJson';
import { Routes } from '@/config/routes';
import GlobalImageLoader from '@/lib/imageLoader';
import {
  useCategoriesQuery,
  useCategoryDelete,
  useCategoryStatusUpdate,
} from '@/modules/admin-section/category/category.action';
import { ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import TableSkeletonLoader from '@/components/molecules/TableSkeletonLoader';

interface RecordType {
  id: string;
  serial: string;
  display_order?: number;
  category_name: string;
  meta_title?: string;
  category_banner_url?: string;
  category_thumb_url?: string;
  meta_description?: string;
  actions?: any;
  selectActions?: any;
  status?: boolean;
  key: React.Key;
  children?: RecordType[];
  menu_level?: number;
}

interface ColumnType<T> {
  title: React.ReactNode;
  dataIndex?: keyof T | string;
  key?: string;
  width?: number;
  fixed?: 'left' | 'right' | undefined;
  ellipsis?: boolean;
  children?: ColumnType<T>[];
  render?: (value: any, row: T) => React.ReactNode;
}
type ColumnsType<T> = ColumnType<T>[];

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);
  return isMobile;
}

type SortOrder = '' | 'ascend' | 'descend';
function toSortDir(order: SortOrder): 'asc' | 'desc' | undefined {
  if (order === 'ascend') return 'asc';
  if (order === 'descend') return 'desc';
  return undefined;
}

function withLocalePath(path: string, locale: string) {
  const p = path.startsWith('/') ? path : `/${path}`;
  const prefix = `/${locale}`;
  if (p === prefix || p.startsWith(`${prefix}/`)) return p;
  return `${prefix}${p}`;
}

const CategoryTable = ({ searchValue }: any) => {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const isMobile = useIsMobile(768);

  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    if (typeof window === 'undefined') return 10;
    return parseInt(localStorage.getItem('itemsPerPage') || '10', 10);
  });

  const [currentPage, setCurrentPage] = useState(1);

  const [sortedInfo, setSortedInfo] = useState<{ columnKey: string; order: SortOrder }>({
    columnKey: '',
    order: '',
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, itemsPerPage]);

  const sortDir = toSortDir(sortedInfo.order);
  const sortField = sortedInfo.columnKey || 'id';

  const queryParams = useMemo(() => {
    const p: any = {
      list: true,
      per_page: itemsPerPage,
      language: locale,
      page: currentPage,
      sortField,
      search: searchValue ?? '',
    };
    if (sortDir) p.sort = sortDir;
    return p;
  }, [itemsPerPage, locale, currentPage, sortField, sortDir, searchValue]);

  const { categories, refetch, isPending, error } = useCategoriesQuery(queryParams);

  const totalDataLength = (categories as any)?.meta?.total ?? 0;
  const startIndex = (categories as any)?.meta?.from ?? 0;
  const lastPage = (categories as any)?.meta?.last_page ?? 1;

  useEffect(() => {
    if (Number(currentPage) > Number(lastPage)) setCurrentPage(lastPage);
  }, [lastPage, currentPage]);

  const originalData = useMemo(() => {
    const data = (categories as any)?.data || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: String(startIndex + index),
    }));
  }, [categories, startIndex]);

  const updatePage = (p: number) => setCurrentPage(p);

  const handleSort = (columnKey: string) => {
    setSortedInfo((prev) => {
      const isSame = prev.columnKey === columnKey;
      const nextOrder: SortOrder = !isSame
        ? 'ascend'
        : prev.order === 'ascend'
          ? 'descend'
          : prev.order === 'descend'
            ? ''
            : 'ascend';
      return { columnKey, order: nextOrder };
    });
  };

  const handleSelectItemsPerPage = (value: string) => {
    const n = parseInt(value, 10);
    setItemsPerPage(n);
    setCurrentPage(1);
    localStorage.setItem('itemsPerPage', value);
  };

  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [editRowId, setEditRowId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedRows(new Set());
    setSelectedAction('');
  }, [searchValue, itemsPerPage, currentPage, sortField, sortDir]);

  const [loading, setLoading] = useState(false);
  const { mutate: categoryStatus } = useCategoryStatusUpdate();

  const handleToggleStatus = (id: string) => {
    setLoading(true);
    categoryStatus(
      { id },
      {
        onSuccess: () => {
          refetch();
          setLoading(false);
        },
        onError: () => setLoading(false),
      },
    );
  };

  const { mutate: categoryDelete, isPending: isRequesting } = useCategoryDelete();

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) setSelectedRows(new Set(originalData.map((row: any) => String(row.id))));
    else setSelectedRows(new Set());
  };

  const handleRowSelection = (rowId: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  };

  const handleApplyDelete = () => {
    if (selectedAction !== 'deleted') return;
    const ids = Array.from(selectedRows);
    if (ids.length === 0) return;

    categoryDelete(
      { ids },
      {
        onSuccess: () => {
          refetch();
          setSelectedRows(new Set());
          setSelectedAction('');
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    setLoading(true);
    categoryDelete(
      { ids: [id] },
      {
        onSuccess: () => {
          refetch();
          setLoading(false);
        },
        onError: () => setLoading(false),
      },
    );
  };

  const addMenuLevel = useCallback((items: any[], level = 0): any[] => {
    return items.map((item) => {
      const newItem: any = { ...item, menu_level: level };
      if (Array.isArray(item.children) && item.children.length > 0) {
        newItem.children = addMenuLevel(item.children, level + 1);
      }
      return newItem;
    });
  }, []);

  const dataWithMenuLevels = useMemo(
    () => addMenuLevel(originalData),
    [originalData, addMenuLevel],
  );

  const buildColumns = useCallback(
    (fixLeft: boolean, fixRight: boolean): ColumnsType<RecordType> => {
      const handleEdit = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();

        const base = `${Routes.editCategory}/${id}`;
        const url = withLocalePath(base, locale);

        if (e.ctrlKey || e.metaKey || e.button === 1) window.open(url, '_blank');
        else {
          setEditRowId(id);
          router.push(url);
        }
      };

      return [
        {
          title: '',
          dataIndex: 'selectActions',
          key: 'selectActions',
          width: 64,
          fixed: fixLeft ? 'left' : undefined,
          render: (_: any, row: RecordType) => (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                onChange={(e) => {
                  e.stopPropagation();
                  handleRowSelection(String(row.id));
                }}
                checked={selectedRows.has(String(row.id))}
                className="h-4 w-4 accent-blue-600"
              />
            </div>
          ),
        },
        {
          title: t('table_header.category'),
          dataIndex: 'category_name',
          key: 'category_name',
          width: 320,
          ellipsis: true,
        },
        {
          title: t('table_header.thumb'),
          dataIndex: 'category_thumb_url',
          key: 'category_thumb_url',
          width: 110,
          render: (src: any) => {
            const safeSrc = typeof src === 'string' && src.trim().length > 0 ? src.trim() : null;

            return (
              <div className="relative w-12 h-12 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                <Image
                  loader={safeSrc ? GlobalImageLoader : undefined}
                  src={safeSrc || '/images/no-image.png'}
                  alt="thumb"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
            );
          },
        },
        {
          title: t('table_header.status'),
          dataIndex: 'status',
          key: 'status',
          width: 220,
          render: (status: any, row: RecordType) => (
            <div className="flex items-center justify-start gap-3">
              <div className="min-w-[88px]">
                <Badge
                  className={`${
                    status == 1
                      ? 'bg-green-50 border border-green-500 text-green-600'
                      : 'bg-gray-50 border border-gray-500 text-gray-600'
                  } capitalize`}
                >
                  {status == 1 ? t('common.active') : t('common.inactive')}
                </Badge>
              </div>

              <ConfirmationModal
                trigger={
                  <div dir="ltr" className="flex items-center">
                    <Switch checked={status == 1} />
                  </div>
                }
                loading={loading}
                onSave={() => handleToggleStatus(row.id)}
                title={t('title.update_status')}
                subTitle={t('sub_title.update_status')}
              />
            </div>
          ),
        },
        {
          title: t('table_header.actions'),
          dataIndex: 'actions',
          key: 'actions',
          width: 140,
          fixed: !isMobile && fixRight ? 'right' : undefined,
          render: (_: any, row: RecordType) => (
            <div className="flex items-center justify-start gap-2">
              <TableEdit
                isLoading={editRowId === row.id}
                onClick={(e: React.MouseEvent<Element, MouseEvent>) => handleEdit(e, row.id)}
              />
              <ConfirmationModal
                trigger={<Delete />}
                onSave={() => handleDelete(row.id)}
                loading={loading}
                title={t('title.delete_category')}
                subTitle={t('sub_title.delete_category')}
              />
            </div>
          ),
        },
      ];
    },
    [t, router, loading, editRowId, isMobile, selectedRows, locale],
  );

  const useColumn = useCallback(
    (fixLeft: boolean, fixRight: boolean) => buildColumns(fixLeft, fixRight),
    [buildColumns],
  );

  const actions = [{ value: 'deleted', label: t('common.delete'), onClick: handleApplyDelete }];

  if (error) {
    return <div className="p-4 text-sm text-red-600">{t('common.error')}</div>;
  }

  return (
    <>
      {isPending ? (
        <TableSkeletonLoader />
      ) : (
        <>
          <div className="relative">
            <BulkActionBar
              selectedAction={selectedAction}
              setSelectedAction={setSelectedAction}
              selectedRows={selectedRows}
              originalDataLength={originalData.length}
              handleSelectAll={handleSelectAll}
              isRequesting={isRequesting}
              actions={actions}
              checkboxCustomClass="ml-4"
            />

            <ExpandedRCTable
              originData={dataWithMenuLevels}
              useColumn={useColumn}
              sortedInfo={sortedInfo}
              handleSort={handleSort}
              selectedRows={selectedRows}
              handleRowSelection={(id) => handleRowSelection(String(id))}
              maxWidth={1100}
            />
          </div>

          <div className="mt-3 flex flex-col md:flex-row justify-between gap-3">
            <div>
              <AppSelect
                value={String(itemsPerPage)}
                onSelect={handleSelectItemsPerPage}
                groups={CountItems}
                customClass="w-[80px] h-8"
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

export default CategoryTable;
