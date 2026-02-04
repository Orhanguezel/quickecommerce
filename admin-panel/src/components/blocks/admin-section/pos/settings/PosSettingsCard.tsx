"use client";
import Loader from "@/components/molecules/Loader";
import { Button, Card, CardContent } from "@/components/ui";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  usePosSettingsMutation,
  usePosSettingsQuery,
} from "@/modules/admin-section/pos/Pos.action";
import { Printer } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

const PosSettingsCard = () => {
  const t = useTranslations();
  const [commissionType, setCommissionType] = useState<string>("");

  const {
    PosSettings,
    refetch,
    isPending: isQuerying,
  } = usePosSettingsQuery({});
  const QueryCommissionSettingsData = useMemo(
    () => (PosSettings as any) || [],
    [PosSettings]
  );

  const message = QueryCommissionSettingsData?.data;
  useEffect(() => {
    if (message) {
      setCommissionType(message?.com_pos_settings_print_invoice ?? "");
    }
  }, [message]);

  const { mutate: CommissionSettingsStore, isPending } =
    usePosSettingsMutation();
  const onSubmit = async () => {
    const submissionData = {
      com_pos_settings_print_invoice: commissionType,
    };
    return CommissionSettingsStore(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  return (
    <div>
      {isQuerying ? (
        <Loader customClass="mt-10" size="large" />
      ) : (
        <Card className="mt-4">
          <CardContent className="p-2 md:p-6">
            <h2 className="text-lg font-semibold flex items-center gap-1">
              <Printer width={20} height={20} />
              Printer Type
            </h2>
            <div className="space-y-6 p-4">
              <div className="flex items-center gap-4 mt-2">
                <RadioGroup
                  className="flex items-center gap-4"
                  value={commissionType}
                  onValueChange={(value) => setCommissionType(value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      className="text-blue-500 border-blue-500 "
                      value="thermal"
                      id="p1"
                    />
                    <Label htmlFor="p1">Thermal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      className="text-blue-500 border-blue-500"
                      value="a4"
                      id="f2"
                    />
                    <Label htmlFor="f2">A4</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="">
                <Button onClick={onSubmit} className="app-button ">
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PosSettingsCard;
