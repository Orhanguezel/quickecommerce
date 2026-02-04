import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";

interface Items {
  id: number;
  label: string;
  value: string;
}

type DropdownProps = {
  trigger: React.ReactNode;
  data: Items[];
  onSelect: (item: Items) => void;
};


export const AppDropdown: React.FC<DropdownProps> = ({
  trigger,
  data,
  onSelect,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          {data.map((item) => (
            <DropdownMenuItem key={item.id} onClick={() => onSelect(item)}>
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
