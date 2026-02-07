'use client';
import { SubmitButton } from '@/components/blocks/shared';
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
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AppSearchSelect } from '../../common/AppSearchSelect';
import CardSkletonLoader from '@/components/molecules/CardSkletonLoader';

type ToggleState = {
  openai_enable_disable: string;
  claude_enable_disable: string;
};

const OpenAISettingsForm = ({ data }: any) => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const { watch, control, register, setValue, handleSubmit } = useForm<OpenAISettingsFormData>({
    resolver: zodResolver(openAISettingsSchema),
  });

  const [toggles, setToggles] = useState<ToggleState>({
    openai_enable_disable: '',
    claude_enable_disable: '',
  });

  const OpenAIModelList = [
    { label: 'GPT-4', value: 'gpt-4' },
    { label: 'GPT-4 32k', value: 'gpt-4-32k' },
    { label: 'GPT-4o', value: 'gpt-4o' },
    { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
    { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
    { label: 'GPT-3.5 Turbo 16k', value: 'gpt-3.5-turbo-16k' },
    { label: 'Groq — Llama 3.3 70B', value: 'llama-3.3-70b-versatile' },
    { label: 'Groq — Llama 3.1 8B', value: 'llama-3.1-8b-instant' },
    { label: 'Groq — Mixtral 8x7B', value: 'mixtral-8x7b-32768' },
  ];

  const ClaudeModelList = [
    { label: 'Claude Sonnet 4.5', value: 'claude-sonnet-4-5-20250929' },
    { label: 'Claude Haiku 4.5', value: 'claude-haiku-4-5-20251001' },
    { label: 'Claude Opus 4.6', value: 'claude-opus-4-6' },
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
    const settingsData = QueryOpenAISettingsData?.data;
    if (settingsData) {
      // OpenAI
      setValue('com_openai_api_key', settingsData?.com_openai_api_key ?? '');
      setValue('com_openai_model', settingsData?.com_openai_model ?? '');
      setValue('com_openai_timeout', settingsData?.com_openai_timeout ?? '');
      // Claude
      setValue('com_claude_api_key', settingsData?.com_claude_api_key ?? '');
      setValue('com_claude_model', settingsData?.com_claude_model ?? '');
      setValue('com_claude_timeout', settingsData?.com_claude_timeout ?? '');

      setToggles({
        openai_enable_disable: settingsData?.com_openai_enable_disable || '',
        claude_enable_disable: settingsData?.com_claude_enable_disable || '',
      });
    }
  }, [QueryOpenAISettingsData, setValue]);

  const handleToggle = (property: keyof ToggleState) => {
    setToggles((prev) => ({
      ...prev,
      [property]: prev[property] === 'on' ? '' : 'on',
    }));
  };

  const { mutate: OpenAISettingsStore, isPending } = useOpenAISettingsStoreMutation();

  const onSubmit = async (values: OpenAISettingsFormData) => {
    const submissionData = {
      id: QueryOpenAISettingsData?.id ? QueryOpenAISettingsData?.id : 0,
      // OpenAI
      com_openai_api_key: values.com_openai_api_key,
      com_openai_model: values.com_openai_model,
      com_openai_timeout: values.com_openai_timeout,
      com_openai_enable_disable: toggles.openai_enable_disable,
      // Claude
      com_claude_api_key: values.com_claude_api_key,
      com_claude_model: values.com_claude_model,
      com_claude_timeout: values.com_claude_timeout,
      com_claude_enable_disable: toggles.claude_enable_disable,
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
          {/* ── OpenAI Section ── */}
          <Card className="mt-4">
            <CardContent className="p-2 md:p-4 lg:p-4">
              <h3 className="text-base font-semibold mb-4">OpenAI</h3>
              <div dir={dir} className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="com_openai_api_key" className="text-sm font-medium mb-1 block">
                      {t('label.openai_api_key')}
                    </label>
                    <Input
                      id="com_openai_api_key"
                      {...register('com_openai_api_key' as keyof OpenAISettingsFormData)}
                      className="app-input"
                      placeholder={t('place_holder.enter_value')}
                    />
                  </div>

                  <div>
                    <label htmlFor="com_openai_model" className="text-sm font-medium mb-1 block">
                      {t('label.openai_model')}
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

                  <div>
                    <label htmlFor="com_openai_timeout" className="text-sm font-medium mb-1 block">
                      {t('label.openai_timeout')}
                    </label>
                    <Input
                      type="number"
                      id="com_openai_timeout"
                      {...register('com_openai_timeout' as keyof OpenAISettingsFormData)}
                      className="app-input"
                      placeholder={t('place_holder.enter_value')}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex flex-col md:flex-row items-start gap-2 md:gap-6">
                    <label className="text-sm font-medium mb-1 block">
                      {t('label.openai_enable_disable')}
                    </label>
                    <Switch
                      dir="ltr"
                      checked={toggles.openai_enable_disable === 'on'}
                      onCheckedChange={() => handleToggle('openai_enable_disable')}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Claude (Anthropic) Section ── */}
          <Card className="mt-4">
            <CardContent className="p-2 md:p-4 lg:p-4">
              <h3 className="text-base font-semibold mb-4">Claude (Anthropic)</h3>
              <div dir={dir} className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="com_claude_api_key" className="text-sm font-medium mb-1 block">
                      {t('label.claude_api_key')}
                    </label>
                    <Input
                      id="com_claude_api_key"
                      {...register('com_claude_api_key' as keyof OpenAISettingsFormData)}
                      className="app-input"
                      placeholder={t('place_holder.enter_value')}
                    />
                  </div>

                  <div>
                    <label htmlFor="com_claude_model" className="text-sm font-medium mb-1 block">
                      {t('label.claude_model')}
                    </label>
                    <Controller
                      control={control}
                      name="com_claude_model"
                      defaultValue={QueryOpenAISettingsData?.data?.com_claude_model ?? ''}
                      render={({ field }) => (
                        <AppSearchSelect
                          value={String(field.value ?? '')}
                          onSelect={(value) => {
                            field.onChange(value);
                            handleSelectItem(value, 'com_claude_model');
                          }}
                          groups={ClaudeModelList}
                          hideNone
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label htmlFor="com_claude_timeout" className="text-sm font-medium mb-1 block">
                      {t('label.claude_timeout')}
                    </label>
                    <Input
                      type="number"
                      id="com_claude_timeout"
                      {...register('com_claude_timeout' as keyof OpenAISettingsFormData)}
                      className="app-input"
                      placeholder={t('place_holder.enter_value')}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex flex-col md:flex-row items-start gap-2 md:gap-6">
                    <label className="text-sm font-medium mb-1 block">
                      {t('label.claude_enable_disable')}
                    </label>
                    <Switch
                      dir="ltr"
                      checked={toggles.claude_enable_disable === 'on'}
                      onCheckedChange={() => handleToggle('claude_enable_disable')}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Card className="mt-4 sticky bottom-0 w-full p-4">
            <SubmitButton IsLoading={isPending} AddLabel={t('button.save_changes')} />
          </Card>
        </form>
      )}
    </div>
  );
};

export default OpenAISettingsForm;
