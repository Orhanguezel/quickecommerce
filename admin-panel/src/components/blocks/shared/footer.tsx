import { useGeneralQuery } from "@/modules/common/com/com.action";
import { useLocale } from "next-intl";
import { useMemo } from "react";

export function Footer() {
    const localeMain = useLocale();

  const { general, refetch: generalRefetch } = useGeneralQuery({
    language: localeMain,
  });
  const originalDataGeneral = useMemo(() => {
    const data = (general as any) || {};
    return data;
  }, [general]);

  const GeneralData = originalDataGeneral.site_settings;
  return (
    <div className="z-50 bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-4 md:mx-8 flex h-10 items-center justify-center">
        <p className="text-xs md:text-sm leading-loose text-muted-foreground text-center">
          {GeneralData?.com_site_footer_copyright}
        </p>
      </div>
    </div>
  );
}
