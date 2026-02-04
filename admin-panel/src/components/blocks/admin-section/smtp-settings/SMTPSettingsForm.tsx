'use client';
import Loader from '@/components/molecules/Loader';
import { AppSelect } from '@/components/blocks/common';
import { SubmitButton } from '@/components/blocks/shared';
import { Card, CardContent, Input } from '@/components/ui';
import {
  useSMTPSettingsQuery,
  useSMTPSettingsStoreMutation,
  useTestSMTPSettingsStoreMutation,
} from '@/modules/admin-section/smtp-settings/smtp-settings.action';
import {
  SMTPSettingsFormData,
  smtpSettingsSchema,
  TestSMTPSettingsFormData,
  testSmtpSettingsSchema,
} from '@/modules/admin-section/smtp-settings/smtp-settings.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import CardSkletonLoader from '@/components/molecules/CardSkletonLoader';

const MailerList = [
  { label: 'SMTP', value: 'smtp' },
  { label: 'SendMail', value: 'sendmail' },
  { label: 'Mailgun', value: 'mailgun' },
  { label: 'Postmark', value: 'postmark' },
];
const MailerPortList = [
  { label: '587', value: '587' },
  { label: '465', value: '465' },
  { label: '25', value: '25' },
  { label: '2525', value: '2525' },
];
const MailerEncryptionList = [
  { label: 'SSL', value: 'ssl' },
  { label: 'TLS', value: 'tls' },
  { label: 'none', value: 'None' },
];

