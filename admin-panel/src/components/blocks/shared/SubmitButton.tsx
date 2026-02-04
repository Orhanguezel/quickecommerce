// src/components/blocks/shared/SubmitButton.tsx

import Loader from "@/components/molecules/Loader";
import { Button } from "@/components/ui";
import React from "react";

export const SubmitButton = ({disabled, IsLoading, UpdateLabel, AddLabel, UpdateData }: any) => {
  return (
    <Button
    
      type="submit"
      disabled = {disabled || IsLoading}
      variant="outline"
      className="app-button"
    >
      {IsLoading ? (
        <Loader size="small" />
      ) : (
        <span>{UpdateData ? `${UpdateLabel}` : `${AddLabel}`}</span>
      )}
    </Button>
  );
};
