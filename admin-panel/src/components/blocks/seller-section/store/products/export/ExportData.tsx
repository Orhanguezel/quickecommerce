'use client';
import { AppSelect } from '@/components/blocks/common';
import { SubmitButton } from '@/components/blocks/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/components/ui';

import { useExportStoreMutation } from '@/modules/seller-section/export/export.action';
import { ExportFormData, exportSchema } from '@/modules/seller-section/export/export.schema';
import { useAppDispatch } from '@/redux/hooks/index';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';

const ExportData = ({ data }: any) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const TypeList = [
    { label: t('common.export_all_data'), value: 'all_data' },
    { label: t('common.export_date_wise'), value: 'date_wise' },
    { label: t('common.export_id_wise'), value: 'id_wise' },
  ];
  const FormatList = [
    { label: t('common.export_format_csv'), value: 'csv' },
  ];

  const { watch, control, setValue, register, handleSubmit } = useForm<ExportFormData>({
    resolver: zodResolver(exportSchema),
    defaultValues: {
      format: data?.format ?? '',
      type: data?.type ?? '',
    },
  });
  const checkedValue = watch();

  const handleSelectItem = (value: any, inputType: any) => {
    setValue(inputType as any, value);
    if (value === 'date_wise') {
      setValue('min_id', '');
      setValue('max_id', '');
    }
    if (value === 'id_wise') {
      setValue('start_date', '');
      setValue('end_date', '');
    }
  };

  const { mutate: ExportStore, isPending } = useExportStoreMutation();
  const onSubmit = async (values: ExportFormData) => {
    try {
      const formattedData = {
        ...values,
        start_date: values.start_date
          ? new Date(values.start_date).toISOString().slice(0, 19).replace('T', ' ')
          : null,
        end_date: values.end_date
          ? new Date(values.end_date).toISOString().slice(0, 19).replace('T', ' ')
          : null,
      };
      const submissionData = { ...formattedData };

      ExportStore(
        { ...(submissionData as any) },
        {
          onSuccess: async (response: any) => {
            const { format } = values;
            const fileData = response.data;

            // Handle CSV download
            if (format === 'csv') {
              const blob = new Blob([fileData], {
                type: 'text/csv;charset=utf-8;',
              });
              downloadFile(blob, 'exported_data.csv');
            }

            // Handle XLSX download using ExcelJS
            else if (format === 'xlsx') {
              let jsonData: any[] = [];
              if (typeof fileData === 'string') {
                try {
                  jsonData = JSON.parse(fileData);
                } catch {
                  console.error('Excel export: failed to parse JSON string');
                }
              } else {
                jsonData = fileData;
              }

              const workbook = new ExcelJS.Workbook();
              const worksheet = workbook.addWorksheet('Exported Data');

              if (jsonData.length > 0) {
                const columns = Object.keys(jsonData[0]).map((key) => ({
                  header: key,
                  key,
                  width: 20,
                }));
                worksheet.columns = columns;

                jsonData.forEach((row) => worksheet.addRow(row));

                worksheet.getRow(1).eachCell((cell) => {
                  cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                  cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF2563EB' },
                  };
                });
              }

              const buffer = await workbook.xlsx.writeBuffer();
              const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              });
              saveAs(blob, 'exported_data.xlsx');
            }
          },
          onError: () => {
            toast.error(t('common.export_failed'));
          },
        },
      );
    } catch (error) {
      toast.error(t('common.unexpected_error'));
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle className="mb-2">{t('common.export_step_one_title')}</CardTitle>
            <CardDescription>{t('common.export_step_one_description')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <div className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                <span className="flex h-2 w-2 translate-y-1 rounded-full bg-blue-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none text-gray-500 dark:text-white ">
                    {t('common.export_step_one_note_one')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="mb-2">{t('common.export_step_two_title')}</CardTitle>
            <CardDescription>{t('common.export_step_two_description')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <div className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                <span className="flex h-2 w-2 translate-y-1 rounded-full bg-blue-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none text-gray-500 dark:text-white ">
                    {t('common.export_step_two_note_one')}
                  </p>
                </div>
              </div>
              <div className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                <span className="flex h-2 w-2 translate-y-1 rounded-full bg-blue-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none text-gray-500 dark:text-white ">
                    {t('common.export_step_two_note_two')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-1">{t('common.export_data_type')}</p>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <AppSelect
                  value={String(field.value ?? '')}
                  onSelect={(value) => {
                    field.onChange(value);
                    handleSelectItem(value, 'type');
                  }}
                  groups={TypeList}
                />
              )}
            />
          </div>
          <div>
            <p className="text-sm font-medium mb-1">{t('common.format')}</p>
            <Controller
              control={control}
              name="format"
              render={({ field }) => (
                <AppSelect
                  placeholder={t('place_holder.select_format')}
                  value={String(field.value ?? '')}
                  onSelect={(value) => {
                    field.onChange(value);
                    handleSelectItem(value, 'format');
                  }}
                  groups={FormatList}
                />
              )}
            />
          </div>
          {checkedValue?.type === 'id_wise' && (
            <>
              <div>
                <p className="text-sm font-medium mb-1">{t('common.export_start_id')}</p>
                <Input
                  id="min_id"
                  {...register('min_id' as keyof ExportFormData)}
                  className="app-input"
                  placeholder={t('place_holder.enter_start_id')}
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">{t('common.export_end_id')}</p>
                <Input
                  id="max_id"
                  {...register('max_id' as keyof ExportFormData)}
                  className="app-input"
                  placeholder={t('place_holder.enter_end_id')}
                />
              </div>
            </>
          )}
          {checkedValue?.type === 'date_wise' && (
            <>
              <div className="">
                <p className="text-sm font-medium mb-1">{t('label.start_date')}</p>
                <Input
                  id="start_date"
                  type="date"
                  {...register('start_date' as keyof ExportFormData)}
                  className="app-input flex flex-col"
                  placeholder={t('place_holder.enter_value')}
                />
              </div>
              <div className="">
                <p className="text-sm font-medium mb-1">{t('label.end_date')}</p>
                <Input
                  id="end_date"
                  type="date"
                  {...register('end_date' as keyof ExportFormData)}
                  className="app-input flex flex-col"
                  placeholder={t('place_holder.enter_value')}
                />
              </div>
            </>
          )}
        </div>

        <div className="col-span-2 mt-10">
          <SubmitButton UpdateData={data} IsLoading={isPending} AddLabel={t('common.export')} />
        </div>
      </form>
    </div>
  );
};
export default ExportData;
