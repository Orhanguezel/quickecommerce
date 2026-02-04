import { Input, Label } from "@/components/ui";
import React from "react";
import { UseFormRegister } from "react-hook-form";

interface AppInputProps {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  register: UseFormRegister<any>;
  error?: string;
}

const AppInput: React.FC<AppInputProps> = ({
  id,
  type,
  error,
  label,
  register,
  placeholder,
}) => {
  return (
    <div>
      <Label className="mb-1" htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        {...register(id)}
        placeholder={placeholder}
        className="focus-visible:ring-white ring-offset-0"
      />
      {error && <span className="text-red-600 text-sm mt-1">{error}</span>}
    </div>
  );
};

export default AppInput;
