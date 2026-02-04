"use client";
import Loader from "@/components/molecules/Loader";
import { Button, Card } from "@/components/ui";
import { useCasheManagementStoreMutation } from "@/modules/admin-section/cashe-management/cashe-management.action";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Settings2, DatabaseZap, Share2, Eye } from "lucide-react";

const CasheManagementForm = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";

  const [loadingButton, setLoadingButton] = useState<string | null>(null);

  const { mutate: SEOSettingsStore, isPending } =
    useCasheManagementStoreMutation();

  const onSubmit = (actionType: string) => {
    setLoadingButton(actionType);
    const submissionData = {
      cache_clear_type: actionType,
    };

    SEOSettingsStore(submissionData, {
      onSuccess: () => {},
      onError: (error) => {},
      onSettled: () => {
        setLoadingButton(null);
      },
    });
  };

  return (
    <div>
      <Card className="mt-6 p-2 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
  {[
    {
      type: "config",
      icon: <Settings2 size={18} />,
      label: "Config",
      note: "Clears the configuration cache to apply new settings.",
    },
    {
      type: "cache",
      icon: <DatabaseZap size={18} />,
      label: "Cache",
      note: "Removes stored application data to refresh performance.",
    },
    {
      type: "route",
      icon: <Share2 size={18} />,
      label: "Route",
      note: "Clears route cache so new routes take effect.",
    },
    {
      type: "view",
      icon: <Eye size={18} />,
      label: "View",
      note: "Deletes compiled Blade view files for regeneration.",
    },
  ].map(({ type, icon, label, note }) => (
    <div
      key={type}
      className="flex flex-col items-center text-center p-4 border border-muted rounded-xl shadow-custom bg-muted/20"
    >
      <Button
        type="button"
        onClick={() => onSubmit(type)}
        variant="outline"
        className="app-button flex items-center gap-2 mb-2"
      >
        {loadingButton === type ? (
          <Loader size="small" />
        ) : (
          <>
            {icon}
            {label}
          </>
        )}
      </Button>
      <p className="text-sm text-muted-foreground">{note}</p>
    </div>
  ))}
</Card>

    </div>
  );
};

export default CasheManagementForm;