const SMTPSettingsForm = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const {
    control: controlSMTP,
    register: registerSMTP,
    setValue: setValueSMTP,
    handleSubmit: handleSubmitSMTP,
  } = useForm<SMTPSettingsFormData>({
    resolver: zodResolver(smtpSettingsSchema),
  });

  const { register: registerSMTPTest, handleSubmit: handleSubmitSMTPTest } =
    useForm<TestSMTPSettingsFormData>({
      resolver: zodResolver(testSmtpSettingsSchema),
    });

  const { smtpData, refetch, isPending: isQuerying } = useSMTPSettingsQuery({});
  const QueryGeneralSettingsData = useMemo(() => (smtpData as any) || [], [smtpData]);

  let GeneralSettingsMessage = QueryGeneralSettingsData?.message;
  useEffect(() => {
    if (GeneralSettingsMessage) {
      setValueSMTP('com_site_global_email', GeneralSettingsMessage?.com_site_global_email ?? '');
      setValueSMTP(
        'com_site_smtp_mail_mailer',
        GeneralSettingsMessage?.com_site_smtp_mail_mailer ?? '',
      );
      setValueSMTP(
        'com_site_smtp_mail_host',
        GeneralSettingsMessage?.com_site_smtp_mail_host ?? '',
      );
      setValueSMTP(
        'com_site_smtp_mail_post',
        GeneralSettingsMessage?.com_site_smtp_mail_post ?? '',
      );
      setValueSMTP(
        'com_site_smtp_mail_username',
        GeneralSettingsMessage?.com_site_smtp_mail_username ?? '',
      );
      setValueSMTP(
        'com_site_smtp_mail_password',
        GeneralSettingsMessage?.com_site_smtp_mail_password ?? '',
      );
      setValueSMTP(
        'com_site_smtp_mail_encryption',
        GeneralSettingsMessage?.com_site_smtp_mail_encryption ?? '',
      );
    }
  }, [QueryGeneralSettingsData, GeneralSettingsMessage, setValueSMTP]);

  const handleSelectItem = (value: string, inputType: string) => {
    setValueSMTP(inputType as any, value);
  };

  const { mutate: SMTPStore, isPending } = useSMTPSettingsStoreMutation();
  const onSMTPSubmit = async (values: SMTPSettingsFormData) => {
    const defaultData = {
      ...values,
    };

    return SMTPStore(
      { ...(values as any) },
      {
        onSuccess: () => {
          refetch();
        },
      },
    );
  };
  const { mutate: TestSMTPStore, isPending: isTestSmtpPending } =
    useTestSMTPSettingsStoreMutation();
  const onSMTPTestSubmit = async (values: TestSMTPSettingsFormData) => {
    const defaultData = {
      ...values,
    };

    return TestSMTPStore(
      { ...(values as any) },
      {
        onSuccess: () => {
          refetch();
        },
      },
    );
  };

  useEffect(() => {
    if (!isQuerying) refetch();
  }, [isQuerying, refetch]);

  return (
    <div>
      {isQuerying ? (
        <CardSkletonLoader />
      ) : (
        <>
          <form onSubmit={handleSubmitSMTP(onSMTPSubmit)}>
            <Card>
              <CardContent className="p-2 md:p-6">
                <div dir={dir}>
                  <p className="text-lg md:text-2xl font-medium mb-4">{t('label.smtp_settings')}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">{t('label.global_mail')}</p>
                      <Input
                        id="com_site_global_email"
                        {...registerSMTP('com_site_global_email' as keyof SMTPSettingsFormData)}
                        className="app-input"
                        placeholder={t('place_holder.enter_value')}
                      />
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">{t('label.smtp_mail_mailer')}</p>
                      <Controller
                        control={controlSMTP}
                        name="com_site_smtp_mail_mailer"
                        defaultValue={GeneralSettingsMessage?.com_site_smtp_mail_mailer ?? ''}
                        render={({ field }) => (
                          <>
                            <AppSelect
                              value={field.value || ''}
                              onSelect={(value) => {
                                field.onChange(value);
                                handleSelectItem(value, 'com_site_smtp_mail_mailer');
                              }}
                              groups={MailerList}
                            />
                          </>
                        )}
                      />
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">{t('label.smtp_mail_host')}</p>
                      <Input
                        id="com_site_smtp_mail_host"
                        {...registerSMTP('com_site_smtp_mail_host' as keyof SMTPSettingsFormData)}
                        className="app-input"
                        placeholder={t('place_holder.enter_value')}
                      />
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">{t('label.smtp_mail_post')}</p>
                      <Controller
                        control={controlSMTP}
                        name="com_site_smtp_mail_post"
                        defaultValue={GeneralSettingsMessage?.com_site_smtp_mail_post ?? ''}
                        render={({ field }) => (
                          <>
                            <AppSelect
                              value={field.value || ''}
                              onSelect={(value) => {
                                field.onChange(value);
                                handleSelectItem(value, 'com_site_smtp_mail_post');
                              }}
                              groups={MailerPortList}
                            />
                          </>
                        )}
                      />
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">{t('label.smtp_mail_username')}</p>
                      <Input
                        id="com_site_smtp_mail_username"
                        {...registerSMTP(
                          'com_site_smtp_mail_username' as keyof SMTPSettingsFormData,
                        )}
                        className="app-input"
                        placeholder={t('place_holder.enter_value')}
                      />
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">{t('label.smtp_mail_password')}</p>
                      <Input
                        id="com_site_smtp_mail_password"
                        {...registerSMTP(
                          'com_site_smtp_mail_password' as keyof SMTPSettingsFormData,
                        )}
                        className="app-input"
                        placeholder={t('place_holder.enter_value')}
                      />
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">{t('label.smtp_mail_encryption')}</p>
                      <Controller
                        control={controlSMTP}
                        name="com_site_smtp_mail_encryption"
                        defaultValue={GeneralSettingsMessage?.com_site_smtp_mail_encryption ?? ''}
                        render={({ field }) => (
                          <>
                            <AppSelect
                              value={field.value || ''}
                              onSelect={(value) => {
                                field.onChange(value);
                                handleSelectItem(value, 'com_site_smtp_mail_encryption');
                              }}
                              groups={MailerEncryptionList}
                            />
                          </>
                        )}
                      />
                    </div>
                  </div>
                  <SubmitButton IsLoading={isPending} AddLabel={t('button.save_changes')} />
                </div>
              </CardContent>
            </Card>
          </form>
          <form onSubmit={handleSubmitSMTPTest(onSMTPTestSubmit)}>
            <Card className="mt-4">
              <CardContent className="p-2 md:p-6">
                <div>
                  <div dir={dir}>
                    <p className="text-lg md:text-2xl font-medium mb-4">{t('label.smtp_test')}</p>
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">{t('label.global_mail')}</p>
                      <Input
                        id="test_email"
                        {...registerSMTPTest('test_email' as keyof TestSMTPSettingsFormData)}
                        className="app-input"
                        placeholder={t('place_holder.enter_email')}
                      />
                    </div>
                    <div className="mt-4">
                      <SubmitButton IsLoading={isTestSmtpPending} AddLabel={t('button.send')} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </>
      )}
    </div>
  );
};

export default SMTPSettingsForm;
