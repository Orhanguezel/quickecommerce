'use client';
import CarIcon from '@/assets/icons/CarIcon';
import StoreIcon from '@/assets/icons/StoreIcon';
import { Skeleton } from '@/components/ui/skeleton';
import { AppSelect } from '@/components/blocks/common';
import { SubmitButton } from '@/components/blocks/shared';
import { Card, CardContent, Input } from '@/components/ui';
import { useAreaSettingsUpdateMutation } from '@/modules/admin-section/business-operations/area-settings/area-settings.action';
import {
  AreaSettingsFormData,
  areaSettingsSchema,
} from '@/modules/admin-section/business-operations/area-settings/area-settings.schema';
import { useStoreTypeQuery } from '@/modules/common/store-type/store-type.action';
import { useAppDispatch } from '@/redux/hooks';
import { setRefetch } from '@/redux/slices/refetchSlice';
import { zodResolver } from '@hookform/resolvers/zod';
import { NotebookPen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import StoreTypeCard from './components/StoreTypeCard';
import { useCurrencyQuery } from '@/modules/common/com/com.action';

const UpdateAreaSettingsForm = ({ data, ID }: any) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const ChargeMethodList = [
    { label: t('common.fixed'), value: 'fixed' },
    { label: t('common.per_km'), value: 'per_km' },
    { label: t('common.range_wise'), value: 'range_wise' },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    control,
  } = useForm<AreaSettingsFormData>({
    resolver: zodResolver(areaSettingsSchema),
    defaultValues: {
      delivery_charge_method: data?.delivery_charge_method ?? '',
    },
  });
  const checkedValue = watch();

  const { storeType, isPending } = useStoreTypeQuery({});
  let StoreTypeCards = (storeType as any) || [];

  const [selectedPaymentOptions, setSelectedPaymentOptions] = useState<any[]>(
    Array.isArray(data?.store_types) ? data.store_types.map((type: { id: any }) => type.id) : [],
  );
  const { currency, refetch: refetchCurrency } = useCurrencyQuery({});
  const currencyData = useMemo(() => {
    const data = (currency as any) || {};
    return data;
  }, [currency]);
  const CurrencyData = currencyData.currencies_info;
  const currencySymbol = CurrencyData?.com_site_global_currency == 'USD' ? '$' : '';

  useEffect(() => {
    if (data) {
      setValue('delivery_charge_method', String(data?.delivery_charge_method) ?? '');
      setValue('out_of_area_delivery_charge', String(data?.out_of_area_delivery_charge) ?? '');
      setValue('min_order_delivery_fee', String(data?.min_order_delivery_fee) ?? '');
      setValue('delivery_time_per_km', String(data?.delivery_time_per_km) ?? '');
      setValue('per_km_charge_amount', String(data?.per_km_charge_amount) ?? '');
      setValue('fixed_charge_amount', String(data?.fixed_charge_amount) ?? '');
      let selectedStoreType = data?.store_types?.map((type: { id: any }) => type.id);
      setSelectedPaymentOptions(selectedStoreType);
    }
  }, [data, setValue]);

  const handleCardClick = (id: string) => {
    setSelectedPaymentOptions((prev = []) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectItem = async (value: string, inputType: string) => {
    setValue(inputType as any, value);
  };
  const [attributeValues, setAttributeValues] = useState<
    { min_km: string; max_km: string; charge_amount: string }[]
  >(
    data?.charges?.length > 0
      ? data.charges.map((item: any) =>
          typeof item === 'object'
            ? {
                min_km: item.min_km || '',
                max_km: item.max_km || '',
                charge_amount: item.charge_amount || '',
              }
            : { min_km: '', max_km: '', charge_amount: '' },
        )
      : [{ min_km: '', max_km: '', charge_amount: '' }],
  );

  const handleAddAttributeValue = () => {
    setAttributeValues([...attributeValues, { min_km: '', max_km: '', charge_amount: '' }]);
  };

  const handleDeleteAttributeValue = (index: number) => {
    setAttributeValues(attributeValues.filter((_, i) => i !== index));
  };

  const handleChangeAttributeValue = (
    index: number,
    field: 'min_km' | 'max_km' | 'charge_amount',
    value: string,
  ) => {
    const updatedValues = [...attributeValues];
    updatedValues[index][field] = value;
    setAttributeValues(updatedValues);
  };

  const { mutate: StoreTypeUpdate, isPending: isStoreTypeUpdatePending } =
    useAreaSettingsUpdateMutation();
  const onSubmit = async (values: AreaSettingsFormData) => {
    const convertedData = attributeValues.map((item) => ({
      min_km: item.min_km ? Number(item.min_km) : '',
      max_km: item.max_km ? Number(item.max_km) : '',
      charge_amount: item.charge_amount ? Number(item.charge_amount) : '',
    }));
    const invalidEntry = convertedData.find((item) => item.min_km > item.max_km);

    if (invalidEntry) {
      toast.error('Minimum KM cannot be greater than Maximum KM.');
      return;
    }
    const invalidCharge = convertedData.find(
      (item) => item.charge_amount == 0 || item.charge_amount == '',
    );
    if (checkedValue?.delivery_charge_method === 'range_wise' && invalidCharge) {
      toast.error('Charge amount is required and cannot be zero or empty.');
      return;
    }
    const defaultData: any = {
      delivery_time_per_km: Number(values.delivery_time_per_km),
      min_order_delivery_fee: Number(values.min_order_delivery_fee),
      out_of_area_delivery_charge: Number(values.out_of_area_delivery_charge),
      per_km_charge_amount: Number(values.per_km_charge_amount),
      fixed_charge_amount: Number(values.fixed_charge_amount),
      delivery_charge_method: values.delivery_charge_method,
      store_type_ids: selectedPaymentOptions,
      store_area_id: ID,
    };

    if (checkedValue?.delivery_charge_method === 'range_wise') {
      defaultData.charges = convertedData;
    }

    const submissionData = {
      ...defaultData,
      id: !data ? 0 : data.id,
    };

    if (data) {
      return StoreTypeUpdate(
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
            <CardContent className="p-2 md:p-6 w-full">
              <div className="mb-6">
                <h2 className="flex items-center gap-2 text-md font-semibold mb-8">
                  <StoreIcon /> {t('label.store_type')}
                </h2>
                <div className="my-2 text-red-500 flex items-start">
                  <p className="mt-0.5">
                    {' '}
                    <NotebookPen width={16} height={16} />
                  </p>{' '}
                  <p className="px-1 text-sm font-semibold">: {t('common.area_settings_note')}</p>
                </div>
              </div>
              {isPending ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Card key={i}>
                          <CardContent className="flex items-center justify-between p-2">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <div className="text-end">
                              <Skeleton className="h-4 w-24 mb-1" />
                              <Skeleton className="h-6 w-20" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-8">
                  {StoreTypeCards?.map(
                    (option: { id: string; image_url: unknown; label: string; slug: string }) => (
                      <StoreTypeCard
                        key={option.id}
                        isSelected={selectedPaymentOptions?.includes(option.id)}
                        onClick={() => handleCardClick(option.id)}
                        imageSrc={option?.image_url}
                        title={option.label}
                      />
                    ),
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <div className="mb-6">
                <h2 className="flex items-center gap-2 text-md font-semibold">
                  <CarIcon /> {t('label.delivery_charge')}
                </h2>
              </div>
              <div dir={dir} className="space-y-4">
                <div className="grid grid-cols-1 xl:grid-cols-3  gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1 flex items-center gap-2">
                      <span>{t('label.estimated_travel_time')}</span>
                    </p>
                    <Input
                      id="delivery_time_per_km"
                      type="number"
                      min={0}
                      {...register(`delivery_time_per_km` as keyof AreaSettingsFormData)}
                      className="app-input"
                      placeholder={t('place_holder.enter_delivery_time_per_km')}
                    />
                    {errors[`delivery_time_per_km` as keyof AreaSettingsFormData] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`delivery_time_per_km`]?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1 flex items-center gap-2">
                      <span>
                        {t('label.minimum_amount_fee_for_delivery')} ({currencySymbol})
                      </span>
                    </p>
                    <Input
                      id="min_order_delivery_fee"
                      type="number"
                      min={0}
                      {...register(`min_order_delivery_fee` as keyof AreaSettingsFormData)}
                      className="app-input"
                      placeholder={t('place_holder.enter_min_order_delivery_fee')}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1 flex items-center gap-2">
                      <span>
                        {t('label.out_of_area_delivery_charges')} ({currencySymbol})
                      </span>
                    </p>
                    <Input
                      id="min_order_delivery_fee"
                      type="number"
                      min={0}
                      {...register(`out_of_area_delivery_charge` as keyof AreaSettingsFormData)}
                      className="app-input"
                      placeholder={t('place_holder.enter_out_of_area_delivery_charge')}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-0 xl:gap-4">
                  <div className="w-full xl:w-auto mb-4 xl:mb-0">
                    <p className="text-sm font-medium mb-1">{t('label.delivery_pricing')}</p>
                    <Controller
                      control={control}
                      name="delivery_charge_method"
                      defaultValue={
                        data?.delivery_charge_method ? data?.delivery_charge_method : ''
                      }
                      render={({ field }) => (
                        <>
                          <AppSelect
                            value={field.value || ''}
                            onSelect={(value) => {
                              field.onChange(value);
                              handleSelectItem(value, 'delivery_charge_method');
                            }}
                            groups={ChargeMethodList}
                          />
                        </>
                      )}
                    />
                  </div>
                  {checkedValue?.delivery_charge_method === 'range_wise' && (
                    <Card className="col-span-2">
                      <CardContent className="p-2 md:p-6">
                        <div className="text-sm font-semibold mb-2 flex items-center justify-between ">
                          <span>
                            {t('label.range_based_delivery_charge')} ({currencySymbol})
                          </span>
                          <span
                            onClick={handleAddAttributeValue}
                            className="flex items-center cursor-pointer bg-blue-50 border border-blue-500 text-blue-500 text-sm font-bold shadow-2xl p-2 py-1 md:py-2 rounded hover:bg-blue-500 hover:text-white"
                          >
                            <span className="flex md:hidden"> + </span>
                            <span className="hidden md:flex">{t('button.add_more')}</span>
                          </span>
                        </div>
                        <div className="max-h-[300px] overflow-x-auto custom-scrollbar">
                          {attributeValues.map((value, index) => (
                            <div
                              key={index}
                              className="my-4 flex items-end w-full gap-4 border-b md:border-none border-slate-300 py-4 md:py-0"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-2 ">
                                <div>
                                  <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                                    {t('label.from_range')}
                                  </p>
                                  <Input
                                    type="number"
                                    value={value.min_km}
                                    onChange={(e) =>
                                      handleChangeAttributeValue(index, 'min_km', e.target.value)
                                    }
                                    className="app-input flex-grow py-2"
                                    placeholder={t('place_holder.enter_minimum_range')}
                                  />
                                </div>
                                <div>
                                  <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                                    {t('label.to_range')}
                                  </p>
                                  <Input
                                    type="number"
                                    value={value.max_km}
                                    onChange={(e) =>
                                      handleChangeAttributeValue(index, 'max_km', e.target.value)
                                    }
                                    className="app-input flex-grow py-2"
                                    placeholder={t('place_holder.enter_maximum_range')}
                                  />
                                </div>
                                <div>
                                  <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                                    {t('label.charge')} ({currencySymbol})
                                  </p>
                                  <Input
                                    type="number"
                                    value={value.charge_amount}
                                    onChange={(e) =>
                                      handleChangeAttributeValue(
                                        index,
                                        'charge_amount',
                                        e.target.value,
                                      )
                                    }
                                    className="app-input flex-grow py-2"
                                    placeholder={t('place_holder.enter_amount')}
                                  />
                                </div>
                              </div>
                              {index === 0 ? (
                                <span className="flex items-center cursor-not-allowed bg-slate-500 text-slate-300 text-sm font-bold shadow-2xl px-2 py-2.5 rounded">
                                  {t('button.default')}
                                </span>
                              ) : (
                                <span
                                  onClick={() => handleDeleteAttributeValue(index)}
                                  className="cursor-pointer bg-red-500 text-white shadow-2xl px-3 py-2 rounded"
                                >
                                  {t('button.close')}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {checkedValue?.delivery_charge_method === 'fixed' && (
                    <div>
                      <p className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>
                          {t('label.fixed_charge_amount')} ({currencySymbol})
                        </span>
                      </p>
                      <Input
                        id="fixed_charge_amount"
                        type="number"
                        min={0}
                        {...register(`fixed_charge_amount` as keyof AreaSettingsFormData)}
                        className="app-input"
                        placeholder={t('place_holder.fixed_charge_amount')}
                      />
                    </div>
                  )}
                  {checkedValue?.delivery_charge_method === 'per_km' && (
                    <div>
                      <p className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>
                          {t('label.per_km_charge_amount')} ({currencySymbol})
                        </span>
                      </p>
                      <Input
                        id="per_km_charge_amount"
                        type="number"
                        min={0}
                        {...register(`per_km_charge_amount` as keyof AreaSettingsFormData)}
                        className="app-input"
                        placeholder={t('place_holder.per_km_charge_amount')}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4 sticky bottom-0 w-full p-4">
            <SubmitButton
              UpdateData={data}
              IsLoading={isStoreTypeUpdatePending}
              UpdateLabel={t('button.update')}
            />
          </Card>
        </form>
      </div>
    </>
  );
};

export default UpdateAreaSettingsForm;
