"use client";
import { SubmitButton } from "@/components/blocks/shared";
import AppPhoneNumberInput from "@/components/blocks/common/AppPhoneNumberInput";
import { Input } from "@/components/ui";
import {
  useSellerStoreMutation,
  useSellerUpdateMutation,
} from "@/modules/admin-section/seller/seller.action";
import {
  SellerFormData,
  sellerSchema,
} from "@/modules/admin-section/seller/seller.schema";
import { useAppDispatch } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

export default function CreateOrUpdateSellerForm({ data }: any) {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [phoneNumber, setPhoneNumber] = useState("");
  const [on, setOn] = useState(false);
  const [onConfirm, setOnConfirm] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<SellerFormData>({
    resolver: zodResolver(sellerSchema),
  });

  useEffect(() => {
    if (data) {
      setValue("first_name", data.first_name ?? "");
      setValue("last_name", data.last_name ?? "");
      setValue("phone", data.phone ?? "");
      setPhoneNumber(data?.phone ?? "");
      setValue("email", data.email ?? "");
    }
  }, [data, setValue]);

  const { mutate: brandStore, isPending } = useSellerStoreMutation();
  const { mutate: brandUpdate, isPending: isUpdating } =
    useSellerUpdateMutation();
  const onSubmit = async (values: SellerFormData) => {
    if (!data && values?.password === "") {
      return toast.error(t("toast.please_enter_Password"));
    }
    const defaultData: any = {
      first_name: values.first_name,
      last_name: values.last_name,
      phone: values.phone,
      email: values.email,
    };
    if (!data) {
      defaultData.password = values.password;
      defaultData.password_confirmation = values.password_confirmation;
    }

    const submissionData = {
      ...defaultData,
      id: data?.id,
    };

    return data
      ? brandUpdate(
          { ...(submissionData as any) },
          {
            onSuccess: () => {
              reset();
              dispatch(setRefetch(true));
            },
          }
        )
      : brandStore(
          { ...(submissionData as any) },
          {
            onSuccess: () => {
              reset();
              dispatch(setRefetch(true));
            },
          }
        );
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div dir={dir} className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">{t("label.first_name")}</p>
            <Input
              type="text"
              id="first_name"
              defaultValue={data?.first_name ?? ""}
              {...register("first_name" as keyof SellerFormData)}
              className="app-input"
              placeholder={t("place_holder.enter_first_name")}
            />
            {errors[`first_name` as keyof SellerFormData] && (
              <p className="text-red-500 text-sm mt-1">
                {
                  //@ts-ignore
                  errors[`first_name`]?.message
                }
              </p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium mb-1">{t("label.last_name")}</p>
            <Input
              type="text"
              id="last_name"
              defaultValue={data?.last_name ?? ""}
              {...register("last_name" as keyof SellerFormData)}
              className="app-input"
              placeholder={t("place_holder.enter_last_name")}
            />
            {errors[`last_name` as keyof SellerFormData] && (
              <p className="text-red-500 text-sm mt-1">
                {
                  //@ts-ignore
                  errors[`last_name`]?.message
                }
              </p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium mb-1">{t("label.email")}</p>
            <Input
              type="text"
              id="email"
              defaultValue={data?.email ?? ""}
              {...register("email" as keyof SellerFormData)}
              className="app-input"
              placeholder={t("place_holder.enter_email")}
            />
            {errors[`email` as keyof SellerFormData] && (
              <p className="text-red-500 text-sm mt-1">
                {
                  //@ts-ignore
                  errors[`email`]?.message
                }
              </p>
            )}
          </div>
          <div className="mr-3">
            <p className="text-sm font-medium mb-1">{t("label.phone")} </p>
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

          {!data && (
            <>
              <div>
                <p className="text-sm font-medium mb-1">
                  {t("label.password")}
                </p>
                <div className="relative">
                  <Input
                    type={on ? "text" : "password"}
                    id="password"
                    maxLength={12}
                    {...register("password" as keyof SellerFormData)}
                    className="app-input"
                    placeholder={t("place_holder.enter_password")}
                  />
                  {on ? (
                    <div className="absolute right-3 top-2 cursor-pointer">
                      <Eye
                        className="text-gray-500 dark:text-white w-5"
                        onClick={() => setOn(!on)}
                      />
                    </div>
                  ) : (
                    <div className="absolute right-3 top-2 cursor-pointer">
                      <EyeOff
                        className="text-gray-500 dark:text-white w-5"
                        onClick={() => setOn(!on)}
                      />
                    </div>
                  )}
                </div>
                {errors[`password` as keyof SellerFormData] && (
                  <p className="text-red-500 text-sm mt-1">
                    {
                      //@ts-ignore
                      errors[`password`]?.message
                    }
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium mb-1">
                  {t("label.confirm_password")}
                </p>
                <div className="relative">
                  <Input
                    type={onConfirm ? "text" : "password"}
                    id="password_confirmation"
                    maxLength={12}
                    {...register(
                      "password_confirmation" as keyof SellerFormData
                    )}
                    className="app-input"
                    placeholder={t("place_holder.enter_confirm_password")}
                  />
                  {onConfirm ? (
                    <div className="absolute right-3 top-2 cursor-pointer">
                      <Eye
                        className="text-gray-500 dark:text-white w-5"
                        onClick={() => setOnConfirm(!onConfirm)}
                      />
                    </div>
                  ) : (
                    <div className="absolute right-3 top-2 cursor-pointer">
                      <EyeOff
                        className="text-gray-500 dark:text-white w-5"
                        onClick={() => setOnConfirm(!onConfirm)}
                      />
                    </div>
                  )}
                </div>
                {errors[`password_confirmation` as keyof SellerFormData] && (
                  <p className="text-red-500 text-sm mt-1">
                    {
                      //@ts-ignore
                      errors[`password_confirmation`]?.message
                    }
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="col-span-2 mt-10">
          <SubmitButton
            UpdateData={data}
            IsLoading={isPending || isUpdating}
            AddLabel={t("button.add_seller")}
            UpdateLabel={t("button.update_seller")}
          />
        </div>
      </form>
    </div>
  );
}
