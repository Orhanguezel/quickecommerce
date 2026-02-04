'use client';
import { SubmitButton } from '@/components/blocks/shared';
import Loader from '@/components/molecules/Loader';
import { Card, CardContent, Input, Switch } from '@/components/ui';
import {
  useOpenAISettingsQuery,
  useOpenAISettingsStoreMutation,
} from '@/modules/admin-section/openai-settings/openai-settings.action';
import {
  OpenAISettingsFormData,
  openAISettingsSchema,
} from '@/modules/admin-section/openai-settings/openai-settings.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AppSearchSelect } from '../../common/AppSearchSelect';
import CardSkletonLoader from '@/components/molecules/CardSkletonLoader';

type ToggleState = {
  openai_enable_disable: string;
};

const OpenAISettingsForm = ({ data }: any) => {
  const t = useTranslations();
  const localeMain = useLocale();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const { watch, control, register, setValue, handleSubmit } = useForm<OpenAISettingsFormData>({
    resolver: zodResolver(openAISettingsSchema),
  });

  const [toggles, setToggles] = useState<ToggleState>({
    openai_enable_disable: '',
  });

  const OpenAIModelList = [
    { label: 'Gpt 4', value: 'gpt-4' },
    { label: 'Gpt 4 32k', value: 'gpt-4-32k' },
    { label: 'Gpt 4o', value: 'gpt-4o' },
    { label: 'Gpt 4o Mini', value: 'gpt-4o-mini' },
    { label: 'Gpt 4o 16k', value: 'gpt-4o-16k' },
    { label: 'Gpt 3.5 Turbo', value: 'gpt-3.5-turbo' },
    { label: 'Gpt 3.5 Turbo 16k', value: 'gpt-3.5-turbo-16k' },
  ];

  const handleSelectItem = (value: string, inputType: string) => {
    setValue(inputType as any, value);
  };

  const {
    OpenAISettingsData,
    refetch,
    isFetching,
    isPending: isQuerying,
    error,
  } = useOpenAISettingsQuery({});
  const QueryOpenAISettingsData = useMemo(
    () => (OpenAISettingsData as any) || [],
    [OpenAISettingsData],
  );

  useEffect(() => {
    const OpenAISettingsMessage = QueryOpenAISettingsData?.data;
    if (OpenAISettingsMessage) {
      setValue('com_openai_api_key', OpenAISettingsMessage?.com_openai_api_key ?? '');
      setValue('com_openai_model', OpenAISettingsMessage?.com_openai_model ?? '');
      setValue('com_openai_timeout', OpenAISettingsMessage?.com_openai_timeout ?? '');
      setToggles({
        openai_enable_disable: OpenAISettingsMessage?.com_openai_enable_disable || '',
      });
    }
  }, [QueryOpenAISettingsData, setValue]);

  const handleToggle = (property: keyof ToggleState) => {
    setToggles((prev) => {
      const newState: ToggleState = Object.keys(prev).reduce(
        (acc, key) => ({ ...acc, [key]: '' }),
        {} as ToggleState,
      );
      newState[property] = prev[property] === 'on' ? '' : 'on';
      return newState;
    });
  };

  const { mutate: OpenAISettingsStore, isPending } = useOpenAISettingsStoreMutation();

  const onSubmit = async (values: OpenAISettingsFormData) => {
    const defaultData = {
      com_openai_api_key: values.com_openai_api_key,
      com_openai_model: values.com_openai_model,
      com_openai_timeout: values.com_openai_timeout,
      com_openai_enable_disable: toggles.openai_enable_disable,
    };

    const submissionData = {
      ...defaultData,
      id: QueryOpenAISettingsData?.id ? QueryOpenAISettingsData?.id : 0,
    };
    return OpenAISettingsStore(submissionData as any, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  useEffect(() => {
    if (!isQuerying && !error) refetch();
  }, [isQuerying, refetch, error]);

  return (
    <div>
      {isQuerying ? (
        <CardSkletonLoader />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="mt-4">
            <CardContent className="p-2 md:p-4 lg:p-4">
              <div dir={dir} className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">
                <div className="space-y-4">
                  {/* OpenAI API Key */}
                  <div>
                    <label htmlFor="com_openai_api_key" className="text-sm font-medium mb-1 block">
                      Open AI API Key
                    </label>
                    <Input
                      id="com_openai_api_key"
                      {...register('com_openai_api_key' as keyof OpenAISettingsFormData)}
                      className="app-input"
                      placeholder="Enter value"
                    />
                  </div>

                  {/* OpenAI Model */}
                  <div>
                    <label htmlFor="com_openai_model" className="text-sm font-medium mb-1 block">
                      Open AI Model
                    </label>
                    <Controller
                      control={control}
                      name="com_openai_model"
                      defaultValue={QueryOpenAISettingsData?.data?.com_openai_model ?? ''}
                      render={({ field }) => (
                        <AppSearchSelect
                          value={String(field.value ?? '')}
                          onSelect={(value) => {
                            field.onChange(value);
                            handleSelectItem(value, 'com_openai_model');
                          }}
                          groups={OpenAIModelList}
                          hideNone
                        />
                      )}
                    />
                  </div>

                  {/* OpenAI Timeout */}
                  <div>
                    <label htmlFor="com_openai_timeout" className="text-sm font-medium mb-1 block">
                      Open AI Timeout
                    </label>
                    <Input
                      type="number"
                      id="com_openai_timeout"
                      {...register('com_openai_timeout' as keyof OpenAISettingsFormData)}
                      className="app-input"
                      placeholder="Enter value"
                    />
                  </div>
                </div>

                {/* Enable/Disable Switch */}
                <div className="mt-6">
                  <div className="flex flex-col md:flex-row items-start gap-2 md:gap-6">
                    <label
                      htmlFor="openai_enable_disable"
                      className="text-sm font-medium mb-1 block"
                    >
                      Open AI Enable/Disable
                    </label>
                    <Switch
                      id="openai_enable_disable"
                      dir="ltr"
                      checked={toggles.openai_enable_disable === 'on'}
                      onCheckedChange={() => handleToggle('openai_enable_disable')}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6">
                <SubmitButton IsLoading={isPending} AddLabel="Save Changes" />
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
};

export default OpenAISettingsForm;
