"use client";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import MediaManageTable from "@/components/blocks/admin-section/media-manage/MediaManageTable";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const MediaManage = () => {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLoading]);

  return (
    <>
      <LoaderOverlay isLoading={isLoading} />
      <MediaManageTable />
    </>
  );
};

export default MediaManage;
