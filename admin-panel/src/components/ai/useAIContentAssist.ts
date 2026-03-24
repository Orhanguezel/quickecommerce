'use client';

import { useState, useCallback } from 'react';

export type AIAction = 'full' | 'enhance' | 'translate' | 'generate_meta';

export interface LocaleContent {
  name?: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  return_text?: string;
  delivery_time_text?: string;
}

export interface AIParams {
  product_name: string;
  category_name?: string;
  existing_content?: Record<string, Partial<LocaleContent>>;
  source_locale?: string;
}

type MutateFn = (payload: any, options: { onSuccess: (res: any) => void; onError: (err: any) => void }) => void;

export function useAIContentAssist(mutate: MutateFn) {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Record<string, LocaleContent> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const assist = useCallback(
    (action: AIAction, params: AIParams) => {
      setIsLoading(true);
      setError(null);
      setResults(null);

      const payload: any = {
        action,
        product_name: params.product_name,
      };
      if (params.category_name) payload.category_name = params.category_name;
      if (params.existing_content) payload.existing_content = params.existing_content;
      if (params.source_locale) payload.source_locale = params.source_locale;

      mutate(payload, {
        onSuccess: (res: any) => {
          const data = res?.data;
          // Action-based response has "results" key
          if (data?.results && typeof data.results === 'object') {
            setResults(data.results);
          } else if (data?.generated_content) {
            // Fallback: try to parse generated_content as JSON
            try {
              const text = String(data.generated_content).trim();
              let parsed = null;
              try {
                parsed = JSON.parse(text);
              } catch {
                const first = text.indexOf('{');
                const last = text.lastIndexOf('}');
                if (first >= 0 && last > first) {
                  try {
                    parsed = JSON.parse(text.slice(first, last + 1));
                  } catch {}
                }
              }
              if (parsed && typeof parsed === 'object') {
                setResults(parsed);
              } else {
                setError('Could not parse AI response');
              }
            } catch {
              setError('Could not parse AI response');
            }
          } else {
            setError(data?.message || 'Unknown error');
          }
          setIsLoading(false);
        },
        onError: (err: any) => {
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            'AI generation failed';
          setError(msg);
          setIsLoading(false);
        },
      });
    },
    [mutate]
  );

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return { assist, results, isLoading, error, clearResults };
}
