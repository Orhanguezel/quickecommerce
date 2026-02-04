// src/components/blocks/admin-section/dynamic-fields/DynamicFieldOptionsList.tsx

"use client";
import Delete from "@/components/blocks/custom-icons/Delete";
import TableEdit from "@/components/blocks/custom-icons/TableEdit";
import { SubmitButton } from "@/components/blocks/shared";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import Loader from "@/components/molecules/Loader";
import multiLang from "@/components/molecules/multiLang.json";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import {
  Card,
  CardContent,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import {
  useDynamicFieldOptionDelete,
  useDynamicFieldOptionQuery,
  useDynamicFieldOptionQueryById,
  useDynamicFieldOptionStoreMutation,
  useDynamicFieldOptionUpdateMutation,
} from "@/modules/admin-section/dynamic-fields/dynamic-fields.action";
import {
  DynamicFieldOptionFormData,
  dynamicFieldOptionSchema,
} from "@/modules/admin-section/dynamic-fields/dynamic-fields.schema";
import { useAppDispatch } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { AppSelect } from "../../common";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  serial: string;
  value: string;
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
type LangKeys = keyof IntlMessages["lang"];

export default function DynamicFieldOptionsList({ ID }: any) {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const multiLangData = React.useMemo(() => multiLang, []);
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
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
  const {
    DynamicFieldOption,
    refetch,
    isPending: isQuering,
    error,
  } = useDynamicFieldOptionQuery({
    limit: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
    sort: sortField,
    dynamic_field_id: ID,
  });

  let totalDataLength = (DynamicFieldOption as any)?.meta?.total;
  const startIndex = (DynamicFieldOption as any)?.meta?.from;
  const LastPage = (DynamicFieldOption as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (DynamicFieldOption as any)?.data || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [DynamicFieldOption, startIndex]);

  useEffect(() => {
    if (Number(currentPage) > Number(LastPage)) {
      setCurrentPage(LastPage);
    } else {
      setCurrentPage(currentPage);
    }
  }, [LastPage, currentPage]);

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
  const { mutate: DynamicFieldDeleteMutation } = useDynamicFieldOptionDelete();
  const handleDelete = (id: string) => {
    setLoading(true);
    DynamicFieldDeleteMutation(id, {
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
  const [editRowId, setEditRowId] = useState("");
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
          width: 80,
        },

        {
          title: t("table_header.name"),
          dataIndex: "value",
          width: 200,
        },
        {
          title: t("table_header.actions"),
          dataIndex: "actions",
          width: 100,
          fixed: !isMobile && fixRight ? "right" : undefined,
        },
      ],
      [fixLeft, fixRight, isMobile]
    );

    const handleEdit = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setEditRowId(id);
    };

    const renderColumns = columns.map((col) => {
      if (col.dataIndex === "actions") {
        return {
          ...col,
          render: (o: any, row: RecordType) => (
            <div className="flex items-center gap-2 ">
              <TableEdit
                isLoading={editRowId === row.id}
                onClick={(e: React.MouseEvent<Element, MouseEvent>) =>
                  handleEdit(e, row.id)
                }
              />
              <ConfirmationModal
                trigger={<Delete />}
                onSave={() => handleDelete(row.id)}
                loading={loading}
                title="Delete Dynamic Field Option"
                subTitle="Are you sure you want to delete dynamic field Option?"
              />
            </div>
          ),
        };
      }
      return col;
    });
    return renderColumns;
  };

  /*................Option Store Section Handle ................. */

  const [editData, setEditData] = useState({});
  const { DynamicFieldOptionByID, refetch: refetchDynamicFieldOption } =
    useDynamicFieldOptionQueryById(editRowId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    reset,
  } = useForm<DynamicFieldOptionFormData>({
    resolver: zodResolver(dynamicFieldOptionSchema),
  });

  useEffect(() => {
    if (
      DynamicFieldOptionByID &&
      Object.keys(DynamicFieldOptionByID).length > 0
    ) {
      setEditData(DynamicFieldOptionByID);
      setValue("value_df", (DynamicFieldOptionByID as any).value ?? "");

      Object.keys((DynamicFieldOptionByID as any)?.translations ?? {}).forEach(
        (language) => {
          const translation = (DynamicFieldOptionByID as any).translations[
            language
          ];
          setValue(
            `value_${language}` as keyof DynamicFieldOptionFormData,
            translation?.value ?? ""
          );
        }
      );
      setEditRowId("");
    }
  }, [DynamicFieldOptionByID, setValue]);

  const { mutate: brandStore, isPending } =
    useDynamicFieldOptionStoreMutation();
  const { mutate: brandUpdate, isPending: isUpdating } =
    useDynamicFieldOptionUpdateMutation();
  const onSubmit = async (values: DynamicFieldOptionFormData) => {
    const defaultData = {
      value: values.value_df,
    };
    const translations = multiLangData
      .filter((lang) => (values as any)[`value_${lang.id}`])
      .map((lang) => ({
        language_code: lang.id,
        value: (values as any)[`value_${lang.id}`],
      }));
    const submissionData = {
      ...defaultData,
      id: (editData as any)?.id,
      dynamic_field_id: ID,
      translations: translations,
    };

    return Object.keys(editData).length > 0
      ? brandUpdate(
          { ...(submissionData as any) },
          {
            onSuccess: () => {
              dispatch(setRefetch(true));
              reset();
              setEditData({});
              refetch();
            },
          }
        )
      : brandStore(
          { ...(submissionData as any) },
          {
            onSuccess: () => {
              dispatch(setRefetch(true));
              reset();
              refetch();
            },
          }
        );
  };

  useEffect(() => {
    if (!isPending && !error) {
      refetch();
    }
  }, [sortField, itemsPerPage, currentPage, isPending, refetch, error]);
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">
        <>
          {isQuering ? (
            <TableSkeletonLoader />
          ) : (
            <div className="relative">
              <RCTable
                originData={originalData}
                useColumn={useColumn}
                sortedInfo={sortedInfo}
                handleSort={handleSort}
                maxWidth={600}
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
            </div>
          )}
        </>
      </div>
      <div>
        <Card className="mt-4 ">
          <CardContent className="relative p-2 md:p-4">
            {originalData[0]?.dynamic_option_name && (
              <div className="capitalize p-2 rounded mb-4 bg-cyan-50 dark:bg-gray-900 text-cyan-500 font-semibold text-lg">
                <p> {originalData[0]?.dynamic_option_name}</p>
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Tabs defaultValue="df" className="">
                <TabsList
                  dir={dir}
                  className="flex justify-start bg-white dark:bg-[#1f2937]"
                >
                  {multiLangData.map((lang) => (
                    <TabsTrigger key={lang.id} value={lang.id}>
                      {lang.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <div dir={dir} className="">
                  {multiLangData.map((lang) => {
                    return (
                      <TabsContent key={lang.id} value={lang.id}>
                        <div>
                          <p className="text-sm font-medium mb-1 flex items-center gap-2">
                            <span>
                              Value (
                              {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                            </span>
                          </p>
                          <Input
                            id={`value_${lang.id}`}
                            {...register(
                              `value_${lang.id}` as keyof DynamicFieldOptionFormData
                            )}
                            className="app-input"
                            placeholder={t("place_holder.enter_name")}
                          />

                          {errors[
                            `value_${lang.id}` as keyof DynamicFieldOptionFormData
                          ] && (
                            <p className="text-red-500 text-sm mt-1">
                              {(errors as any)[`value_${lang.id}`]?.message}
                            </p>
                          )}
                        </div>
                      </TabsContent>
                    );
                  })}
                </div>
              </Tabs>
              <div className="flex items-center gap-2">
                <SubmitButton
                  UpdateData={Object.keys(editData).length > 0}
                  IsLoading={isPending || isUpdating}
                  AddLabel="Save"
                  UpdateLabel="Update"
                />
                {Object.keys(editData).length > 0 && (
                  <div
                    onClick={() => {
                      setEditData({});
                      reset();
                    }}
                    className="app-button px-4 py-2 rounded cursor-pointer font-semibold"
                  >
                    <p>Reset</p>
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
