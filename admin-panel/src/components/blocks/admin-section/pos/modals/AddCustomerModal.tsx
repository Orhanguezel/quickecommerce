"use client";
import AppPhoneNumberInput from "@/components/blocks/common/AppPhoneNumberInput";
import { Input } from "@/components/ui";
import { AppModal } from "@/components/blocks/common/AppModal";
import { usePosCustomerStoreMutation } from "@/modules/admin-section/pos/Pos.action";
import { PosCustomerFormData, posCustomerSchema } from "@/modules/admin-section/pos/Pos.schema";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

const AddCustomerModal = ({ trigger, listRefetch }: any) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const store_id = selectedStore?.id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    control,
  } = useForm<PosCustomerFormData>({
    resolver: zodResolver(posCustomerSchema),
  });

  const handleSelectItem = (value: string, inputType: string) => {
    setValue(inputType as any, value);
  };

  const { mutate: DeliverymanStore, isPending: isDeliverymanStorePending } =
    usePosCustomerStoreMutation();

  const onSubmit = async (values: PosCustomerFormData) => {
    const defaultData: any = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone: values.phone,
      store_id,
    };

    const submissionData = {
      ...defaultData,
    };
    return DeliverymanStore(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          reset();
          listRefetch();
          dispatch(setRefetch(true));
          setIsModalOpen(false);
        },
      }
    );
  };
  return (
    <AppModal
      trigger={trigger}
      actionButtonLabel={
        isDeliverymanStorePending ? t("pos.adding") : t("button.add")
      }
      customClass="inset-x-35p top-[200px] bg-white"
      onSave={handleSubmit(onSubmit)}
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
    >
      <>
        <h1 className="text-2xl font-semibold mb-4">{t("pos.add_customer")}</h1>
        <div dir={dir}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mt-4 p-4">
              <div className="grid lg:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">
                    {t("label.first_name")}
                  </p>
                  <Input
                    id="first_name"
                    {...register("first_name" as keyof PosCustomerFormData)}
                    className="app-input"
                    placeholder={t("place_holder.enter_first_name")}
                  />
                  {errors["first_name" as keyof PosCustomerFormData] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors["first_name"]?.message}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">
                    {t("label.last_name")}
                  </p>
                  <Input
                    id="last_name"
                    {...register("last_name" as keyof PosCustomerFormData)}
                    className="app-input"
                    placeholder={t("place_holder.enter_last_name")}
                  />
                  {errors["last_name" as keyof PosCustomerFormData] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors["last_name"]?.message}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">{t("label.email")}</p>
                  <Input
                    id="email"
                    {...register("email" as keyof PosCustomerFormData)}
                    className="app-input"
                    placeholder={t("place_holder.enter_email")}
                  />
                  {errors["email" as keyof PosCustomerFormData] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors["email"]?.message}
                    </p>
                  )}
                </div>

                <div className="mr-3">
                  <p className="text-sm font-medium mb-1">
                    {t("label.phone")}{" "}
                  </p>
                  <AppPhoneNumberInput
                    value={phoneNumber}
                    onChange={(value) => {
                      setPhoneNumber(value);
                      setValue("phone", value);
                    }}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.phone?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </>
    </AppModal>
  );
};

export default AddCustomerModal;
