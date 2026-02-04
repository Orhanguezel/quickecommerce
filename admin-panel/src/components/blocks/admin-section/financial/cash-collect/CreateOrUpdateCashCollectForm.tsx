'use client';
import { AppSelect } from '@/components/blocks/common';
import { SubmitButton } from '@/components/blocks/shared';
import { Card, CardContent, Input } from '@/components/ui';
import { useCashCollectStoreMutation } from '@/modules/admin-section/financial/cash-collect/cash-collect.action';
import {
  CashCollectFormData,
  cashCollectSchema,
} from '@/modules/admin-section/financial/cash-collect/cash-collect.schema';
import { useMethodUpdateMutation } from '@/modules/admin-section/financial/withdraw/method/method.action';
import { useDeliverymanListQuery } from '@/modules/admin-section/orders/orders.action';

import { useAppDispatch } from '@/redux/hooks';
import { setRefetch } from '@/redux/slices/refetchSlice';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const CreateOrUpdateCashCollectForm = ({ data, ID }: any) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const editData = data?.data;
  const { register, handleSubmit, setValue, watch, reset, control } = useForm<CashCollectFormData>({
    resolver: zodResolver(cashCollectSchema),
  });

  const { DeliverymanList } = useDeliverymanListQuery({ search: '' });
  const deliveryman = (DeliverymanList as any)?.data || [];

  const handleSelectItem = (value: string, inputType: string) => {
    setValue(inputType as any, value);
  };

  const { mutate: methodStore, isPending: isMethodPending } = useCashCollectStoreMutation();
  const { mutate: methodUpdate, isPending: isMethodUpdating } = useMethodUpdateMutation();

  const onSubmit = async (values: CashCollectFormData) => {
    if (values?.order_id === '') {
      return toast.error('Please Input Order No!');
    }
    if (values?.deliveryman_id === '' || values?.deliveryman_id == undefined) {
      return toast.error('Please Select Delivery man!');
    }
    if (values?.activity_value === '') {
      return toast.error('Please Input amount!');
    }

    const submissionData = {
      ...values,
      id: !data ? 0 : editData.id,
    };

    if (data) {
      return methodUpdate(
        { ...(submissionData as any) },
        {
          onSuccess: () => {
            reset();
            dispatch(setRefetch(true));
          },
        },
      );
    } else {
      return methodStore(
        { ...(submissionData as any) },
        {
          onSuccess: () => {
            reset();
            dispatch(setRefetch(true));
          },
        },
      );
    }
  };

  return (
    <>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="w-full flex items-center justify-center mt-4">
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2 md:p-6 w-full">
              <div>
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <span>{t('label.order_no')}</span>
                  </p>
                  <Input
                    id="order_id"
                    type="text"
                    defaultValue={editData?.order_id ? editData?.order_id : ''}
                    {...register(`order_id` as keyof CashCollectFormData)}
                    className="app-input"
                    placeholder={t('place_holder.enter_order_no')}
                  />
                </div>
              </div>
              <div>
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <span>{t('label.amount')}</span>
                  </p>
                  <Input
                    id="activity_value"
                    type="number"
                    min={0}
                    defaultValue={editData?.activity_value ? editData?.activity_value : ''}
                    {...register(`activity_value` as keyof CashCollectFormData)}
                    className="app-input"
                    placeholder={t('place_holder.enter_amount')}
                  />
                </div>
              </div>
              <div>
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <span>{t('label.reference')}</span>
                  </p>
                  <Input
                    id="reference"
                    type="text"
                    defaultValue={editData?.reference ? editData?.reference : ''}
                    {...register(`reference` as keyof CashCollectFormData)}
                    className="app-input"
                    placeholder={t('place_holder.enter_reference')}
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">{t('label.deliveryman')}</p>
                <Controller
                  control={control}
                  name="deliveryman_id"
                  render={({ field }) => (
                    <AppSelect
                      value={field.value || ''}
                      onSelect={(value) => {
                        field.onChange(value);
                        handleSelectItem(value, 'deliveryman_id');
                      }}
                      groups={deliveryman}
                      hideNone
                    />
                  )}
                />
              </div>
              <div className="mt-4 ">
                <SubmitButton
                  UpdateData={data}
                  IsLoading={isMethodPending || isMethodUpdating}
                  AddLabel={t('button.add_cash')}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </>
  );
};

export default CreateOrUpdateCashCollectForm;
