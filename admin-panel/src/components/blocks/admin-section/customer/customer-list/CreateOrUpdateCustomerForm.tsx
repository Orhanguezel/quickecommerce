'use client';
import { AppSelect } from '@/components/blocks/common';
import { SubmitButton } from '@/components/blocks/shared';
import CustomSingleDatePicker from '@/components/blocks/common/CustomSingleDatePicker';
import AppPhoneNumberInput from '@/components/blocks/common/AppPhoneNumberInput';
import { Card, CardContent, Input } from '@/components/ui';

import {
  useCustomerStoreMutation,
  useCustomerUpdateMutation,
} from '@/modules/admin-section/customer/customer-list/customer-list.action';
import {
  CustomerFormData,
  customerSchema,
} from '@/modules/admin-section/customer/customer-list/customer-list.schema';
import { useAppDispatch } from '@/redux/hooks';
import { setRefetch } from '@/redux/slices/refetchSlice';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parse } from 'date-fns';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const CreateOrUpdateCustomerForm = ({ data }: any) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const genderList = [
    { label: t('label.male'), value: 'male' },
    { label: t('label.female'), value: 'female' },
    { label: t('label.others'), value: 'others' },
  ];
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    control,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      gender: data?.gender ?? '',
    },
  });
  useEffect(() => {
    if (data) {
      setPhoneNumber(data?.phone ?? '');
      setValue('phone', data?.phone ?? '');
      setValue('first_name', data.first_name ?? '');
      setValue('last_name', data.last_name ?? '');
      setValue('email', data.email ?? '');
      setValue('birth_day', data.birth_day ?? '');
      setValue('gender', data.gender ?? '');
    }
  }, [data, setValue]);

  const handleSelectItem = (value: string, inputType: string) => {
    setValue(inputType as any, value);
  };

  const { mutate: DeliverymanStore, isPending: isDeliverymanStorePending } =
    useCustomerStoreMutation();
  const { mutate: DeliverymanUpdate, isPending: isDeliverymanUpdatePending } =
    useCustomerUpdateMutation();

  const onSubmit = async (values: CustomerFormData) => {
    if (!data && values?.password === '') {
      return toast.error('The Password field required.');
    }
    const defaultData: any = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone: values.phone,
      birth_day: values.birth_day,
      gender: values.gender,
    };
    if (!data) {
      defaultData.password = values.password;
    }

    const submissionData = {
      ...defaultData,
      customer_id: !data ? 0 : data.id,
    };
    if (data) {
      return DeliverymanUpdate(
        { ...(submissionData as any) },
        {
          onSuccess: () => {
            reset();
            dispatch(setRefetch(true));
          },
        },
      );
    } else {
      return DeliverymanStore(
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
      <div dir={dir}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <div className="grid lg:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">{t('label.first_name')}</p>
                  <Input
                    id="first_name"
                    {...register('first_name' as keyof CustomerFormData)}
                    className="app-input"
                    placeholder={t('place_holder.enter_first_name')}
                  />
                  {errors['first_name' as keyof CustomerFormData] && (
                    <p className="text-red-500 text-sm mt-1">{errors['first_name']?.message}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">{t('label.last_name')}</p>
                  <Input
                    id="last_name"
                    {...register('last_name' as keyof CustomerFormData)}
                    className="app-input"
                    placeholder={t('place_holder.enter_last_name')}
                  />
                  {errors['last_name' as keyof CustomerFormData] && (
                    <p className="text-red-500 text-sm mt-1">{errors['last_name']?.message}</p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">{t('label.email')}</p>
                  <Input
                    id="email"
                    {...register('email' as keyof CustomerFormData)}
                    className="app-input"
                    placeholder={t('place_holder.enter_email')}
                  />
                  {errors['email' as keyof CustomerFormData] && (
                    <p className="text-red-500 text-sm mt-1">{errors['email']?.message}</p>
                  )}
                </div>
                {!data && (
                  <div>
                    <p className="text-sm font-medium mb-1">{t('label.password')}</p>
                    <div className="relative flex flex-col items-start justify-start w-full">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        {...register('password' as keyof CustomerFormData)}
                        className="app-input"
                        placeholder={t('place_holder.enter_password')}
                      />
                      {showPassword ? (
                        <div className="absolute right-4 top-2 cursor-pointer">
                          <Eye
                            className="text-gray-500 dark:text-white w-5"
                            onClick={() => setShowPassword(!showPassword)}
                          />
                        </div>
                      ) : (
                        <div className="absolute right-4 top-2 cursor-pointer">
                          <EyeOff
                            className="text-gray-500 dark:text-white w-5"
                            onClick={() => setShowPassword(!showPassword)}
                          />
                        </div>
                      )}
                    </div>
                    {errors['password' as keyof CustomerFormData] && (
                      <p className="text-red-500 text-sm mt-1">{errors['password']?.message}</p>
                    )}
                  </div>
                )}
                <div className="mr-3">
                  <p className="text-sm font-medium mb-1">{t('label.phone')} </p>
                  <AppPhoneNumberInput
                    value={phoneNumber}
                    onChange={(value) => {
                      setPhoneNumber(value);
                      setValue('phone', value);
                    }}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone?.message}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">{t('label.gender')}</p>
                  <Controller
                    control={control}
                    name="gender"
                    render={({ field }) => (
                      <AppSelect
                        value={String(field.value ?? '')}
                        onSelect={(value) => {
                          field.onChange(value);
                          handleSelectItem(value, 'gender');
                        }}
                        groups={genderList}
                        hideNone
                      />
                    )}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">{t('label.date_of_birth')}</p>
                  <Controller
                    name="birth_day"
                    control={control}
                    render={({ field }) => (
                      <CustomSingleDatePicker
                        label=""
                        selectedDate={
                          field.value ? parse(field.value, 'yyyy-MM-dd', new Date()) : null
                        }
                        onChange={(date) => {
                          if (date) {
                            field.onChange(format(date, 'yyyy-MM-dd'));
                          } else {
                            field.onChange('');
                          }
                        }}
                        maxDate={new Date()}
                      />
                    )}
                  />
                  {errors.birth_day && (
                    <p className="text-red-500 text-sm mt-1">{errors.birth_day.message}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 ">
                <SubmitButton
                  UpdateData={data}
                  IsLoading={data ? isDeliverymanUpdatePending : isDeliverymanStorePending}
                  AddLabel={t('button.add')}
                  UpdateLabel={t('button.update')}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </>
  );
};

export default CreateOrUpdateCustomerForm;
