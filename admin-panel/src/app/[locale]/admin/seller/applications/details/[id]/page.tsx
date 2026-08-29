"use client";
import SellerApplicationDetail from "@/components/screen/admin-section/seller/SellerApplicationDetail";
import { useParams } from "next/navigation";

const SellerApplicationDetailPage = () => {
  const params = useParams();
  const id = params?.id as string;

  return (
    <SellerApplicationDetail id={id} />
  );
};

export default SellerApplicationDetailPage;
