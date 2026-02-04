'use client';
import multiLang from '@/components/molecules/multiLang.json';
import { AppSelect } from '@/components/blocks/common';
import { SubmitButton } from '@/components/blocks/shared';
import { Card, CardContent, Input, Tabs, TabsContent, Textarea } from '@/components/ui';
import { useDepartmentQuery } from '@/modules/common/department/department.action';
import {
  useSupportTicketStoreMutation,
  useSupportTicketUpdateMutation,
} from '@/modules/seller-section/support-ticket/support-ticket.action';
import {
  SupportTicketFormData,
  supportTicketSchema,
} from '@/modules/seller-section/support-ticket/support-ticket.schema';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setRefetch } from '@/redux/slices/refetchSlice';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
type LangKeys = keyof IntlMessages['lang'];

const priorityList = [
  { label: 'Urgent', value: 'urgent' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];
const CreateOrUpdateSupportTicketForm = ({ data, ID }: any) => {
  const multiLangData = React.useMemo(() => multiLang, []);
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const slug = selectedStore?.slug;
  const store_id = selectedStore?.id;
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    control,
  } = useForm<SupportTicketFormData>({
    resolver: zodResolver(supportTicketSchema),
  });
  const { DepartmentList } = useDepartmentQuery({});
  let DepartmentListData = (DepartmentList as any)?.data || [];

  const handleSelectItem = (value: string, inputType: string) => {
    setValue(inputType as any, value);
  };

  const { mutate: blogCategoryStore, isPending } = useSupportTicketStoreMutation();
  const { mutate: blogCategoryUpdate, isPending: isUpdating } = useSupportTicketUpdateMutation();
  const onSubmit = async (values: SupportTicketFormData) => {
    if (values?.department_id === 'none') {
      return toast.error('Please Select Department!');
    }
    const submissionData = {
      ...values,
      store_id: store_id,
      id: data?.ticket_id || '',
    };
    if (data) {
      return blogCategoryUpdate(
        { ...(submissionData as any) },
        {
          onSuccess: () => {
            dispatch(setRefetch(true));
          },
        },
      );
    } else {
      return blogCategoryStore(
        { ...(submissionData as any) },
        {
          onSuccess: () => {
            dispatch(setRefetch(true));
          },
        },
      );
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="rounded-lg border-none mt-4 ">
          <CardContent className="p-2 md:p-6">
            <Tabs defaultValue="df" className="col-span-2">
              <div dir={dir}>
                {multiLangData.map((lang) => {
                  return (
                    <TabsContent key={lang.id} value={lang.id}>
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>{t('label.title')}</span>
                        </p>
                        <Input
                          id={`title`}
                          defaultValue={ID ? String(data?.title) : ''}
                          {...register(`title` as keyof SupportTicketFormData)}
                          className="app-input"
                          placeholder="Enter title"
                        />
                        {errors[`title` as keyof SupportTicketFormData] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`title`]?.message}</p>
                        )}
                      </div>
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>{t('label.subject')}</span>
                        </p>
                        <Input
                          id={`subject`}
                          defaultValue={ID ? String(data?.subject) : ''}
                          {...register(`subject` as keyof SupportTicketFormData)}
                          className="app-input"
                          placeholder="Enter subject"
                        />
                        {errors[`subject` as keyof SupportTicketFormData] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`subject`]?.message}</p>
                        )}
                      </div>
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1 flex items-center gap-2">
                          {t('label.department_id')}
                        </p>
                        <Controller
                          control={control}
                          name="department_id"
                          defaultValue={ID ? String(data?.department_id) : ''}
                          render={({ field }) => (
                            <>
                              <AppSelect
                                value={String(field.value ?? '')}
                                onSelect={(value) => {
                                  field.onChange(value);
                                  handleSelectItem(value, 'department_id');
                                }}
                                groups={DepartmentListData}
                              />
                            </>
                          )}
                        />
                        {errors.department_id && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.department_id.message}
                          </p>
                        )}
                      </div>
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1 flex items-center gap-2">
                          {t('label.priority')}
                        </p>
                        <Controller
                          control={control}
                          name="priority"
                          defaultValue={ID ? String(data?.priority) : ''}
                          render={({ field }) => (
                            <>
                              <AppSelect
                                value={String(field.value ?? '')}
                                onSelect={(value) => {
                                  field.onChange(value);
                                  handleSelectItem(value, 'priority');
                                }}
                                groups={priorityList}
                              />
                            </>
                          )}
                        />
                        {errors.priority && (
                          <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>
                        )}
                      </div>
                    </TabsContent>
                  );
                })}
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="mt-4 sticky bottom-0 w-full p-4">
          <SubmitButton
            UpdateData={data}
            IsLoading={isPending || isUpdating}
            AddLabel={t('button.add_support_ticket')}
            UpdateLabel={t('button.update_support_ticket')}
          />
        </Card>
      </form>
    </div>
  );
};
export default CreateOrUpdateSupportTicketForm;
