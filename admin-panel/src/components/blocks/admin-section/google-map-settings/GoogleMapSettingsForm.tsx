// src/components/blocks/admin-section/google-map-settings/GoogleMapSettingsForm.tsx

"use client";
import { SubmitButton } from "@/components/blocks/shared";
import { Card, CardContent, Input, Switch } from "@/components/ui";
import {
  useGoogleMapSettingsQuery,
  useGoogleMapSettingsStoreMutation,
} from "@/modules/admin-section/google-map-settings/google-map-settings.action";
import {
  GoogleMapSettingsFormData,
  googleMapSettingsSchema,
} from "@/modules/admin-section/google-map-settings/google-map-settings.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type ToggleState = {
  com_google_map_enable_disable: string;
};

const GoogleMapSettingsForm = () => {
  const { GoogleMapSettingsData, refetch, isPending } =
    useGoogleMapSettingsQuery({});

  const { register, setValue, handleSubmit } =
    useForm<GoogleMapSettingsFormData>({
      resolver: zodResolver(googleMapSettingsSchema),
    });

  const [toggles, setToggles] = useState<ToggleState>({
    com_google_map_enable_disable: "",
  });
  const GoogleMapSettingsMessage = (GoogleMapSettingsData as any)?.message;

  useEffect(() => {
    if (GoogleMapSettingsMessage) {
      setValue(
        "com_google_map_api_key",
        GoogleMapSettingsMessage?.com_google_map_api_key
      );

      setToggles({
        com_google_map_enable_disable:
          GoogleMapSettingsMessage?.com_google_map_enable_disable || "",
      });
    }
  }, [GoogleMapSettingsData, GoogleMapSettingsMessage, setValue]);

  const handleToggle = (property: keyof ToggleState) => {
    setToggles((prev) => ({
      ...prev,
      [property]: prev[property] === "on" ? "" : "on",
    }));
  };

  const { mutate: google_map_settings_update, isPending: isUpdating } =
    useGoogleMapSettingsStoreMutation();

  const onSubmit = async (values: GoogleMapSettingsFormData) => {
    const payload = {
      com_google_map_api_key: values.com_google_map_api_key,
      com_google_map_enable_disable: toggles.com_google_map_enable_disable,
    };

    return google_map_settings_update(payload, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mt-4">
          <CardContent className="p-2 md:p-6">
            <div className="mb-4">
              <div className="mb-2 mt-3">
                {/* Label for Switch */}
                <label
                  htmlFor="com_google_map_enable_disable"
                  className="text-sm font-medium mb-1 block"
                >
                  Google Map Enable/Disable
                </label>
                <Switch
                  id="com_google_map_enable_disable"
                  checked={toggles.com_google_map_enable_disable === "on"}
                  onCheckedChange={() =>
                    handleToggle("com_google_map_enable_disable")
                  }
                />
              </div>

              {/* Label for Input */}
              <label
                htmlFor="com_google_map_api_key"
                className="text-sm font-medium mb-1 block"
              >
                Google Map API Key
              </label>
              <Input
                id="com_google_map_api_key"
                {...register(
                  "com_google_map_api_key" as keyof GoogleMapSettingsFormData
                )}
                className="app-input"
                placeholder="Enter your API key for Google Maps"
              />

              {/* Notes Section */}
              <div className="text-sm text-gray-500 dark:text-white mt-2 ">
                <strong className="bg-dark text-white p-1">Notes:</strong>
                <ul className="list-inside list-disc mt-2 space-y-1">
                  <li>
                    <strong>Store Location Setup:</strong> Create and manage
                    your seller&#39;s store locations on the map to improve
                    visibility and provide accurate geographical data.
                  </li>
                  <li>
                    <strong>Product Filtering by Location:</strong> Allow
                    customers to filter products based on their location,
                    enhancing the shopping experience by showing nearby stores
                    or sellers.
                  </li>
                </ul>
                <br />
                You can get your API key by following the{" "}
                <a
                  href="https://developers.google.com/maps/gmp-get-started"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline dark:text-[#93c5fd] dark:hover:text-white "
                >
                  Google Maps API documentation
                </a>
                .
                <br />
                <strong className="text-red-500 mt-2">Important:</strong> Always
                keep your API key secure. Do not share it publicly or in
                unsecured places.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit button */}
        <Card className="mt-4 sticky bottom-0 w-full p-4">
          <SubmitButton IsLoading={isUpdating} AddLabel="Save Changes" />
        </Card>
      </form>
    </div>
  );
};

export default GoogleMapSettingsForm;
