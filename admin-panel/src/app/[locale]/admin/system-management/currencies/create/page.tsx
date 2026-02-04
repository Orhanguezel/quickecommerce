import CustomLayout from "@/components/layout/CustomLayout";
import AddBrand from "@/components/screen/admin-section/brand/AddBrand";
import CreateCurrency from "@/components/screen/admin-section/system-management/currencies/CreateCurrency";

import React from "react";

const CreateCurrencyPage = () => {
  return (
    <CustomLayout>
      <CreateCurrency />
    </CustomLayout>
  );
};

export default CreateCurrencyPage;
