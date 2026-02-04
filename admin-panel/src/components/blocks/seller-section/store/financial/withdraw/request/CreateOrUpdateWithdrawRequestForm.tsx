'use client';
import multiLang from '@/components/molecules/multiLang.json';
import { AppSelect } from '@/components/blocks/common';
import { SubmitButton } from '@/components/blocks/shared';
import { Card, CardContent, Input, Textarea } from '@/components/ui';
import {
  useRequestStoreMutation,
  useWithdrawMethodDropdownQuery,
} from '@/modules/seller-section/financial/withdraw/request/request.action';
import {
  RequestFormData,
  requestSchema,
} from '@/modules/seller-section/financial/withdraw/request/request.schema';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setRefetch } from '@/redux/slices/refetchSlice';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

const CreateOrUpdateWithdrawRequestForm = ({ data, ID }: any) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const store_id = selectedStore?.id;
  const multiLangData = React.useMemo(() => multiLang, []);
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    setValue,
    watch,
    control,
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
  });

  const { WithdrawMethodList } = useWithdrawMethodDropdownQuery({});
  let DepartmentListData = (WithdrawMethodList as any)?.data || [];

  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const handleSelectItem = (value: string) => {
    const selectedGateway = DepartmentListData.find(
      (item: { value: string }) => String(item.value) === value,
    );
    setSelectedFields(selectedGateway?.fields || []);
    setValue('withdraw_gateway_id', value);
  };

  const { mutate: methodStore, isPending: isMethodPending } = useRequestStoreMutation();
  const onSubmit = async (values: RequestFormData) => {
    const transformedFields = {
      gateways: selectedFields.reduce<Record<string, string>>((acc, field) => {
        const key = field.toLowerCase().replace(/\s+/g, '_');
        acc[key] = field;
        return acc;
      }, {}),
    };

    const submissionData = {
      ...values,
      store_id: store_id,
    };

    return methodStore(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          dispatch(setRefetch(true));
        },
      },
    );
  };
  return (
    <>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="w-full flex items-center justify-center mt-4">
            <CardContent className="p-2 md:p-6 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1 flex items-center gap-2">
                    <span>{t('label.withdrawal_amount')}</span>
                  </p>
                  <Input
                    id="amount"
                    type="number"
                    min={0}
                    {...register(`amount` as keyof RequestFormData)}
                    className="app-input"
                    placeholder={t('place_holder.enter_amount')}
                    onFocus={(e) => {
                      // Clear the value when the input gains focus
                      if (e.target.value === '0') {
                        e.target.value = '';
                      }
                    }}
                  />
                  {errors[`amount` as keyof RequestFormData] && (
                    <p className="text-red-500 text-sm mt-1">
                      {
                        //@ts-ignore
                        errors[`amount`]?.message
                      }
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium mb-1 flex items-center gap-2">
                    {t('label.payment_method')}
                  </p>
                  <Controller
                    control={control}
                    name="withdraw_gateway_id"
                    render={({ field }) => (
                      <AppSelect
                        value={String(field.value ?? '')}
                        onSelect={(value) => {
                          field.onChange(value);
                          handleSelectItem(value);
                        }}
                        groups={DepartmentListData}
                      />
                    )}
                  />
                  {errors[`withdraw_gateway_id` as keyof RequestFormData] && (
                    <p className="text-red-500 text-sm mt-1">
                      {
                        //@ts-ignore
                        errors[`withdraw_gateway_id`]?.message
                      }
                    </p>
                  )}
                </div>
                {selectedFields.map((fieldName, index) => (
                  <div key={index}>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <span>{fieldName.replace('_', ' ')}</span>
                    </p>
                    <Input
                      {...register(`gateways.${fieldName}`)}
                      id={fieldName}
                      type="text"
                      className="app-input"
                      placeholder={`Enter ${fieldName}`}
                    />
                    {errors.gateways?.[fieldName] && (
                      <p className="text-red-500 text-sm mt-1">
                        {
                          //@ts-ignore
                          errors.gateways[fieldName]?.message
                        }
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium mb-1 flex items-center gap-2">
                  <span>Details</span>
                </p>
                <Textarea
                  id="details"
                  {...register(`details` as keyof RequestFormData)}
                  className="app-input"
                  placeholder="Entry details"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4 sticky bottom-0 w-full p-4">
            <SubmitButton UpdateData={data} IsLoading={isMethodPending} AddLabel="Add Request" />
          </Card>
        </form>
      </div>
    </>
  );
};

export default CreateOrUpdateWithdrawRequestForm;
