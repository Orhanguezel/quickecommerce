'use client';
import { AppSelect } from '@/components/blocks/common';
import { SubmitButton } from '@/components/blocks/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/components/ui';
import { useExportStoreMutation } from '@/modules/admin-section/export/export.action';
import { ExportFormData, exportSchema } from '@/modules/admin-section/export/export.schema';
import { useAppDispatch } from '@/redux/hooks/index';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
const TypeList = [
  { label: 'All Data', value: 'all_data' },
  { label: 'Date Wise', value: 'date_wise' },
  { label: 'ID Wise', value: 'id_wise' },
];
const FormatList = [{ label: 'CSV', value: 'csv' }];

const ExportData = ({ data }: any) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const {
    watch,
    control,
    setValue,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExportFormData>({
    resolver: zodResolver(exportSchema),
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
      // Format date fields
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
              // Convert response data into usable JSON
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

              // Create workbook + worksheet
              const workbook = new ExcelJS.Workbook();
              const worksheet = workbook.addWorksheet('Exported Data');

              if (jsonData.length > 0) {
                // Set columns dynamically
                const columns = Object.keys(jsonData[0]).map((key) => ({
                  header: key,
                  key,
                  width: 20,
                }));
                worksheet.columns = columns;

                // Add all rows
                jsonData.forEach((row) => worksheet.addRow(row));

                // Style the header row
                worksheet.getRow(1).eachCell((cell) => {
                  cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                  cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF2563EB' }, // blue
                  };
                });
              }

              // Generate Excel file and trigger download
              const buffer = await workbook.xlsx.writeBuffer();
              const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              });
              saveAs(blob, 'exported_data.xlsx');
            }
          },
          onError: () => {
            alert('Export failed. Please try again.');
          },
        },
      );
    } catch (error) {
      alert('An unexpected error occurred. Please try again.');
    }
  };

  // Helper function for downloading files
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="mb-2">First Step</CardTitle>
            <CardDescription>Select Data Type</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <div className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                <span className="flex h-2 w-2 translate-y-1 rounded-full bg-blue-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none text-gray-500 dark:text-white ">
                    Select data type in which order you want your data sorted while downloading.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="mb-2">Second Step</CardTitle>
            <CardDescription>Select Data Range by Date or ID and Export </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <div className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                <span className="flex h-2 w-2 translate-y-1 rounded-full bg-blue-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none text-gray-500 dark:text-white ">
                    The file will be downloaded in .xls format
                  </p>
                </div>
              </div>
              <div className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                <span className="flex h-2 w-2 translate-y-1 rounded-full bg-blue-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none text-gray-500 dark:text-white ">
                    Click reset if you want to clear you changes and want to download in default
                    sort wise data
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          {/* <CardFooter>
        <Button className="w-full">
          <Check /> Mark all as read
        </Button>
      </CardFooter> */}
        </Card>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-1">Data Type</p>
            <Controller
              control={control}
              name="type"
              defaultValue={data?.type || ''}
              render={({ field }) => (
                <AppSelect
                  value={field.value || ''}
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
            <p className="text-sm font-medium mb-1">Format</p>
            <Controller
              control={control}
              name="format"
              defaultValue={data?.format || ''}
              render={({ field }) => (
                <AppSelect
                  placeholder="Select Format"
                  value={field.value || ''}
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
                <p className="text-sm font-medium mb-1">Start ID</p>
                <Input
                  id="min_id"
                  {...register('min_id' as keyof ExportFormData)}
                  className="app-input"
                  placeholder="Enter Start ID"
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">End ID</p>
                <Input
                  id="max_id"
                  {...register('max_id' as keyof ExportFormData)}
                  className="app-input"
                  placeholder="Enter End ID"
                />
              </div>
            </>
          )}
          {checkedValue?.type === 'date_wise' && (
            <>
              <div className="">
                <p className="text-sm font-medium mb-1">Start Date</p>
                <Input
                  id="start_date"
                  type="date"
                  {...register('start_date' as keyof ExportFormData)}
                  className="app-input flex flex-col"
                  placeholder="Enter value"
                />
              </div>
              <div className="">
                <p className="text-sm font-medium mb-1">End Date</p>
                <Input
                  id="end_date"
                  type="date"
                  {...register('end_date' as keyof ExportFormData)}
                  className="app-input flex flex-col"
                  placeholder="Enter value"
                />
              </div>
            </>
          )}
        </div>

        <div className="col-span-2 mt-10">
          <SubmitButton UpdateData={data} IsLoading={isPending} AddLabel="Export" />
        </div>
      </form>
    </div>
  );
};
export default ExportData;
