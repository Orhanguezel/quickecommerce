"use client";
import { Card } from "@/components/ui";
import { Routes } from "@/config/routes";
import { SellerRoutes } from "@/config/sellerRoutes";
import GlobalImageLoader from "@/lib/imageLoader";
import { useAppDispatch } from "@/redux/hooks/index";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { setSelectedStore } from "@/redux/slices/storeSlice";
import { Edit, MapPin, PhoneCall, Store } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function StoreGridCard({ items }: any) {
  const {
    id,
    name,
    phone,
    email,
    address,
    logo,
    banner,
    store_type,
    banner_url,
    logo_url,
    slug,
    type
  } = items;

  const dispatch = useAppDispatch();
  const router = useRouter();
  const handleSelectStore = () => {
    dispatch(setSelectedStore({ id, type, slug }));
    router.push(`${SellerRoutes.storeDashboard}/${slug}`);
    dispatch(setRefetch(true));
    localStorage.setItem("store_id", id);
  };
  const handleEdit = (e: any, Id: string) => {
    e.stopPropagation();
    router.push(`${Routes.editStore}/${Id}`);
    dispatch(setRefetch(true));
  };
  return (
    <Card className="rounded shadow cursor-pointer" onClick={handleSelectStore}>
      
      <div className="">
        <div className="relative ">
          <Image
          loader={GlobalImageLoader}
            src={banner ? banner_url : "/images/no-image.png"}
            alt="CoverImg"
            width={100}
            height={100}
            className="h-32 w-full rounded-t"
          />
          <div className="absolute top-[60%] left-[35%] w-24 h-24">
            <Image
            loader={GlobalImageLoader}
              src={logo ? logo_url : "/images/no-image.png"}
              alt="ImageImg"
              width={100}
              height={100}
              className="absolute w-full h-full object-cover rounded-full border-4 border-white shadow"
            />
          </div>
        </div>
        <div className="p-4 mt-10">
          <div className="flex items-center justify-between">
            <p className="text-base sm:text-lg font-semibold">{name}</p>

            <div
              onClick={(e) => handleEdit(e, id)}
              className="bg-blue-100 text-blue-500 p-1 rounded"
            >
              <Edit width={20} height={20} />
            </div>
          </div>

          <p className="flex items-start gap-2 my-1">
            <Store width={16} height={16} />{" "}
            <span className="text-xs font-normal capitalize">{store_type}</span>
          </p>

          <p className="flex items-center gap-2 line-clamp-2 text-xs font-normal my-1">
            <PhoneCall width={12} height={12} /> {phone}
          </p>
          <p className="flex items-center gap-2 line-clamp-2 text-xs font-normal">
            <MapPin width={16} height={16} />{" "}
            <span className="truncate">{address}</span>
          </p>
        </div>
      </div>
    </Card>
  );
}
