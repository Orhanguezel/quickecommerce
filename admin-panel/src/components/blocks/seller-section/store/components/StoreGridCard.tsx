"use client";
import EmailIcon from "@/assets/icons/EmailIcon";
import LocationIcon from "@/assets/icons/LocationIcon";
import PhoneCallIcon from "@/assets/icons/PhoneCallIcon";
import StoreTypeIcon from "@/assets/icons/StoreTypeIcon";
import { CustomViewIcon } from "@/components/blocks/custom-icons";
import TableEdit from "@/components/blocks/custom-icons/TableEdit";
import {
  Card,
  CardContent,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import { SellerRoutes } from "@/config/sellerRoutes";
import GlobalImageLoader from "@/lib/imageLoader";
import { useAppDispatch } from "@/redux/hooks/index";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { setSelectedStore } from "@/redux/slices/storeSlice";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function StoreGridCard({ items }: any) {
  const { id, name, phone, email, address, logo, store_type, logo_url, slug } =
    items;
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const router = useRouter();
  const handleSelectStore = () => {
    dispatch(setSelectedStore({ id, type: store_type, slug }));
    router.push(`${SellerRoutes.storeDashboard}/${slug}`);
    dispatch(setRefetch(true));
    localStorage.setItem("store_id", id);
  };
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const handleEdit = (Id: string) => {
    setEditRowId(Id);
    router.push(`${SellerRoutes.editStore}/${Id}`);
    dispatch(setRefetch(true));
  };
  const imageSrc = logo_url && logo ? logo_url : "/images/no-image.png";

  return (
    <Card className="h-full">
      <CardContent className="py-6 px-3 grid grid-cols-1 md:grid-cols-4 items-center gap-4">
        <div
          className="col-span-1 relative w-24 h-24 cursor-pointer "
          onClick={handleSelectStore}
        >
          <Image
            loader={GlobalImageLoader}
            src={imageSrc}
            alt="logo"
            fill
            sizes="96px"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <div className="col-span-1 md:col-span-3 space-y-2 mx-2">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={handleSelectStore}
          >
            <p className="text-base sm:text-lg font-semibold text-blue-500 line-clamp-2">
              {name}
            </p>
          </div>
          {store_type && (
            <div className="flex items-center gap-2 line-clamp-2 text-md font-normal mt-2">
              <span className="bg-[#E8F1FD] p-1.5 rounded-full">
                <StoreTypeIcon />
              </span>
              <span className="text-md font-normal capitalize">
                {store_type}
              </span>
            </div>
          )}
          {address && (
            <div className="flex items-center gap-2 line-clamp-2 text-md font-normal mt-2">
              <span className="bg-[#00C61E1A] p-1.5 rounded-full">
                <LocationIcon />
              </span>
              <span className="truncate">{address}</span>
            </div>
          )}
          {email && (
            <div className="flex items-center gap-2 line-clamp-2 text-md font-normal mt-2">
              <span className="bg-[#E8F1FD] p-1.5 rounded-full">
                <EmailIcon />
              </span>{" "}
              {email}
            </div>
          )}

          <div className="relative flex items-center justify-between">
            {phone && (
              <div className="flex items-center gap-2 line-clamp-2 text-md font-normal">
                <span className="bg-[#E8F1FD] p-1.5 rounded-full">
                  <PhoneCallIcon />
                </span>{" "}
                {phone}
              </div>
            )}
            <div
              className={`absolute flex items-center ${
                dir == "rtl" ? "left-0" : "right-0"
              }  `}
            >
              <div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TableEdit
                        isLoading={editRowId === id}
                        onClick={() => handleEdit(id)}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-blue-500 text-white">
                      <p className="text-sm">{t("tooltip.update_store")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      className="text-blue-500 hover:underline dark:text-[#93c5fd] dark:hover:text-white mx-2"
                      href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/stores/details/${slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CustomViewIcon />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#16B4CD] text-white">
                    <p className="text-sm">{t("tooltip.visit_store")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
