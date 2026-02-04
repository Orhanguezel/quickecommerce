"use client";
import EmailIcon from "@/assets/icons/EmailIcon";
import LocationIcon from "@/assets/icons/LocationIcon";
import PhoneCallIcon from "@/assets/icons/PhoneCallIcon";
import { Card } from "@/components/ui";
import GlobalImageLoader from "@/lib/imageLoader";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { usePathname } from "next/navigation";

const CustomerDetailsCard = ({ data, ID }: any) => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";

  const {
    id,
    full_name = "",
    phone = "",
    email = "",
    address = "",
    image = "/images/no-image.png",
    gender,
    birth_day,
    status,
  } = data;

  return (
    <>
      <Card dir={dir} className="rounded shadow">
        <div className="relative w-32 h-32 rounded-full">
          <Image
            loader={GlobalImageLoader}
            src={image ? image : "/images/no-image.png"}
            alt="ImageImg"
            fill
            sizes="128px"
            className="w-full h-full rounded-full border-4 border-white "
          />
        </div>

        <div className="grid grid-cols-1 gap-4 px-8 py-4">
          <div className=" space-y-3">
            <div className="flex items-center justify-between cursor-pointer">
              <p className="text-2xl font-bold text-blue-500 capitalize">
                {full_name}
              </p>
            </div>
            {phone && (
              <p className="flex items-center gap-2 line-clamp-2 text-base font-normal mt-2">
                <span className="bg-[#E8F1FD] p-1 rounded-full">
                  <PhoneCallIcon />
                </span>{" "}
                {phone}
              </p>
            )}
            {email && (
              <p className="flex items-center gap-2 line-clamp-2 text-base font-normal mt-2">
                <span className="bg-[#E8F1FD] p-1 rounded-full">
                  <EmailIcon />
                </span>{" "}
                {email}
              </p>
            )}
            {address && (
              <p className="flex items-center gap-2 line-clamp-2 text-xs font-normal">
                <span className="bg-[#00C61E1A] p-1 rounded-full">
                  <LocationIcon />
                </span>
                <span className="truncate">{address}</span>
              </p>
            )}
            {gender && (
              <p className="flex items-center gap-2 line-clamp-2 text-base font-normal mt-2">
                <span className="">{t("label.gender")} :</span> {gender}
              </p>
            )}
            {birth_day && (
              <p className="flex items-center gap-2 line-clamp-2 text-base font-normal mt-2">
                <span className="">{t("label.date_of_birth")} :</span>{" "}
                {birth_day}
              </p>
            )}
            {status && (
              <p className="flex items-center gap-2 line-clamp-2 text-base font-normal mt-2">
                <span className="">{t("label.status")} :</span>{" "}
                <span
                  className={`${
                    status == 1 ? "bg-blue-500" : "bg-red-500"
                  } text-white py-1 px-4 rounded`}
                >
                  {status == 1 ? "Active" : "Inactive"}
                </span>
              </p>
            )}
          </div>
        </div>
      </Card>
    </>
  );
};

export default CustomerDetailsCard;
