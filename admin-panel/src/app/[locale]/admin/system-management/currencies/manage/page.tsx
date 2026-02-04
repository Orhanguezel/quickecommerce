"use client";
import CustomLayout from "@/components/layout/CustomLayout";
import Brand from "@/components/screen/admin-section/brand";
import ManageCurrency from "@/components/screen/admin-section/system-management/currencies";
import React from "react";

const ManageCurrencyRoot = () => {
  return (
    <CustomLayout>
      <ManageCurrency />
    </CustomLayout>
  );
};

export default ManageCurrencyRoot;
