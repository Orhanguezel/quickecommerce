'use client';
import CloudIcon from '@/assets/icons/CloudIcon';
import { AppSelect } from '@/components/blocks/common';
import { SubmitButton } from '@/components/blocks/shared';
import AppPhoneNumberInput from '@/components/blocks/common/AppPhoneNumberInput';
import Cancel from '@/components/blocks/custom-icons/Cancel';
import PhotoUploadModal, { type UploadedImage } from '@/components/blocks/shared/PhotoUploadModal';
import {
  Card,
  CardContent,
  Input,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import GlobalImageLoader from '@/lib/imageLoader';
import {
  useDeliverymanStoreMutation,
  useDeliverymanUpdateMutation,
} from '@/modules/admin-section/deliveryman/deliveryman.action';
import {
  DeliverymanFormData,
  deliverymanSchema,
} from '@/modules/admin-section/deliveryman/deliveryman.schema';
import { useVehicleTypeDropdownQuery } from '@/modules/admin-section/vehicle-type/vehicle-type.action';
import { useAreaDropdownQuery } from '@/modules/common/area/area.action';
import { useAppDispatch } from '@/redux/hooks';
import { setRefetch } from '@/redux/slices/refetchSlice';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const StatusList = [
  { label: 'Active', value: '1' },
  { label: 'Inactive', value: '0' },
];
const IdentificationTypeList = [
  { label: 'NID', value: 'nid' },
  { label: 'Passport', value: 'passport' },
];

const CreateOrUpdateDeliverymanForm = ({ data }: any) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    control,
  } = useForm<DeliverymanFormData>({
    resolver: zodResolver(deliverymanSchema),
  });
  const [lastSelectedImages, setLastSelectedImages] = useState<any>(null);
  const [lastSelectedLogo, setLastSelectedLogo] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { AreaDropdownList } = useAreaDropdownQuery({});
  let AreaList = (AreaDropdownList as any) || [];
  const { VehicleTypeDropdownList } = useVehicleTypeDropdownQuery({});
  let VehicleTypeList = (VehicleTypeDropdownList as any) || [];

  useEffect(() => {
    if (data) {
      setValue('first_name', data?.first_name ?? '');
      setValue('last_name', data?.last_name ?? '');
      setValue('email', data?.email ?? '');
      setValue('password', data?.password ?? '');
      setValue('phone', data?.phone ?? '');
      setValue('address', data?.address ?? '');
      setValue('identification_type', data?.identification_type ?? '');
      setValue('identification_number', String(data?.identification_number) ?? '');
      setValue('status', String(data?.status) ?? '');
      setValue('vehicle_type_id', String(data?.vehicle_type_id) ?? '');
      setValue('area_id', String(data?.area_id) ?? '');

      setPhoneNumber(data?.phone ?? '');
      setLastSelectedImages({
        image_id: data?.identification_photo_front ? data?.identification_photo_front : '',
        img_url: data?.identification_photo_front_url ? data?.identification_photo_front_url : null,
        name: 'identification_photo_front',
      });

      setLastSelectedLogo({
        image_id: data?.identification_photo_back ? data?.identification_photo_back : '',
        img_url: data?.identification_photo_back_url ? data?.identification_photo_back_url : null,
        name: 'identification_photo_back',
      });
    }
  }, [data, setValue]);

  const handleSelectItem = (value: string, inputType: string) => {
    setValue(inputType as any, value);
  };

  const handleSaveImages = (images: UploadedImage[]) => {
    setLastSelectedImages(images[0]);
  };

  const removePreview = () => {
    setLastSelectedImages(null);
  };

  const handleSaveLogo = (images: UploadedImage[]) => {
    setLastSelectedLogo(images[0]);
  };

  const removeLogo = () => {
    setLastSelectedLogo(null);
  };

  const { mutate: DeliverymanStore, isPending: isDeliverymanStorePending } =
    useDeliverymanStoreMutation();
  const { mutate: DeliverymanUpdate, isPending: isDeliverymanUpdatePending } =
    useDeliverymanUpdateMutation();

  const onSubmit = async (values: DeliverymanFormData) => {
    if (!data && values?.password === '') {
      return toast.error('The Password field required.');
    }

    if (values?.status === 'none' || values?.status === 'undefined') {
      return toast.error('Please Select Status !');
    }
    if (
      values?.area_id === 'none' ||
      values?.area_id === 'undefined' ||
      values?.area_id === 'null'
    ) {
      return toast.error('Please Select Area !');
    }
    if (
      values?.identification_type === '' ||
      values?.identification_type === 'none' ||
      values?.identification_type === 'undefined' ||
      values?.identification_type === 'null'
    ) {
      return toast.error('Please Select identification type !');
    }

    const defaultData: any = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone: values.phone,
      address: values.address,
      identification_type: values.identification_type,
      identification_number: values.identification_number,
      status: values.status,
      area_id: values.area_id,
      vehicle_type_id: values.vehicle_type_id,
    };
    if (!data) {
      defaultData.password = values.password;
    }

    const submissionData = {
      ...defaultData,
      user_id: !data ? 0 : data.user_id,
      identification_photo_front: lastSelectedImages ? lastSelectedImages?.image_id : '',
      identification_photo_back: lastSelectedLogo ? lastSelectedLogo?.image_id : '',
    };

    if (data) {
      return DeliverymanUpdate(
        { ...(submissionData as any) },
        {
          onSuccess: () => {
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

  const trigger = (
    <div className="hover:cursor-pointer">
      {lastSelectedImages?.img_url ? (
        <div className="relative w-32 h-32 group">
          <Image
            loader={GlobalImageLoader}
            src={lastSelectedImages?.img_url}
            alt={lastSelectedImages?.name as string}
            fill
            sizes="128px"
            className="w-full h-full border dark:border-gray-500 rounded"
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-sm font-bold text-red-500 p-1">{t('common.change_image')}</p>
          </div>
        </div>
      ) : (
        <div className="border-2 w-32 h-32 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center p-2">
          <div className="flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="mt-4 text-blue-500 text-sm font-medium p-1">
              {t('common.drag_and_drop')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
  const triggerLogo = (
    <div className="hover:cursor-pointer">
      {lastSelectedLogo?.img_url ? (
        <div className="relative w-32 h-32 group">
          <Image
            loader={GlobalImageLoader}
            src={lastSelectedLogo?.img_url}
            alt={lastSelectedLogo?.name as string}
            fill
            sizes="128px"
            className="w-full h-full border dark:border-gray-500 rounded"
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-sm font-bold text-red-500 p-1">{t('common.change_image')}</p>
          </div>
        </div>
      ) : (
        <div className=" w-32 h-32 border-2 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center p-2">
          <div className="flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="mt-4 text-blue-500 text-sm font-medium p-1">
              {t('common.drag_and_drop')}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <h1 className="text-lg md:text-2xl font-medium mb-4">
                {t('label.basic_information')}
              </h1>

              <div className="grid lg:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">{t('label.first_name')}</p>
                  <Input
                    defaultValue={data?.first_name ?? ''}
                    id="first_name"
                    {...register('first_name' as keyof DeliverymanFormData)}
                    className="app-input"
                    placeholder={t('place_holder.enter_first_name')}
                  />
                  {errors['first_name' as keyof DeliverymanFormData] && (
                    <p className="text-red-500 text-sm mt-1">{errors['first_name']?.message}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">{t('label.last_name')}</p>
                  <Input
                    defaultValue={data?.last_name ?? ''}
                    id="last_name"
                    {...register('last_name' as keyof DeliverymanFormData)}
                    className="app-input"
                    placeholder={t('place_holder.enter_last_name')}
                  />
                  {errors['last_name' as keyof DeliverymanFormData] && (
                    <p className="text-red-500 text-sm mt-1">{errors['last_name']?.message}</p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">{t('label.email')}</p>
                  <Input
                    id="email"
                    defaultValue={data?.email ?? ''}
                    {...register('email' as keyof DeliverymanFormData)}
                    className="app-input"
                    placeholder={t('place_holder.enter_email')}
                  />
                  {errors['email' as keyof DeliverymanFormData] && (
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
                        defaultValue={data?.password ?? ''}
                        {...register('password' as keyof DeliverymanFormData)}
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
                    {errors['password' as keyof DeliverymanFormData] && (
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
                  <p className="text-sm font-medium mb-1">{t('label.address')}</p>
                  <Input
                    type="text"
                    defaultValue={data?.address ?? ''}
                    id="address"
                    {...register('address' as keyof DeliverymanFormData)}
                    className="app-input"
                    placeholder={t('place_holder.enter_address')}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1"> {t('label.status')}</p>
                  <Controller
                    control={control}
                    name="status"
                    defaultValue={String(data?.status) ?? ''}
                    render={({ field }) => (
                      <AppSelect
                        value={String(field.value ?? '')}
                        onSelect={(value) => {
                          field.onChange(value);
                          handleSelectItem(value, 'status');
                        }}
                        groups={StatusList}
                        hideNone
                      />
                    )}
                  />
                  {errors['status' as keyof DeliverymanFormData] && (
                    <p className="text-red-500 text-sm mt-1">{errors['status']?.message}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium mb-1"> {t('label.vehicle_type')}</p>
                  <Controller
                    control={control}
                    name="vehicle_type_id"
                    defaultValue={String(data?.vehicle_type_id) ?? ''}
                    render={({ field }) => (
                      <AppSelect
                        value={String(field.value ?? '')}
                        onSelect={(value) => {
                          field.onChange(value);
                          handleSelectItem(value, 'vehicle_type_id');
                        }}
                        groups={VehicleTypeList}
                        hideNone
                      />
                    )}
                  />
                  {errors['vehicle_type_id' as keyof DeliverymanFormData] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors['vehicle_type_id']?.message}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium mb-1"> {t('label.area')}</p>
                  <Controller
                    control={control}
                    name="area_id"
                    defaultValue={String(data?.area_id) ?? ''}
                    render={({ field }) => (
                      <AppSelect
                        value={String(field.value ?? '')}
                        onSelect={(value) => {
                          field.onChange(value);
                          handleSelectItem(value, 'area_id');
                        }}
                        groups={AreaList}
                        hideNone
                      />
                    )}
                  />
                  {errors['area_id' as keyof DeliverymanFormData] && (
                    <p className="text-red-500 text-sm mt-1">{errors['area_id']?.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <h1 className="text-lg md:text-2xl font-medium mb-4">{t('label.identification')}</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">{t('label.identification_type')}</p>
                    <Controller
                      control={control}
                      name="identification_type"
                      defaultValue={data?.identification_type ?? ''}
                      render={({ field }) => (
                        <AppSelect
                          value={String(field.value ?? '')}
                          onSelect={(value) => {
                            field.onChange(value);
                            handleSelectItem(value, 'identification_type');
                          }}
                          groups={IdentificationTypeList}
                        />
                      )}
                    />
                    {errors['identification_type' as keyof DeliverymanFormData] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors['identification_type']?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">{t('label.identification_no')}</p>
                    <Input
                      type="text"
                      id="identification_number"
                      defaultValue={data?.identification_number ?? ''}
                      {...register('identification_number' as keyof DeliverymanFormData)}
                      className="app-input"
                      placeholder={t('place_holder.enter_identification_number')}
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-start gap-4 mt-[-8px]">
                  <div className="">
                    <div className="text-sm font-medium flex items-center gap-2 mb-2">
                      <span> {t('label.front_photo')}</span>
                      <div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-custom-dark-blue w-96">
                              <p className="p-1 text-sm font-medium">
                                {t('tooltip.aspect_ratio_1_1')}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    <div className="relative flex align-start gap-4 w-full">
                      <div className="relative w-32">
                        <PhotoUploadModal
                          trigger={trigger}
                          isMultiple={false}
                          onSave={handleSaveImages}
                          usageType="deliveryman"
                          selectedImage={lastSelectedImages}
                        />
                        {lastSelectedImages?.image_id && (
                          <Cancel
                            customClass="absolute top-0 right-0 m-1"
                            onClick={(event: { stopPropagation: () => void }) => {
                              event.stopPropagation();
                              removePreview();
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="">
                    <div className="text-sm font-medium flex items-center gap-2 mb-2">
                      <span>{t('label.back_photo')}</span>
                      <div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-custom-dark-blue w-96">
                              <p className="p-1 text-sm font-medium">
                                {t('tooltip.aspect_ratio_1_1')}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    <div className="relative flex align-start gap-4">
                      <div className="relative w-32">
                        <PhotoUploadModal
                          trigger={triggerLogo}
                          isMultiple={false}
                          onSave={handleSaveLogo}
                          usageType="deliveryman"
                          selectedImage={lastSelectedLogo}
                        />
                        {lastSelectedLogo?.image_id && (
                          <Cancel
                            customClass="absolute top-0 right-0 m-1"
                            onClick={(event: { stopPropagation: () => void }) => {
                              event.stopPropagation();
                              removeLogo();
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4 sticky bottom-0 w-full p-4">
            <SubmitButton
              UpdateData={data}
              IsLoading={data ? isDeliverymanUpdatePending : isDeliverymanStorePending}
              AddLabel={t('button.add_deliveryman')}
              UpdateLabel={t('button.update_deliveryman')}
            />
          </Card>
        </form>
      </div>
    </>
  );
};

export default CreateOrUpdateDeliverymanForm;
