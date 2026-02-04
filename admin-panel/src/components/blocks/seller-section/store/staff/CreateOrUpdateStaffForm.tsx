'use client';
import CloudIcon from '@/assets/icons/CloudIcon';
import Loader from '@/components/molecules/Loader';
import { SubmitButton } from '@/components/blocks/shared';
import AppPhoneNumberInput from '@/components/blocks/common/AppPhoneNumberInput';
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
import { formatLabel } from '@/lib/utils';
import { useStoreListQuery } from '@/modules/seller-section/product/product.action';
import {
  useSellerRolesQuery,
  useStaffStoreMutation,
  useStaffUpdateMutation,
} from '@/modules/seller-section/staff/staff.action';
import { StaffFormData, staffSchema } from '@/modules/seller-section/staff/staff.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Eye, EyeOff, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { toast } from 'react-toastify';
import Cancel from '@/components/blocks/custom-icons/Cancel';

const CreateOrUpdateStaffForm = ({ data }: any) => {
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const [lastSelectedImages, setLastSelectedImages] = useState<any>(null);
  const [errorImagesMessage, setImagesErrorMessage] = useState<string>('');
  const editData = data;
  const t = useTranslations();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    reset,
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
  });
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedRole, setSelectedRole] = useState(editData?.roles[0] || '');

  const { sellerRoles, isFetching } = useSellerRolesQuery({});
  const AllRolesData = useMemo(() => (sellerRoles as any)?.roles || [], [sellerRoles]);
  const rolesData = AllRolesData.filter(
    (role: { locked: number; available_for: string }) => !(role.locked === 1),
  );
  const { stores } = useStoreListQuery({});
  const storeList = useMemo(() => (stores as any)?.stores ?? [], [stores]);

  useEffect(() => {
    if (!editData) return;
    setValue('first_name', editData.first_name ?? '');
    setValue('last_name', editData.last_name ?? '');
    setValue('email', editData.email ?? '');
    setValue('phone', editData.phone ?? '');
    setPhoneNumber(data?.phone ?? '');
    setValue('password', editData.user_password ?? '');
    if (editData?.image) {
      setLastSelectedImages({
        image_id: editData?.image || '',
        img_url: editData?.image_url ?? '/images/no-image.png',
        name: 'staff image',
      });
    }

    editData.roles?.forEach((permission: any) => {
      setValue(permission, true);
    });
    setValue(
      'stores',
      editData.stores.map((store: { id: any }) => store.id),
    );
  }, [editData, setValue, data?.phone]);

  const handleSaveImages = (images: UploadedImage[]) => {
    setLastSelectedImages(images[0]);
    const dimensions = images[0].dimensions ?? '';
    const [width, height] = dimensions.split(' x ').map((dim) => parseInt(dim.trim(), 10));
    const aspectRatio = width / height;

    if (Math.abs(aspectRatio - 1 / 1) < 0.01) {
      setImagesErrorMessage('');
      return true;
    } else {
      setImagesErrorMessage('Image must have a 1:1 aspect ratio.');
      return false;
    }
  };
  const removePreview = () => {
    setLastSelectedImages(null);
    setImagesErrorMessage('');
  };

  const { mutate: staffStore, isPending } = useStaffStoreMutation();
  const { mutate: staffUpdate, isPending: isUpdating } = useStaffUpdateMutation();
  const onSubmit = async (values: StaffFormData) => {
    if (selectedRole === '') {
      return toast.error(t('toast.one_role_is_required'));
    }

    const submissionData = {
      ...values,
      id: editData?.id,
      roles: selectedRole,
      image: lastSelectedImages ? lastSelectedImages?.image_id : '',
      multipart: true,
    };
    return editData
      ? staffUpdate(
          { ...(submissionData as any) },
          {
            onSuccess: () => {
              reset();
            },
          },
        )
      : staffStore(
          { ...(submissionData as any) },
          {
            onSuccess: () => {
              reset();
            },
          },
        );
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
        <div className="border-2 w-32 h-32 border-dashed border-blue-500 p-2 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
          <div className="flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="mt-4 text-blue-500 text-sm font-semibold">{t('common.drag_and_drop')}</p>
          </div>
        </div>
      )}
    </div>
  );

  const customStyles = {
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#e5e7eb' : state.isFocused ? '#f3f4f6' : '',
      color: '#000',
      padding: '10px',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      display: 'flex',
      alignItems: 'center',
    }),
  };

  return (
    <Card className="mt-4">
      <CardContent className="p-2 md:p-6">
        <form dir={dir} onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-2 gap-0 lg:gap-8">
            <div className="grid lg:grid-cols-1">
              <div className="grid lg:grid-cols-2 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium mb-1">{t('label.first_name')}</p>
                  <Input
                    id="first_name"
                    {...register('first_name' as keyof StaffFormData)}
                    className="app-input"
                    placeholder={t('place_holder.enter_first_name')}
                  />
                  {errors['first_name' as keyof StaffFormData] && (
                    <p className="text-red-500 text-sm mt-1">{errors['first_name']?.message}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">{t('label.last_name')}</p>
                  <Input
                    id="last_name"
                    {...register('last_name' as keyof StaffFormData)}
                    className="app-input"
                    placeholder={t('place_holder.enter_last_name')}
                  />
                  {errors['last_name' as keyof StaffFormData] && (
                    <p className="text-red-500 text-sm mt-1">{errors['last_name']?.message}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium mb-1">{t('label.email')}</p>
                <Input
                  id="email"
                  {...register('email' as keyof StaffFormData)}
                  className="app-input"
                  placeholder="Enter email"
                />
                {errors['email' as keyof StaffFormData] && (
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
                      {...register('password' as keyof StaffFormData)}
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
                  {errors['password' as keyof StaffFormData] && (
                    <p className="text-red-500 text-sm mt-1">{errors['password']?.message}</p>
                  )}
                </div>
              )}
              <div className="mr-3 my-4">
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
              <div className="mb-4">
                <div className="text-sm font-medium mb-1 flex items-center gap-2">
                  <span>{t('label.stores')}</span>
                </div>
                <Controller
                  name="stores"
                  control={control}
                  rules={{
                    required: 'Please select at least one stores',
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Select
                        {...field}
                        isMulti
                        options={storeList}
                        styles={customStyles}
                        classNamePrefix="select"
                        closeMenuOnSelect={false}
                        hideSelectedOptions={false}
                        onChange={(selectedOptions) => {
                          field.onChange(selectedOptions.map((option) => option.value));
                        }}
                        value={storeList.filter((option: { value: number }) =>
                          field.value?.includes(option.value),
                        )}
                        formatOptionLabel={(option, { context }) => (
                          <div className="flex items-center justify-between">
                            <span>{option.label}</span>
                            {context === 'menu' && field.value?.includes(option.value) && (
                              <span>
                                <Check className="w-4 h-4" />
                              </span>
                            )}
                          </div>
                        )}
                      />
                      {error && <p className="text-red-500">{error.message}</p>}
                    </div>
                  )}
                />
              </div>
            </div>
            <div className="mb-4">
              <div className="text-sm font-medium mb-1 flex items-center gap-2">
                <span>{t('label.image')}</span>
                <div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-custom-dark-blue w-96">
                        <p className="p-1 text-sm font-medium">{t('tooltip.aspect_ratio_1_1')}</p>
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
                    usageType="staff"
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
              <div className="w-48">
                {errorImagesMessage && (
                  <p className="text-red-500 text-sm mt-1">{errorImagesMessage}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <p className=" font-medium text-blue-500 bg-blue-50 shadow p-3 rounded">
              {t('label.roles')}
            </p>
            {isFetching ? (
              <div className="flex items-center justify-center w-full">
                <Loader customClass="mt-2 " size="md" />
              </div>
            ) : (
              <ul className="grid lg:grid-cols-3 gap-2 my-2">
                {Array.isArray(rolesData) ? (
                  rolesData.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 px-3">
                      <input
                        type="checkbox"
                        name={item.name}
                        id={item.name}
                        checked={selectedRole === item.name}
                        onChange={() => {
                          setSelectedRole((prev: any) => (prev === item.name ? '' : item.name));
                        }}
                        className="cursor-pointer"
                      />
                      <label htmlFor={item.name} className="cursor-pointer">
                        {formatLabel(item.name || '', '_')}
                      </label>
                    </li>
                  ))
                ) : (
                  <li>{t('common.not_data_found')}</li>
                )}
              </ul>
            )}
          </div>

          <div className="col-span-2 mt-10">
            <SubmitButton
              UpdateData={data}
              IsLoading={editData ? isUpdating : isPending}
              AddLabel="Add"
              UpdateLabel="Update"
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
export default CreateOrUpdateStaffForm;
