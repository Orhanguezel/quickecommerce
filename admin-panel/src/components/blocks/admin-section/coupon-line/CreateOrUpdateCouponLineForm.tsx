'use client';
import { AppSelect } from '@/components/blocks/common';
import { SubmitButton } from '@/components/blocks/shared';
import { Input } from '@/components/ui';
import {
  useCouponLineStoreMutation,
  useCouponLineUpdateMutation,
} from '@/modules/admin-section/coupon-line/coupon-line.action';
import {
  CouponLineFormData,
  couponLineSchema,
} from '@/modules/admin-section/coupon-line/coupon-line.schema';
import { useCustomerQuery } from '@/modules/common/customer/customer.action';
import { useAppDispatch, useAppSelector } from '@/redux/hooks/index';
import { setRefetch } from '@/redux/slices/refetchSlice';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import CustomSingleDatePicker from '../../common/CustomSingleDatePicker';
import { format, parse } from 'date-fns';
const DiscountTypeList = [
  { label: 'Percent (%)', value: 'percentage' },
  { label: 'Fixed ($)', value: 'amount' },
];

const CreateOrUpdateCouponLineForm = ({ data }: any) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const couponId = useAppSelector((state) => state.coupon.couponId);
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const {
    watch,
    control,
    setValue,
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<CouponLineFormData>({
    resolver: zodResolver(couponLineSchema),
  });
  const checkedValue = watch();
  const { customerList } = useCustomerQuery({});
  const customerData = (customerList as any) || [];
  useEffect(() => {
    if (data) {
      const customerValue = data?.customer !== null ? data?.customer.value : undefined;
      setValue('customer_id', customerValue);
      setValue('max_discount', data.max_discount ?? 0);
      setValue('usage_limit', data.usage_limit ?? 0);
      setValue('min_order_value', data.min_order_value ?? 0);
      setValue('discount', data.discount ?? 0);
      setValue('discount_type', data.discount_type ?? '');
      setValue('start_date', data.start_date.split(' ')[0] ?? '');
      setValue('end_date', data.end_date.split(' ')[0] ?? '');
    }
  }, [data, setValue]);

  const handleSelectItem = (value: any, inputType: any) => {
    setValue(inputType as any, value);
  };

  const { mutate: couponLineStore, isPending } = useCouponLineStoreMutation();
  const { mutate: couponLineUpdate, isPending: isUpdating } = useCouponLineUpdateMutation();
  const onSubmit = async (values: CouponLineFormData) => {
    const couponID = data?.coupon !== null && data?.coupon.id;
    const formattedData = {
      ...values,
      id: data?.id ? data?.id : '',
      coupon_id: data ? couponID : couponId,
      start_date: new Date(values.start_date).toISOString().slice(0, 19).replace('T', ' '),
      end_date: new Date(values.end_date).toISOString().slice(0, 19).replace('T', ' '),
    };
    const submissionData = {
      ...formattedData,
    };
    return data
      ? couponLineUpdate(
          { ...(submissionData as any) },
          {
            onSuccess: () => {
              reset();
              dispatch(setRefetch(true));
            },
          },
        )
      : couponLineStore(
          { ...(submissionData as any) },
          {
            onSuccess: () => {
              reset();
              dispatch(setRefetch(true));
            },
          },
        );
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="">
            <p className="text-sm font-medium mb-1">{t('label.customer')} </p>
            <Controller
              control={control}
              name="customer_id"
              defaultValue={data?.customer?.value || undefined}
              render={({ field }) => (
                <>
                  <AppSelect
                    disabled={!customerData}
                    value={String(field.value ?? '')}
                    onSelect={(value) => {
                      const numericValue = Number(value);
                      field.onChange(numericValue);
                      handleSelectItem(numericValue, 'customer_id');
                    }}
                    groups={customerData}
                  />
                </>
              )}
            />
          </div>
          <div>
            <p className="text-sm font-medium mb-1">{t('label.min_order')}</p>
            <Input
              type="number"
              id="min_order_value"
              {...register('min_order_value' as keyof CouponLineFormData, {
                valueAsNumber: true,
              })}
              className="app-input"
              placeholder={t('place_holder.enter_min_order')}
            />
          </div>
          <div>
            <p className="text-sm font-medium mb-1">{t('label.discount_type')}</p>
            <Controller
              control={control}
              name="discount_type"
              defaultValue={data?.discount_type || ''}
              render={({ field }) => (
                <AppSelect
                  value={field.value || ''}
                  onSelect={(value) => {
                    field.onChange(value);
                    handleSelectItem(value, 'discount_type');
                  }}
                  groups={DiscountTypeList}
                />
              )}
            />
            {errors['discount_type' as keyof CouponLineFormData] && (
              <p className="text-red-500 text-sm mt-1">{errors['discount_type']?.message}</p>
            )}
          </div>

          <div className="">
            <p className="text-sm font-medium mb-1">
              {t('label.discount')}{' '}
              {checkedValue.discount_type
                ? `( ${checkedValue.discount_type === 'percentage' ? '%' : '$'} )`
                : ''}
            </p>
            <Input
              type="number"
              id="discount"
              disabled={checkedValue.discount_type === ''}
              {...register('discount' as keyof CouponLineFormData, {
                required: 'Discount is required',
                valueAsNumber: true,
                validate: (value) => {
                  const numericValue = Number(value);
                  if (checkedValue.discount_type === 'percentage' && numericValue > 100) {
                    return 'Percent discount cannot exceed 100';
                  }
                  return true;
                },
              })}
              className="app-input"
              placeholder={t('place_holder.enter_discount')}
              onChange={(e) => {
                const value = e.target.value;
                const numericValue = Number(value);
                if (checkedValue.discount_type === 'percentage' && numericValue > 100) {
                  e.target.value = '100';
                }
                register('discount' as keyof CouponLineFormData).onChange(e);
              }}
            />
            {errors['discount' as keyof CouponLineFormData] && (
              <p className="text-red-500 text-sm mt-1">{errors['discount']?.message}</p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium mb-1">{t('label.max_discount')}</p>
            <Input
              type="number"
              id="max_discount"
              {...register('max_discount' as keyof CouponLineFormData, {
                valueAsNumber: true,
              })}
              className="app-input"
              placeholder={t('place_holder.enter_max_discount')}
            />
          </div>
          <div>
            <p className="text-sm font-medium mb-1">{t('label.usage_limit')}</p>
            <Input
              type="number"
              id="usage_limit"
              {...register('usage_limit' as keyof CouponLineFormData, {
                valueAsNumber: true,
              })}
              className="app-input"
              placeholder={t('place_holder.enter_usage_limit')}
            />
          </div>
          <div className="">
            <p className="text-sm font-medium mb-1">{t('label.start_date')}</p>
            <Controller
              name="start_date"
              control={control}
              render={({ field }) => (
                <CustomSingleDatePicker
                  label=""
                  selectedDate={field.value ? parse(field.value, 'yyyy-MM-dd', new Date()) : null}
                  onChange={(date) => {
                    if (date) {
                      field.onChange(format(date, 'yyyy-MM-dd'));
                    } else {
                      field.onChange('');
                    }
                  }}
                />
              )}
            />
            {errors.start_date && (
              <p className="text-red-500 text-sm mt-1">{errors.start_date.message}</p>
            )}
          </div>
          <div className="">
            <p className="text-sm font-medium mb-1">{t('label.end_date')}</p>
            <Controller
              name="end_date"
              control={control}
              render={({ field }) => (
                <CustomSingleDatePicker
                  label=""
                  selectedDate={field.value ? parse(field.value, 'yyyy-MM-dd', new Date()) : null}
                  onChange={(date) => {
                    if (date) {
                      field.onChange(format(date, 'yyyy-MM-dd'));
                    } else {
                      field.onChange('');
                    }
                  }}
                />
              )}
            />
            {errors.end_date && (
              <p className="text-red-500 text-sm mt-1">{errors.end_date.message}</p>
            )}
          </div>
        </div>

        <div className="col-span-2 mt-10">
          <SubmitButton
            UpdateData={data}
            IsLoading={isPending || isUpdating}
            AddLabel={t('button.add_coupon_line')}
            UpdateLabel={t('button.update_coupon_line')}
          />
        </div>
      </form>
    </div>
  );
};
export default CreateOrUpdateCouponLineForm;
