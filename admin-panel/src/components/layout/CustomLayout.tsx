 "use client";
import { ContentLayout } from "@/components/layout/content-layout";
import LayoutPanel from "@/components/layout/layout-panel";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const CustomLayout = ({ children }: Props) => {
    return (
      <div>
        <LayoutPanel>
          <ContentLayout>{children}</ContentLayout>
        </LayoutPanel>
      </div>
    );
  
};

export default CustomLayout;
