"use client";
import CustomLayout from "@/components/layout/CustomLayout";
import Brand from "@/components/screen/admin-section/brand";
import DynamicFields from "@/components/screen/admin-section/dynamic-fields";
import React from "react";

const DynamicFieldsRoot = () => {
  return (
    <CustomLayout>
      <DynamicFields />
    </CustomLayout>
  );
};

export default DynamicFieldsRoot;
