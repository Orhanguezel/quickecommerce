"use client";
import CustomLayout from "@/components/layout/CustomLayout";
import SellerApplicationDetail from "@/components/screen/admin-section/seller/SellerApplicationDetail";
import { useParams } from "next/navigation";

const SellerApplicationDetailPage = () => {
  const params = useParams();
  const id = params?.id as string;

  return (
    <CustomLayout>
      <SellerApplicationDetail id={id} />
    </CustomLayout>
  );
};

export default SellerApplicationDetailPage;
