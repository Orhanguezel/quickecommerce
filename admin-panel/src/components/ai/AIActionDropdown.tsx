'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui';
import {
  Sparkles,
  Wand2,
  Languages,
  Search,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { AIAction } from './useAIContentAssist';

interface AIActionDropdownProps {
  onAction: (action: AIAction) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const ACTIONS: { action: AIAction; icon: typeof Sparkles; labelKey: string; descKey: string }[] = [
  { action: 'full', icon: Sparkles, labelKey: 'ai_generate_full', descKey: 'ai_generate_full_desc' },
  { action: 'enhance', icon: Wand2, labelKey: 'ai_enhance', descKey: 'ai_enhance_desc' },
  { action: 'translate', icon: Languages, labelKey: 'ai_translate', descKey: 'ai_translate_desc' },
  { action: 'generate_meta', icon: Search, labelKey: 'ai_generate_meta', descKey: 'ai_generate_meta_desc' },
];

export function AIActionDropdown({ onAction, isLoading, disabled }: AIActionDropdownProps) {
  const t = useTranslations();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled || isLoading}
          className="border-violet-300 text-violet-700 hover:bg-violet-50 hover:text-violet-800 dark:border-violet-600 dark:text-violet-300 dark:hover:bg-violet-950 dark:hover:text-violet-200"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {isLoading ? t('label.ai_generating') : t('label.ai_assistant')}
          <ChevronDown className="ml-2 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        {ACTIONS.map(({ action, icon: Icon, labelKey, descKey }) => (
          <DropdownMenuItem
            key={action}
            onClick={() => onAction(action)}
            disabled={isLoading}
            className="flex items-start gap-3 py-3 cursor-pointer"
          >
            <Icon className="h-5 w-5 mt-0.5 text-violet-600 dark:text-violet-400 shrink-0" />
            <div>
              <div className="font-medium text-sm">{t(`label.${labelKey}`)}</div>
              <div className="text-xs text-muted-foreground">{t(`label.${descKey}`)}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
