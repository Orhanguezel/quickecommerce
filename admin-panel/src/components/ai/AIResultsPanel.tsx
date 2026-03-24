'use client';

import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { Check, Copy, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { LocaleContent } from './useAIContentAssist';

const LOCALE_FLAGS: Record<string, string> = {
  tr: '🇹🇷',
  en: '🇬🇧',
  de: '🇩🇪',
  fr: '🇫🇷',
  ar: '🇸🇦',
};

const LOCALE_LABELS: Record<string, string> = {
  tr: 'Türkçe',
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  ar: 'العربية',
};

const FIELD_KEYS: (keyof LocaleContent)[] = [
  'name',
  'slug',
  'description',
  'short_description',
  'meta_title',
  'meta_description',
  'meta_keywords',
];

const FIELD_LABEL_MAP: Record<string, string> = {
  name: 'product_name',
  slug: 'slug',
  description: 'product_description',
  short_description: 'short_description',
  meta_title: 'meta_title',
  meta_description: 'meta_description',
  meta_keywords: 'meta_keywords',
};

interface AIResultsPanelProps {
  results: Record<string, LocaleContent>;
  onApplyField: (locale: string, field: keyof LocaleContent, value: any) => void;
  onApplyAll: (locale: string, content: LocaleContent) => void;
  onClose: () => void;
}

export function AIResultsPanel({ results, onApplyField, onApplyAll, onClose }: AIResultsPanelProps) {
  const t = useTranslations();
  const locales = Object.keys(results);
  const [appliedFields, setAppliedFields] = useState<Set<string>>(new Set());

  if (locales.length === 0) return null;

  const markApplied = (key: string) => {
    setAppliedFields((prev) => new Set(prev).add(key));
  };

  const renderValue = (field: keyof LocaleContent, value: any) => {
    if (field === 'meta_keywords' && Array.isArray(value)) {
      return value.join(', ');
    }
    if (field === 'description' && typeof value === 'string') {
      return (
        <div
          className="prose prose-sm dark:prose-invert max-w-none max-h-40 overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      );
    }
    return String(value ?? '');
  };

  return (
    <div className="mt-4 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/30">
      <div className="flex items-center justify-between px-4 py-3 border-b border-violet-200 dark:border-violet-800">
        <h3 className="text-sm font-semibold text-violet-800 dark:text-violet-200 flex items-center gap-2">
          ✨ {t('label.ai_results')}
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-7 w-7 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue={locales[0]} className="p-4">
        <TabsList className="mb-4">
          {locales.map((locale) => (
            <TabsTrigger key={locale} value={locale} className="gap-1.5">
              <span>{LOCALE_FLAGS[locale] ?? '🌐'}</span>
              <span>{LOCALE_LABELS[locale] ?? locale.toUpperCase()}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {locales.map((locale) => {
          const content = results[locale];
          if (!content) return null;

          return (
            <TabsContent key={locale} value={locale} className="space-y-3">
              {FIELD_KEYS.map((field) => {
                const value = content[field];
                if (value === undefined || value === null || value === '') return null;

                const fieldKey = `${locale}:${field}`;
                const isApplied = appliedFields.has(fieldKey);

                return (
                  <div
                    key={field}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {t(`label.${FIELD_LABEL_MAP[field]}` as any)}
                      </span>
                      <Button
                        type="button"
                        variant={isApplied ? 'default' : 'outline'}
                        size="sm"
                        className={`h-7 text-xs ${
                          isApplied
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-600 dark:text-violet-300'
                        }`}
                        onClick={() => {
                          onApplyField(locale, field, value);
                          markApplied(fieldKey);
                        }}
                      >
                        {isApplied ? (
                          <>
                            <Check className="mr-1 h-3 w-3" /> {t('label.ai_applied')}
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 h-3 w-3" /> {t('label.ai_apply')}
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="text-sm text-foreground">
                      {renderValue(field, value)}
                    </div>
                  </div>
                );
              })}

              <div className="pt-2">
                <Button
                  type="button"
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                  onClick={() => {
                    onApplyAll(locale, content);
                    FIELD_KEYS.forEach((f) => {
                      if (content[f] !== undefined) markApplied(`${locale}:${f}`);
                    });
                  }}
                >
                  <Check className="mr-2 h-4 w-4" />
                  {t('label.ai_apply_all')} ({LOCALE_LABELS[locale] ?? locale.toUpperCase()})
                </Button>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
