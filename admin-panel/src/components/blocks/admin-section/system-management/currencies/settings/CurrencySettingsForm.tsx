'use client';
import { AppSelect } from '@/components/blocks/common';
import { SubmitButton } from '@/components/blocks/shared';
import {
  Card,
  CardContent,
} from '@/components/ui';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import {
  CurrencySettingsFormData,
  paymentSettingsSchema,
} from '@/modules/admin-section/system-management/currency/settings/settings.schema';
import {
  usePaymentSettingsQuery,
  usePaymentSettingsStoreMutation,
} from '@/modules/admin-section/system-management/currency/settings/settings.action';
import { useCurrencyDropdownListQuery } from '@/modules/common/com/com.action';
import CardSkletonLoader from '@/components/molecules/CardSkletonLoader';

const CurrencySettingsForm = () => {
  const t = useTranslations();
  const { control, register, setValue, handleSubmit } = useForm<CurrencySettingsFormData>({
    resolver: zodResolver(paymentSettingsSchema),
  });
  const { currencyDropdownList, refetch: refetchCurrency } = useCurrencyDropdownListQuery({});
  const currencyData = useMemo(() => {
    const data = (currencyDropdownList as any) || {};
    return data;
  }, [currencyDropdownList]);
  const CurrencyData = currencyData.data;

  const { paymentSettingsData, refetch, isPending } = usePaymentSettingsQuery({
    currency_settings: 'get',
  });

  const QueryPaymentSettingsData = useMemo(
    () => (paymentSettingsData as any) || [],
    [paymentSettingsData],
  );

  const currencySettingsMessage = QueryPaymentSettingsData?.currency_settings;
  useEffect(() => {
    if (currencySettingsMessage) {
      setValue('currency_settings', 'update');
      setValue(
        'com_site_default_currency_to_usd_exchange_rate',
        currencySettingsMessage?.com_site_default_currency_to_usd_exchange_rate ?? '',
      );
      setValue(
        'com_site_default_currency_to_myr_exchange_rate',
        currencySettingsMessage?.com_site_default_currency_to_myr_exchange_rate ?? '',
      );
      setValue(
        'com_site_default_currency_to_brl_exchange_rate',
        currencySettingsMessage?.com_site_default_currency_to_brl_exchange_rate ?? '',
      );
      setValue(
        'com_site_default_currency_to_zar_exchange_rate',
        currencySettingsMessage?.com_site_default_currency_to_zar_exchange_rate ?? '',
      );
      setValue(
        'com_site_default_currency_to_ngn_exchange_rate',
        currencySettingsMessage?.com_site_default_currency_to_ngn_exchange_rate ?? '',
      );
    }
  }, [QueryPaymentSettingsData, setValue, currencySettingsMessage]);

  const { mutate: PaymentSettingsStore, isPending: isUpdating } = usePaymentSettingsStoreMutation();
  const onSubmit = async (values: CurrencySettingsFormData) => {
    const defaultData = {
      currency_settings: values.currency_settings,
      com_site_global_currency: values.com_site_global_currency,
      com_site_space_between_amount_and_symbol: values.com_site_space_between_amount_and_symbol,
      com_site_enable_disable_decimal_point: values.com_site_enable_disable_decimal_point,
      com_site_comma_form_adjustment_amount: values.com_site_comma_form_adjustment_amount,
      com_site_currency_symbol_position: values.com_site_currency_symbol_position,
      com_site_default_currency_to_usd_exchange_rate:
        values.com_site_default_currency_to_usd_exchange_rate,
      com_site_default_currency_to_myr_exchange_rate:
        values.com_site_default_currency_to_myr_exchange_rate,
      com_site_default_currency_to_brl_exchange_rate:
        values.com_site_default_currency_to_brl_exchange_rate,
      com_site_default_currency_to_zar_exchange_rate:
        values.com_site_default_currency_to_zar_exchange_rate,
      com_site_default_currency_to_ngn_exchange_rate:
        values.com_site_default_currency_to_ngn_exchange_rate,
    };
    const submissionData = {
      ...defaultData,
    };
    return PaymentSettingsStore(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          refetch();
        },
      },
    );
  };

  const yesnolist = [
    { label: t('label.yes') || 'Evet', value: 'YES' },
    { label: t('label.no') || 'Hayır', value: 'NO' },
  ];
  const leftRightlist = [
    { label: t('label.left'), value: 'left' },
    { label: t('label.right'), value: 'right' },
  ];
  const handleSelectItem = (value: string, label: any) => {
    setValue(label, value);
  };

  return (
    <div>
      {isPending ? (
        <CardSkletonLoader CustomClass="!p-0 !shadow-none" />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="">
            <div>
              <div className="mb-4">
                <p className="text-sm font-medium mb-1 flex items-center gap-2">
                  <span>{t('label.site_global_currency')}</span>
                </p>
                <Controller
                  control={control}
                  name="com_site_global_currency"
                  defaultValue={currencySettingsMessage?.com_site_global_currency || ''}
                  render={({ field }) => (
                    <>
                      <AppSelect
                        value={field.value || ''}
                        onSelect={(value) => {
                          field.onChange(value);
                          handleSelectItem(value, 'com_site_global_currency');
                        }}
                        groups={CurrencyData}
                      />
                    </>
                  )}
                />
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium mb-1 flex items-center gap-2">
                  <span>{t('label.enable_disable_decimal_point')}</span>
                </p>
                <Controller
                  control={control}
                  name="com_site_enable_disable_decimal_point"
                  defaultValue={
                    currencySettingsMessage?.com_site_enable_disable_decimal_point || ''
                  }
                  render={({ field }) => (
                    <>
                      <AppSelect
                        value={field.value || ''}
                        onSelect={(value) => {
                          field.onChange(value);
                          handleSelectItem(value, 'com_site_enable_disable_decimal_point');
                        }}
                        groups={yesnolist}
                      />
                    </>
                  )}
                />
              </div>
              <Card className="mb-4 dark:bg-gray-700">
                <CardContent className="p-4">
                  <p className="text-base font-medium mb-2">{t('label.note')}:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-white">
                    <li>{t('label.decimal_note_yes')}</li>
                    <li>{t('label.decimal_note_no')}</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="mb-4">
                <p className="text-sm font-medium mb-1 flex items-center gap-2">
                  <span>{t('label.space_between_currency_symbol_and_amount')}</span>
                </p>
                <Controller
                  control={control}
                  name="com_site_space_between_amount_and_symbol"
                  defaultValue={
                    currencySettingsMessage?.com_site_space_between_amount_and_symbol || ''
                  }
                  render={({ field }) => (
                    <>
                      <AppSelect
                        value={field.value || ''}
                        onSelect={(value) => {
                          field.onChange(value);
                          handleSelectItem(value, 'com_site_space_between_amount_and_symbol');
                        }}
                        groups={yesnolist}
                      />
                    </>
                  )}
                />
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium mb-1 flex items-center gap-2">
                  <span>{t('label.comma_from_amount')}</span>
                </p>
                <Controller
                  control={control}
                  name="com_site_comma_form_adjustment_amount"
                  defaultValue={
                    currencySettingsMessage?.com_site_comma_form_adjustment_amount || ''
                  }
                  render={({ field }) => (
                    <>
                      <AppSelect
                        value={field.value || ''}
                        onSelect={(value) => {
                          field.onChange(value);
                          handleSelectItem(value, 'com_site_comma_form_adjustment_amount');
                        }}
                        groups={yesnolist}
                      />
                    </>
                  )}
                />
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium mb-1 flex items-center gap-2">
                  <span>{t('label.currency_symbol_position')}</span>
                </p>
                <Controller
                  control={control}
                  name="com_site_currency_symbol_position"
                  defaultValue={currencySettingsMessage?.com_site_currency_symbol_position || ''}
                  render={({ field }) => (
                    <>
                      <AppSelect
                        value={field.value || ''}
                        onSelect={(value) => {
                          field.onChange(value);
                          handleSelectItem(value, 'com_site_currency_symbol_position');
                        }}
                        groups={leftRightlist}
                      />
                    </>
                  )}
                />
              </div>
              <div className="mt-4">
                <SubmitButton IsLoading={isUpdating} AddLabel={t('button.save_changes')} />
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default CurrencySettingsForm;
